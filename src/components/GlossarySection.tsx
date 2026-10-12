import React, { useState } from "react";
import { Search, Book, Volume2, Sparkles, Filter } from "lucide-react";
import { SWEDISH_GLOSSARY } from "../data/glossary";
import { CategoryId } from "../types";
import { AudioPlayerButton } from "./AudioPlayerButton";

interface GlossarySectionProps {
  onSelectCategory?: (id: CategoryId) => void;
  initialSearchTerm?: string;
}

export const GlossarySection: React.FC<GlossarySectionProps> = ({
  initialSearchTerm = "",
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>("all");

  React.useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  const filteredGlossary = SWEDISH_GLOSSARY.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.arabic.includes(searchTerm) ||
      item.description.includes(searchTerm) ||
      (item.pronunciation && item.pronunciation.includes(searchTerm));

    const matchesCat =
      selectedCatFilter === "all" || item.category === selectedCatFilter;

    return matchesSearch && matchesCat;
  });

  return (
    <section id="swedish-glossary-section" className="w-full space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-mono font-bold px-3.5 py-1 rounded-full bg-[#F0F7FF] text-[#005293]">
                Svensk-Arabisk Ordlista
              </span>
              <span className="text-xs sm:text-sm text-gray-500 font-medium">لأولياء الأمور والقادمين الجدد</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#003C6E]">
              قاموس المصطلحات والمؤسسات السويدية
            </h2>
            <p className="text-base sm:text-lg text-[#2D3748] max-w-3xl leading-[1.75] font-medium">
              افهم الكلمات السويدية التي تصادفها في خطابات البريد، المدرسة، المستشفيات، وبلدية منطقتك، مع طريقة النطق والمعنى العملي.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
            <input
              id="glossary-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بالسويدية أو العربية (مثال: Socialtjänsten, Skolplikt, BVC, سوسيال...)"
              className="w-full pl-4 pr-12 py-3.5 rounded-full border border-gray-200 text-sm sm:text-base focus:border-[#005293] focus:ring-2 focus:ring-blue-100 transition-all bg-[#F8FAFC]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCatFilter("all")}
              className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer min-h-[40px] ${
                selectedCatFilter === "all"
                  ? "bg-[#005293] text-white shadow-xs"
                  : "bg-gray-100 text-[#4A5568] hover:bg-gray-200"
              }`}
            >
              الكل ({SWEDISH_GLOSSARY.length})
            </button>
            <button
              onClick={() => setSelectedCatFilter("school")}
              className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer min-h-[40px] ${
                selectedCatFilter === "school"
                  ? "bg-[#005293] text-white shadow-xs"
                  : "bg-[#F0F7FF] text-[#005293] hover:bg-blue-100"
              }`}
            >
              المدرسة (Skola)
            </button>
            <button
              onClick={() => setSelectedCatFilter("social-services")}
              className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer min-h-[40px] ${
                selectedCatFilter === "social-services"
                  ? "bg-[#005293] text-white shadow-xs"
                  : "bg-[#EAF6ED] text-[#1E7E34] hover:bg-emerald-100"
              }`}
            >
              السوسيال (Socialen)
            </button>
            <button
              onClick={() => setSelectedCatFilter("child-rights")}
              className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer min-h-[40px] ${
                selectedCatFilter === "child-rights"
                  ? "bg-[#005293] text-white shadow-xs"
                  : "bg-[#FFFBEB] text-[#92400E] hover:bg-amber-100"
              }`}
            >
              حقوق الطفل (Barn)
            </button>
          </div>
        </div>

        {/* Glossary Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGlossary.map((item, index) => {
            const audioText = `${item.term}. باللغة العربية: ${item.arabic}. ${item.description}`;

            return (
              <div
                key={index}
                id={`glossary-item-${index}`}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 hover:border-[#005293] shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-lg sm:text-xl font-bold font-mono text-[#005293] tracking-tight">
                        {item.term}
                      </span>
                      {item.pronunciation && (
                        <span className="block text-xs sm:text-sm text-gray-500 font-medium mt-1">
                          النطق التقريبي: <span className="text-[#2D3748] font-bold">({item.pronunciation})</span>
                        </span>
                      )}
                    </div>

                    <AudioPlayerButton
                      textToRead={audioText}
                      label=""
                      size="sm"
                    />
                  </div>

                  <h4 className="text-base sm:text-lg font-black text-[#1e293b] mt-2.5 border-r-3 border-[#005293] pr-2.5">
                    {item.arabic}
                  </h4>

                  <p className="text-sm sm:text-base text-[#2D3748] mt-2.5 leading-[1.7]">
                    {item.description}
                  </p>
                </div>

                {item.exampleInSwedish && (
                  <div className="mt-4 pt-3.5 border-t border-gray-100 text-xs sm:text-sm bg-[#F8FAFC] p-3.5 rounded-2xl">
                    <span className="font-bold text-[#2D3748] block mb-1">مثال في جملة:</span>
                    <span className="font-mono text-[#005293] font-medium block" dir="ltr">
                      "{item.exampleInSwedish}"
                    </span>
                    {item.exampleInArabic && (
                      <span className="text-gray-600 block mt-1 leading-relaxed">
                        «{item.exampleInArabic}»
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredGlossary.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Book className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="font-bold">لم يتم العثور على نتائج للبحث</p>
            <p className="text-xs mt-1">جرب البحث بكلمة سويدية أو عربية أخرى</p>
          </div>
        )}
      </div>
    </section>
  );
};
