import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  X,
  BookOpen,
  Shield,
  PhoneCall,
  ExternalLink,
  Layers,
  ArrowRight,
  Sparkles,
  Volume2,
  Clock,
  Trash2,
  ChevronRight,
  HelpCircle,
  Building2,
  FileText
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { CategoryId, KnowledgeArticle, SwedishTerm, OfficialAuthority, CategoryInfo } from "../types";
import { KNOWLEDGE_ARTICLES } from "../data/knowledgeBase";
import { SWEDISH_GLOSSARY } from "../data/glossary";
import { EMERGENCY_AUTHORITIES } from "../data/emergencyContacts";
import { CATEGORIES } from "../data/categories";
import { AudioPlayerButton } from "./AudioPlayerButton";

export type SearchFilterType = "all" | "articles" | "glossary" | "authorities" | "categories";

interface SearchResultItem {
  id: string;
  type: "article" | "glossary" | "authority" | "category";
  titleArabic: string;
  titleSwedish: string;
  snippet: string;
  category?: CategoryId;
  metadata?: string;
  sourceData: KnowledgeArticle | SwedishTerm | OfficialAuthority | CategoryInfo;
}

interface GlobalSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCategory: (categoryId: CategoryId, articleId?: string) => void;
  onNavigateToGlossary: (searchTerm?: string) => void;
  onNavigateToAsk: (prefillQuestion?: string, categoryId?: CategoryId) => void;
  onOpenEmergencyModal: () => void;
}

const POPULAR_SEARCHES = [
  { text: "Orosanmälan", ar: "بلاغ القلق" },
  { text: "Skolplikt", ar: "إلزامية التعليم" },
  { text: "Förbud mot aga", ar: "حظر الضرب والعقاب" },
  { text: "1177 Vårdguiden", ar: "الدليل الصحي الوطني" },
  { text: "112", ar: "رقم الطوارئ الموحد" },
  { text: "LVU", ar: "قانون رعاية اليافعين" },
  { text: "Föräldrapenning", ar: "إجازة الوالدين" },
  { text: "Samarbetssamtal", ar: "محادثات التعاون" },
  { text: "Tolk", ar: "حق المترجم المجاني" },
  { text: "BVC", ar: "صحة الطفولة" }
];

