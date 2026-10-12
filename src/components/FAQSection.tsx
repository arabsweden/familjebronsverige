import React, { useState, useMemo } from "react";
import {
  HelpCircle,
  ChevronDown,
  Search,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Lightbulb,
  Shield,
  Layers,
  ArrowRight
} from "lucide-react";
import { CategoryId, FAQItem } from "../types";
import { FAQS_DATA } from "../data/faqs";
import { CATEGORIES } from "../data/categories";
import { AudioPlayerButton } from "./AudioPlayerButton";

interface FAQSectionProps {
  onAskQuestion?: (prefill?: string, categoryId?: CategoryId) => void;
  onExploreCategory?: (categoryId: CategoryId) => void;
  initialCategoryFilter?: CategoryId | "all";
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  onAskQuestion,
  onExploreCategory,
  initialCategoryFilter = "all",
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "all">(initialCategoryFilter);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFaqIds, setExpandedFaqIds] = useState<Record<string, boolean>>({
    // Open the first one by default for immediate preview
    "faq-orosanmalan-notice": true,
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setExpandedFaqIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    FAQS_DATA.forEach((faq) => {
      allExpanded[faq.id] = true;
    });
    setExpandedFaqIds(allExpanded);
  };

  const collapseAll = () => {
    setExpandedFaqIds({});
  };

  const handleCopy = (faq: FAQItem) => {
    const textToCopy = `سؤال: ${faq.questionArabic}\n\nالإجابة:\n${faq.answerSummary}\n\nالتفاصيل:\n${faq.detailedPoints.map((p) => `• ${p}`).join("\n")}\n\nنصيحة عملية: ${faq.practicalAdvice}\n\nالمصدر: دليل الأسرة في السويد`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(faq.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredFaqs = useMemo(() => {
    return FAQS_DATA.filter((faq) => {
      const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
      const search = searchTerm.trim().toLowerCase();
      if (!search) return matchesCategory;

      const matchesSearch =
        faq.questionArabic.toLowerCase().includes(search) ||
        (faq.questionSwedish && faq.questionSwedish.toLowerCase().includes(search)) ||
        faq.answerSummary.toLowerCase().includes(search) ||
        faq.detailedPoints.some((p) => p.toLowerCase().includes(search)) ||
        faq.practicalAdvice.toLowerCase().includes(search) ||
        faq.tags.some((t) => t.toLowerCase().includes(search)) ||
        (faq.swedishTerms && faq.swedishTerms.some((t) => t.term.toLowerCase().includes(search) || t.arabic.toLowerCase().includes(search)));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  // Counts by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: FAQS_DATA.length };
    FAQS_DATA.forEach((faq) => {
      counts[faq.category] = (counts[faq.category] || 0) + 1;
    });
    return counts;
  }, []);

  const getCategoryTitle = (catId: CategoryId) => {
    const cat = CATEGORIES.find((c) => c.id === catId);
    return cat ? cat.titleArabic : catId;
  };

  return (
    <section id="faq-section" className="w-full space-y-6" dir="rtl">
      <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm border border-gray-100">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-mono font-bold px-3.5 py-1 rounded-full bg-[#EAF6ED] text-[#1E7E34] border border-[#D1EAD8]">
                Vanliga frågor och svar (FAQ)
              </span>
              <span className="text-xs sm:text-sm text-gray-500 font-medium">
                مستخلصة من استفسارات العائلات الحقيقية
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#003C6E]">
              الأسئلة الشائعة وإجاباتها القانونية والتربوية
            </h2>
            <p className="text-base sm:text-lg text-[#2D3748] max-w-3xl leading-[1.75] font-medium">
              إجابات دقيقة ومطمئنة على أكثر التساؤلات إلحاحاً حول السوسيال، المدرسة، حقوق الحضانة، حظر العقاب، والتعويضات اليومية في السويد.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={expandAll}
              className="text-xs sm:text-sm font-bold text-[#005293] hover:bg-[#F0F7FF] px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              فتح الكل
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={collapseAll}
              className="text-xs sm:text-sm font-bold text-gray-500 hover:bg-gray-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              إغلاق الكل
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
            <input
              id="faq-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث في الأسئلة الشائعة (مثال: سوسيال، غياب المدرسة، VAB، طلاق، ضرب، 1177...)"
              className="w-full pl-4 pr-12 py-3.5 rounded-full border border-gray-200 text-sm sm:text-base focus:border-[#005293] focus:ring-2 focus:ring-blue-100 transition-all bg-[#F8FAFC] font-medium"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              id="faq-filter-all"
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer min-h-[40px] flex items-center gap-1.5 ${
                selectedCategory === "all"
                  ? "bg-[#005293] text-white shadow-xs"
                  : "bg-gray-100 text-[#4A5568] hover:bg-gray-200"
              }`}
            >
              <span>جميع الأسئلة</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[11px] ${selectedCategory === "all" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"}`}>
                {categoryCounts.all}
              </span>
            </button>

            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                id={`faq-filter-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer min-h-[40px] flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? "bg-[#005293] text-white shadow-xs"
                    : "bg-[#F0F7FF] text-[#005293] hover:bg-blue-100"
                }`}
              >
                <span>{cat.titleArabic}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[11px] ${selectedCategory === cat.id ? "bg-white/20 text-white" : "bg-blue-100 text-[#005293]"}`}>
                  {categoryCounts[cat.id] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Accordion List */}
        <div className="mt-8 space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isExpanded = !!expandedFaqIds[faq.id];
              const isCopied = copiedId === faq.id;

              return (
                <div
                  key={faq.id}
                  id={`faq-item-${faq.id}`}
                  className={`rounded-3xl border transition-all overflow-hidden ${
                    isExpanded
                      ? "border-[#005293] bg-white shadow-sm ring-1 ring-blue-100"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  {/* Accordion Header Button */}
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full text-right p-5 sm:p-6 flex items-start justify-between gap-4 cursor-pointer select-none"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-start gap-3.5 flex-1">
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isExpanded
                            ? "bg-[#005293] text-white"
                            : "bg-[#F0F7FF] text-[#005293]"
                        }`}
                      >
                        <HelpCircle className="w-5 h-5" />
                      </div>

                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                            {getCategoryTitle(faq.category)}
                          </span>
                          {faq.questionSwedish && (
                            <span className="text-xs font-mono font-medium text-gray-500 hidden sm:inline-block" dir="ltr">
                              {faq.questionSwedish}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base sm:text-lg lg:text-xl font-black text-[#1e293b] leading-snug">
                          {faq.questionArabic}
                        </h3>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 mt-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 ${
                          isExpanded ? "bg-blue-50 text-[#005293] rotate-180" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>
                  </button>

                  {/* Accordion Expanded Content */}
                  {isExpanded && (
                    <div className="px-5 pb-6 sm:px-6 sm:pb-7 pt-2 border-t border-gray-100 space-y-5 animate-fade-in">
                      {/* Quick Summary Box */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-[#F0F7FF] border border-blue-100 text-[#003C6E] space-y-2">
                        <div className="flex items-center gap-2 font-black text-sm sm:text-base">
                          <Shield className="w-4 h-4 text-[#005293]" />
                          <span>خلاصة الحكم والإجابة المباشرة:</span>
                        </div>
                        <p className="text-sm sm:text-base leading-[1.75] font-medium text-[#1e293b]">
                          {faq.answerSummary}
                        </p>
                      </div>

                      {/* Detailed Points */}
                      <div className="space-y-2.5">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider">
                          التفاصيل القانونية والإجرائية:
                        </h4>
                        <ul className="space-y-2 text-sm sm:text-base text-[#2D3748]">
                          {faq.detailedPoints.map((point, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2.5 leading-relaxed">
                              <CheckCircle2 className="w-5 h-5 text-[#1E7E34] shrink-0 mt-0.5" />
                              <span className="font-medium">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Practical Advice Callout */}
                      <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-amber-200 flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs sm:text-sm font-bold text-[#92400E] block mb-0.5">
                            نصيحة عملية مطمئنة للأهل:
                          </span>
                          <p className="text-xs sm:text-sm text-[#78350F] leading-relaxed font-medium">
                            {faq.practicalAdvice}
                          </p>
                        </div>
                      </div>

                      {/* Key Swedish Terms */}
                      {faq.swedishTerms && faq.swedishTerms.length > 0 && (
                        <div className="pt-2 flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>المصطلحات السويدية ذات الصلة:</span>
                          </span>
                          {faq.swedishTerms.map((t, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-gray-100 text-[#005293] border border-gray-200"
                              title={t.arabic}
                            >
                              {t.term} <span className="font-sans text-gray-600 font-normal">({t.arabic})</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Bottom Action Controls */}
                      <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Audio TTS Button */}
                          <AudioPlayerButton
                            textToRead={`${faq.questionArabic}. ${faq.answerSummary}. ${faq.detailedPoints.join(". ")}. ${faq.practicalAdvice}`}
                            label="استمع للإجابة صوتياً"
                            size="sm"
                          />

                          {/* Copy Button */}
                          <button
                            onClick={() => handleCopy(faq)}
                            className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3.5 py-2 rounded-full transition-colors cursor-pointer"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-green-600" />
                                <span className="text-green-700">تم النسخ بنجاح!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-gray-500" />
                                <span>نسخ الإجابة</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Ask Follow-up with AI */}
                        {onAskQuestion && (
                          <button
                            onClick={() => onAskQuestion(faq.questionArabic, faq.category)}
                            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#005293] hover:underline bg-[#F0F7FF] hover:bg-blue-100 px-4 py-2 rounded-full transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span>استشر المستشار الذكي حول حالتك الخاصة</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 px-4 space-y-3 bg-[#F8FAFC] rounded-3xl border border-dashed border-gray-200">
              <HelpCircle className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="text-base sm:text-lg font-black text-gray-800">
                لم يتم العثور على أسئلة تطابق «{searchTerm}»
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                يمكنك كتابة سؤالك الخاص في صندوق الاستشارة المجهولة وسيجيبك المستشار القانوني الذكي فوراً.
              </p>
              {onAskQuestion && (
                <div className="pt-2">
                  <button
                    onClick={() => onAskQuestion(searchTerm)}
                    className="px-6 py-2.5 rounded-full bg-[#005293] hover:bg-[#003C6E] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                    <span>طرح سؤال مجهول حول هذا الموضوع</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Banner to prompt user to ask new question */}
        <div className="mt-8 p-5 sm:p-6 rounded-3xl bg-[#EAF6ED] border border-[#D1EAD8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-black text-[#1E7E34]">
              <Sparkles className="w-4 h-4" />
              <span>هل لديك سؤال أو استفسار عائلي آخر؟</span>
            </div>
            <h4 className="text-base sm:text-lg font-black text-[#003C6E]">
              صندوق الأسئلة والاستشارة المجهولة متاح دائماً
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 font-medium max-w-2xl leading-relaxed">
              اطرح أي استفسار بسرية تامة دون تسجيل أو أسماء واحصل على تحليل هادئ يستند للقوانين السويدية الرسمية.
            </p>
          </div>

          {onAskQuestion && (
            <button
              onClick={() => onAskQuestion()}
              className="px-6 py-3 rounded-full bg-[#005293] hover:bg-[#003C6E] text-white text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer shadow-xs min-h-[44px]"
            >
              طرح سؤالك الآن
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
