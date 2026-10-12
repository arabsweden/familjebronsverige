import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  ShieldCheck,
  HeartHandshake,
  Users,
  Home,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ExternalLink,
  Info,
  BookOpen,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { CategoryId, KnowledgeArticle } from "../types";
import { CATEGORIES } from "../data/categories";
import { KNOWLEDGE_ARTICLES } from "../data/knowledgeBase";
import { AudioPlayerButton } from "./AudioPlayerButton";
import { NoticeBanner } from "./NoticeBanner";
import { ArticleShareBar } from "./ArticleShareBar";

interface CategorySectionProps {
  activeCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
  onEmergencyClick: () => void;
  onAskQuestionAboutCategory: (cat: CategoryId) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  activeCategory,
  onSelectCategory,
  onEmergencyClick,
  onAskQuestionAboutCategory,
}) => {
  const [expandedArticles, setExpandedArticles] = useState<Record<string, boolean>>({
    "school-attendance-and-law": true,
    "understanding-social services-and-orosamnalan": true,
  });

  // Handle URL hash / search params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      const articleParam = params.get("article");
      const targetId = articleParam || (hash.startsWith("#article-") ? hash.replace("#article-", "") : null);

      if (targetId) {
        setExpandedArticles((prev) => ({
          ...prev,
          [targetId]: true,
        }));

        setTimeout(() => {
          const el = document.getElementById(`article-card-${targetId}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 300);
      }
    }
  }, []);

  const toggleArticle = (id: string) => {
    setExpandedArticles((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getCategoryIcon = (id: CategoryId) => {
    switch (id) {
      case "school":
        return <GraduationCap className="w-5 h-5" />;
      case "social-services":
        return <ShieldCheck className="w-5 h-5" />;
      case "child-rights":
        return <HeartHandshake className="w-5 h-5" />;
      case "family-disputes":
        return <Users className="w-5 h-5" />;
      case "daily-life":
        return <Home className="w-5 h-5" />;
    }
  };

  const currentCategoryArticles = KNOWLEDGE_ARTICLES.filter(
    (a) => a.categoryId === activeCategory
  );

  const activeCatInfo = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];

  return (
    <section id="categories-browser-section" className="w-full space-y-6">
      {/* Category Tabs */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-1 pb-3.5 mb-3.5 border-b border-gray-100">
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#003C6E]">
              أقسام الدليل الإرشادي السويدي
            </h3>
            <span className="text-xs sm:text-sm text-gray-500 font-mono font-medium">
              Välj ämnesområde
            </span>
          </div>
          <span className="text-xs sm:text-sm px-3.5 py-1.5 rounded-full bg-[#EAF6ED] text-[#1E7E34] font-bold border border-[#D1EAD8]">
            5 تصنيفات رئيسية
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => {
            const isActive = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                id={`tab-category-${cat.id}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`p-4 rounded-2xl text-right transition-all flex flex-col justify-between cursor-pointer border min-h-[96px] ${
                  isActive
                    ? "bg-[#005293] text-white border-[#005293] shadow-sm"
                    : "bg-[#F8FAFC] hover:bg-gray-100 text-[#2D3748] border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isActive ? "bg-white/20 text-white" : "bg-white text-[#005293] shadow-2xs"
                    }`}
                  >
                    {getCategoryIcon(cat.id)}
                  </div>
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isActive ? "bg-white/20 text-white" : "bg-gray-200/80 text-gray-800"
                    }`}
                  >
                    {cat.titleSwedish}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold leading-snug">
                  {cat.titleArabic}
                </h4>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Category Header Card - Soft Mint Style */}
      <div className="bg-[#EAF6ED] text-[#2D3748] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm border border-[#D1EAD8] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-mono font-bold tracking-wide uppercase px-3.5 py-1 rounded-full bg-white text-[#005293] border border-[#D1EAD8]">
                {activeCatInfo.titleSwedish}
              </span>
              <span className="text-xs sm:text-sm text-gray-600 font-semibold">موثق من الجهات الرسمية</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#003C6E]">
              {activeCatInfo.titleArabic}
            </h2>
            <p className="text-base sm:text-lg text-[#2D3748] leading-[1.75] font-medium">
              {activeCatInfo.descriptionArabic}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              id={`ask-about-${activeCategory}-btn`}
              onClick={() => onAskQuestionAboutCategory(activeCategory)}
              className="px-6 py-3.5 rounded-full bg-[#005293] hover:bg-[#003C6E] text-white text-sm sm:text-base font-bold flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer min-h-[48px]"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>اسأل سؤالاً في هذا القسم</span>
            </button>
          </div>
        </div>
      </div>

      {/* List of Knowledge Articles in Current Category */}
      <div className="space-y-4">
        {currentCategoryArticles.map((article) => {
          const isExpanded = expandedArticles[article.id] ?? false;

          const articleAudioText = `${article.titleArabic}. ${article.summary}. النقاط الأساسية: ${article.detailedPoints.join(". ")}. الخطوات العملية: ${article.practicalSteps.join(". ")}`;

          return (
            <div
              key={article.id}
              id={`article-card-${article.id}`}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:border-[#005293] transition-all overflow-hidden"
            >
              {/* Article Card Top / Header */}
              <div
                onClick={() => toggleArticle(article.id)}
                className="p-5 sm:p-7 cursor-pointer select-none flex items-start justify-between gap-4 bg-white hover:bg-[#F8FAFC] transition-colors"
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs sm:text-sm font-mono font-bold px-3 py-0.5 rounded-full bg-[#F0F7FF] text-[#005293]">
                      {article.titleSwedish}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 font-medium">إرشادات مفصلة</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#1e293b] leading-snug">
                    {article.titleArabic}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-[1.7]">
                    {article.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 mt-1">
                  <button
                    type="button"
                    className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center cursor-pointer"
                    aria-label={isExpanded ? "طي المقال" : "توسيع المقال"}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-700" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-700" />
                    )}
                  </button>
                </div>
              </div>

              {/* Collapsible Detailed Content */}
              {isExpanded && (
                <div className="px-5 sm:px-7 pb-7 pt-3 border-t border-gray-100 bg-[#F8FAFC] space-y-6 animate-fade-in">
                  {/* TTS audio listener bar */}
                  <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#003C6E]">
                      <BookOpen className="w-4 h-4 text-[#005293]" />
                      <span>استمع لهذا الشرح كاملاً باللغة العربية:</span>
                    </div>
                    <AudioPlayerButton
                      textToRead={articleAudioText}
                      label="استمع للشرح"
                      size="md"
                    />
                  </div>

                  {/* Detailed Points */}
                  <div className="space-y-3">
                    <h4 className="text-base font-black text-[#003C6E] flex items-center gap-2">
                      <Info className="w-5 h-5 text-[#005293]" />
                      <span>النقاط القانونية والإجرائية الهامة:</span>
                    </h4>
                    <ul className="space-y-2.5 text-sm sm:text-base text-[#2D3748]">
                      {article.detailedPoints.map((point, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs leading-[1.75]"
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-[#005293] shrink-0 mt-2.5"></span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Practical Steps */}
                  <div className="space-y-3">
                    <h4 className="text-base font-black text-[#1E7E34] flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
                      <span>الخطوات العملية الموصى بها للأسرة:</span>
                    </h4>
                    <div className="space-y-2.5">
                      {article.practicalSteps.map((step, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3.5 bg-[#EAF6ED] p-4 rounded-2xl border border-[#D1EAD8] text-sm sm:text-base text-[#1E7E34] font-medium"
                        >
                          <span className="w-6 h-6 rounded-full bg-[#4CAF50] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-[1.75] text-[#2D3748]">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Swedish Keywords */}
                  {article.keySwedishTerms.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-base font-black text-[#003C6E]">
                        المصطلحات السويدية في هذا الموضوع:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {article.keySwedishTerms.map((term, i) => (
                          <div
                            key={i}
                            className="bg-white p-4 rounded-2xl border border-gray-100 text-sm shadow-2xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-[#005293] bg-[#F0F7FF] px-3 py-1 rounded-full text-xs sm:text-sm">
                                {term.term}
                              </span>
                              <span className="font-bold text-[#2D3748]">
                                {term.arabic}
                              </span>
                            </div>
                            <p className="text-gray-600 mt-2 leading-[1.6] text-xs sm:text-sm">
                              {term.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Common Misconceptions vs Facts */}
                  {article.commonMisconceptions && article.commonMisconceptions.length > 0 && (
                    <div className="bg-[#FFFBEB] border border-amber-200 rounded-3xl p-5 space-y-3">
                      <h4 className="text-sm sm:text-base font-black text-[#92400E] flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-[#D97706]" />
                        <span>تصحيح شائعات ومفاهيم خاطئة شائعة:</span>
                      </h4>
                      {article.commonMisconceptions.map((item, i) => (
                        <div key={i} className="text-sm sm:text-base space-y-1.5 bg-white p-4 rounded-2xl border border-amber-100 leading-[1.7]">
                          <p className="text-red-700 font-semibold">
                            <span className="font-black">❌ شائعة غير صحيحة: </span>
                            {item.myth}
                          </p>
                          <p className="text-[#1E7E34] font-medium">
                            <span className="font-black"> الحقيقة وفق القانون: </span>
                            {item.fact}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Official Sources Reference */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-gray-200 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[#2D3748]">المصادر الرسمية:</span>
                      {article.officialSources.map((src, i) => (
                        <span key={i} className="inline-flex items-center gap-1">
                          {src.url ? (
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#005293] hover:underline inline-flex items-center gap-1 font-bold"
                            >
                              <span>{src.name}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="font-medium">{src.name}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Share Article Bar (WhatsApp, Copy Link, Socials) */}
                  <ArticleShareBar
                    article={article}
                    categoryTitleArabic={activeCatInfo.titleArabic}
                  />

                  {/* Legal Disclaimer On Every Article */}
                  <NoticeBanner variant="subtle" onEmergencyClick={onEmergencyClick} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