export const GlobalSearchOverlay: React.FC<GlobalSearchOverlayProps> = ({
  isOpen,
  onClose,
  onNavigateToCategory,
  onNavigateToGlossary,
  onNavigateToAsk,
  onOpenEmergencyModal,
}) => {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<SearchFilterType>("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("familjebron_recent_searches");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const clean = term.trim();
    const updated = [clean, ...recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem("familjebron_recent_searches", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("familjebron_recent_searches");
    } catch {
      // ignore
    }
  };

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Search Engine across all collections
  const allResults = useMemo<SearchResultItem[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: SearchResultItem[] = [];

    // 1. Search Categories
    CATEGORIES.forEach((cat) => {
      const match =
        cat.titleArabic.toLowerCase().includes(q) ||
        cat.titleSwedish.toLowerCase().includes(q) ||
        cat.descriptionArabic.toLowerCase().includes(q);

      if (match) {
        results.push({
          id: `cat-${cat.id}`,
          type: "category",
          titleArabic: cat.titleArabic,
          titleSwedish: cat.titleSwedish,
          snippet: cat.descriptionArabic,
          category: cat.id,
          metadata: "قسم إرشادي رئيسي",
          sourceData: cat,
        });
      }
    });

    // 2. Search Knowledge Articles (Laws & Topics)
    KNOWLEDGE_ARTICLES.forEach((art) => {
      const matchPoints = art.detailedPoints.some((p) => p.toLowerCase().includes(q));
      const matchSteps = art.practicalSteps.some((s) => s.toLowerCase().includes(q));
      const matchTerms = art.keySwedishTerms.some(
        (t) => t.term.toLowerCase().includes(q) || t.arabic.toLowerCase().includes(q)
      );
      const matchMisconceptions = art.commonMisconceptions?.some(
        (m) => m.myth.toLowerCase().includes(q) || m.fact.toLowerCase().includes(q)
      );

      const match =
        art.titleArabic.toLowerCase().includes(q) ||
        art.titleSwedish.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        matchPoints ||
        matchSteps ||
        matchTerms ||
        matchMisconceptions;

      if (match) {
        results.push({
          id: `art-${art.id}`,
          type: "article",
          titleArabic: art.titleArabic,
          titleSwedish: art.titleSwedish,
          snippet: art.summary,
          category: art.categoryId,
          metadata: "موضوع وقانون سويدي",
          sourceData: art,
        });
      }
    });

    // 3. Search Swedish Glossary Terms
    SWEDISH_GLOSSARY.forEach((term, idx) => {
      const match =
        term.term.toLowerCase().includes(q) ||
        term.arabic.toLowerCase().includes(q) ||
        (term.pronunciation && term.pronunciation.toLowerCase().includes(q)) ||
        term.description.toLowerCase().includes(q) ||
        (term.exampleInSwedish && term.exampleInSwedish.toLowerCase().includes(q)) ||
        (term.exampleInArabic && term.exampleInArabic.toLowerCase().includes(q));

      if (match) {
        results.push({
          id: `glossary-${idx}-${term.term}`,
          type: "glossary",
          titleArabic: term.arabic,
          titleSwedish: term.term,
          snippet: term.description,
          category: term.category,
          metadata: term.pronunciation ? `النطق: ${term.pronunciation}` : "مصطلح سويدي",
          sourceData: term,
        });
      }
    });

    // 4. Search Emergency & Support Authorities
    EMERGENCY_AUTHORITIES.forEach((auth, idx) => {
      const match =
        auth.nameArabic.toLowerCase().includes(q) ||
        auth.nameSwedish.toLowerCase().includes(q) ||
        auth.description.toLowerCase().includes(q) ||
        auth.whenToContact.toLowerCase().includes(q) ||
        (auth.contactNumber && auth.contactNumber.toLowerCase().includes(q));

      if (match) {
        results.push({
          id: `auth-${idx}-${auth.nameSwedish}`,
          type: "authority",
          titleArabic: auth.nameArabic,
          titleSwedish: auth.nameSwedish,
          snippet: auth.description,
          metadata: auth.contactNumber ? `الاتصال: ${auth.contactNumber}` : "جهة رسمية",
          sourceData: auth,
        });
      }
    });

    return results;
  }, [query]);

  // Filtered by selected tab
  const filteredResults = useMemo(() => {
    if (activeFilter === "all") return allResults;
    if (activeFilter === "articles") return allResults.filter((r) => r.type === "article");
    if (activeFilter === "glossary") return allResults.filter((r) => r.type === "glossary");
    if (activeFilter === "authorities") return allResults.filter((r) => r.type === "authority");
    if (activeFilter === "categories") return allResults.filter((r) => r.type === "category");
    return allResults;
  }, [allResults, activeFilter]);

  // Count by filter
  const counts = useMemo(() => {
    return {
      all: allResults.length,
      articles: allResults.filter((r) => r.type === "article").length,
      glossary: allResults.filter((r) => r.type === "glossary").length,
      authorities: allResults.filter((r) => r.type === "authority").length,
      categories: allResults.filter((r) => r.type === "category").length,
    };
  }, [allResults]);

  const handleSelectResult = (item: SearchResultItem) => {
    saveRecentSearch(query || item.titleSwedish || item.titleArabic);
    onClose();

    if (item.type === "category") {
      const cat = item.sourceData as CategoryInfo;
      onNavigateToCategory(cat.id);
    } else if (item.type === "article") {
      const art = item.sourceData as KnowledgeArticle;
      onNavigateToCategory(art.categoryId, art.id);
    } else if (item.type === "glossary") {
      const term = item.sourceData as SwedishTerm;
      onNavigateToGlossary(term.term);
    } else if (item.type === "authority") {
      onOpenEmergencyModal();
    }
  };

  const handleQuickTermClick = (term: string) => {
    setQuery(term);
    saveRecentSearch(term);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div
      id="global-search-overlay"
      className="fixed inset-0 z-50 flex items-start justify-center pt-3 sm:pt-14 px-3 sm:px-6 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      dir="rtl"
    >
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden">
        {/* Top Search Input Bar */}
        <div className="p-4 sm:p-5 bg-white border-b border-gray-100 flex items-center gap-3 relative">
          <div className="w-10 h-10 rounded-2xl bg-[#F0F7FF] text-[#005293] flex items-center justify-center shrink-0">
            <Search className="w-5 h-5" />
          </div>

          <input
            ref={inputRef}
            id="global-search-modal-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن موضوع، قانون، جهة مساعدة، أو كلمة سويدية..."
            className="flex-1 bg-transparent text-base sm:text-lg font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none"
            autoComplete="off"
          />

          {query && (
            <button
              id="global-search-clear-btn"
              type="button"
              onClick={() => setQuery("")}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              title="مسح البحث"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 text-xs font-mono font-bold">
            <span>ESC</span>
          </div>

          <button
            id="global-search-close-btn"
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="إغلاق البحث"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Badges Bar (when query has content) */}
        {query.trim().length > 0 && (
          <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-gray-100 flex items-center gap-2 overflow-x-auto">
            <button
              id="search-filter-all"
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer min-h-[34px] flex items-center gap-1.5 ${
                activeFilter === "all"
                  ? "bg-[#005293] text-white shadow-xs"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <span>الكل</span>
              <span className={`px-1.5 py-0.2 text-[11px] rounded-full ${activeFilter === "all" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                {counts.all}
              </span>
            </button>

            <button
              id="search-filter-articles"
              type="button"
              onClick={() => setActiveFilter("articles")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer min-h-[34px] flex items-center gap-1.5 ${
                activeFilter === "articles"
                  ? "bg-[#005293] text-white shadow-xs"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>المواضيع والقوانين</span>
              <span className={`px-1.5 py-0.2 text-[11px] rounded-full ${activeFilter === "articles" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                {counts.articles}
              </span>
            </button>

            <button
              id="search-filter-glossary"
              type="button"
              onClick={() => setActiveFilter("glossary")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer min-h-[34px] flex items-center gap-1.5 ${
                activeFilter === "glossary"
                  ? "bg-[#005293] text-white shadow-xs"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>المصطلحات السويدية</span>
              <span className={`px-1.5 py-0.2 text-[11px] rounded-full ${activeFilter === "glossary" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                {counts.glossary}
              </span>
            </button>

            <button
              id="search-filter-authorities"
              type="button"
              onClick={() => setActiveFilter("authorities")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer min-h-[34px] flex items-center gap-1.5 ${
                activeFilter === "authorities"
                  ? "bg-[#005293] text-white shadow-xs"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>جهات الطوارئ والدعم</span>
              <span className={`px-1.5 py-0.2 text-[11px] rounded-full ${activeFilter === "authorities" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                {counts.authorities}
              </span>
            </button>

            <button
              id="search-filter-categories"
              type="button"
              onClick={() => setActiveFilter("categories")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer min-h-[34px] flex items-center gap-1.5 ${
                activeFilter === "categories"
                  ? "bg-[#005293] text-white shadow-xs"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>أقسام الدليل</span>
              <span className={`px-1.5 py-0.2 text-[11px] rounded-full ${activeFilter === "categories" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                {counts.categories}
              </span>
            </button>
          </div>
        )}

        {/* Search Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* STATE 1: Empty Query - Show Suggestions & Recent Searches */}
          {!query.trim() && (
            <div className="space-y-6">
              {/* Recent searches (if any) */}
              {recentSearches.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>عمليات البحث الأخيرة</span>
                    </div>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-gray-400 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>مسح السجل</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickTermClick(s)}
                        className="px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs sm:text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{s}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-[#003C6E]">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>المواضيع والمصطلحات الأكثر بحثاً واستفساراً:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {POPULAR_SEARCHES.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickTermClick(item.text)}
                      className="p-3 rounded-2xl bg-[#F8FAFC] hover:bg-[#F0F7FF] border border-gray-200/80 hover:border-[#005293] text-right transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <span className="text-xs sm:text-sm font-black font-mono text-[#005293] group-hover:underline">
                        {item.text}
                      </span>
                      <span className="text-xs text-gray-600 font-medium mt-1">
                        {item.ar}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick AI Consultation trigger */}
              <div className="p-4 sm:p-5 rounded-3xl bg-[#EAF6ED] border border-[#D1EAD8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#1E7E34]">
                    <Shield className="w-4 h-4" />
                    <span>استشارة مجهولة وفورية</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-[#003C6E]">
                    لم تجد ما تبحث عنه أو لديك موقف عائلي خاص؟
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    يمكنك طرح سؤالك بكلماتك البسيطة في صندوق الاستشارة المجهول للحصول على تحليل هادئ.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToAsk();
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#005293] hover:bg-[#003C6E] text-white text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer shadow-xs min-h-[40px]"
                >
                  طرح سؤال مجهول
                </button>
              </div>
            </div>
          )}

          {/* STATE 2: Query entered, results found */}
          {query.trim() && filteredResults.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500 pb-1">
                <span>
                  تم العثور على <strong className="text-[#005293] font-bold">{filteredResults.length}</strong> نتيجة
                </span>
                <span className="font-mono text-gray-400">Resultat</span>
              </div>

              {filteredResults.map((item) => {
                const isArticle = item.type === "article";
                const isGlossary = item.type === "glossary";
                const isAuthority = item.type === "authority";
                const isCategory = item.type === "category";

                return (
                  <div
                    key={item.id}
                    id={`search-result-${item.id}`}
                    onClick={() => handleSelectResult(item)}
                    className="p-4 sm:p-5 rounded-3xl bg-white hover:bg-[#F8FAFC] border border-gray-200/90 hover:border-[#005293] transition-all cursor-pointer group shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Type Badge */}
                        {isArticle && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F0F7FF] text-[#005293] border border-blue-200">
                            <FileText className="w-3 h-3" />
                            <span>موضوع وقانون</span>
                          </span>
                        )}
                        {isGlossary && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EAF6ED] text-[#1E7E34] border border-[#D1EAD8]">
                            <BookOpen className="w-3 h-3" />
                            <span>مصطلح سويدي</span>
                          </span>
                        )}
                        {isAuthority && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#92400E] border border-amber-200">
                            <PhoneCall className="w-3 h-3" />
                            <span>جهة طوارئ ومساعدة</span>
                          </span>
                        )}
                        {isCategory && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            <Layers className="w-3 h-3" />
                            <span>قسم إرشادي</span>
                          </span>
                        )}

                        {/* Swedish Title */}
                        <span className="text-xs sm:text-sm font-mono font-bold text-[#005293] bg-gray-100 px-2.5 py-0.5 rounded-full">
                          {item.titleSwedish}
                        </span>

                        {item.metadata && (
                          <span className="text-xs text-gray-500 font-medium">
                            {item.metadata}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Audio reader for this item */}
                        <div onClick={(e) => e.stopPropagation()}>
                          <AudioPlayerButton
                            textToRead={`${item.titleArabic}. ${item.titleSwedish}. ${item.snippet}`}
                            label="استمع"
                            size="sm"
                          />
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#005293] group-hover:-translate-x-1 transition-all" />
                      </div>
                    </div>

                    {/* Arabic Title */}
                    <h3 className="text-base sm:text-lg font-black text-gray-900 leading-snug group-hover:text-[#005293] transition-colors">
                      {item.titleArabic}
                    </h3>

                    {/* Snippet */}
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium line-clamp-2">
                      {item.snippet}
                    </p>

                    {/* Action Footers */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                      <span className="text-[#005293] font-bold flex items-center gap-1">
                        <span>انقر لعرض كامل التفاصيل</span>
                        <span>←</span>
                      </span>
                      {item.category && (
                        <span className="text-gray-400 font-mono">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* STATE 3: Query entered, NO results found */}
          {query.trim() && filteredResults.length === 0 && (
            <div className="text-center py-10 px-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-gray-900">
                  لم يتم العثور على نتائج لـ «{query}»
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                  تأكد من كتابة الكلمات بشكل صحيح، أو جرّب البحث بمصطلح أعم مثل (المدرسة، السوسيال، الطلاق، الحضانة، 1177).
                </p>
              </div>

              {/* Direct ask button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToAsk(query);
                  }}
                  className="px-6 py-3 rounded-full bg-[#005293] hover:bg-[#003C6E] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-all shadow-sm cursor-pointer min-h-[44px]"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>اسأل المستشار الذكي حول «{query}» الآن</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="p-3.5 sm:p-4 bg-[#F8FAFC] border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2 font-medium">
            <Shield className="w-4 h-4 text-[#4CAF50]" />
            <span>بحث شامل في القوانين والمصطلحات والجهات الرسمية السويدية.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#005293] hover:underline font-bold cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
