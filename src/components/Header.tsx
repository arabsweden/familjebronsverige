import React, { useState, useEffect } from "react";
import {
  PhoneCall,
  Menu,
  X,
  Radio,
  Globe,
  Search,
  Command,
  Check,
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import { CategoryId } from "../types";

interface HeaderProps {
  currentView: "home" | "ask" | "categories" | "glossary" | "faq" | "podcast" | "budget";
  onViewChange: (view: "home" | "ask" | "categories" | "glossary" | "faq" | "podcast" | "budget") => void;
  onEmergencyClick: () => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onEmergencyClick,
  onOpenSearch,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLangSheetOpen, setIsLangSheetOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleNavClick = (view: "home" | "ask" | "categories" | "glossary" | "faq" | "podcast" | "budget") => {
    onViewChange(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Keyboard shortcut (Ctrl+K or Cmd+K or /) to open global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is already typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenSearch();
      } else if (e.key === "/") {
        e.preventDefault();
        onOpenSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenSearch]);

  return (
    <header className="sticky top-0 z-40 bg-[#005293] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-4">
          {/* Logo & Brand */}
          <div
            id="brand-logo"
            onClick={() => handleNavClick("home")}
            className="flex items-center gap-2 cursor-pointer select-none shrink-0"
          >
            <div className="text-white tracking-tight leading-snug">
              <div className="text-lg sm:text-xl font-black">جسر الأسرة في السويد</div>
              <div className="text-xs sm:text-sm font-medium opacity-90 font-mono">Familjebron Sverige</div>
            </div>
          </div>

          {/* Desktop Navigation Links (Moved here or reorganized if needed, but user just asked to remove flag and fix lang) */}
          <nav className="hidden md:flex overflow-x-auto whitespace-nowrap scrollbar-hide p-1.5 rounded-full text-xs lg:text-sm font-bold backdrop-blur-xs">
            <button
              id="nav-btn-home"
              onClick={() => handleNavClick("home")}
              className={`px-3 lg:px-4 py-2 rounded-full transition-all cursor-pointer ${
                currentView === "home"
                  ? "bg-white text-[#005293] shadow-xs font-black"
                  : "text-white/95 hover:text-white hover:bg-white/10"
              }`}
            >
              {t("header.home")}
            </button>
            <button
              id="nav-btn-categories"
              onClick={() => handleNavClick("categories")}
              className={`px-3 lg:px-4 py-2 rounded-full transition-all cursor-pointer ${
                currentView === "categories"
                  ? "bg-white text-[#005293] shadow-xs font-black"
                  : "text-white/95 hover:text-white hover:bg-white/10"
              }`}
            >
              {t("header.categories")}
            </button>
            <button
              id="nav-btn-ask"
              onClick={() => handleNavClick("ask")}
              className={`px-3 lg:px-4 py-2 rounded-full transition-all cursor-pointer ${
                currentView === "ask"
                  ? "bg-white text-[#005293] shadow-xs font-black"
                  : "text-white/95 hover:text-white hover:bg-white/10"
              }`}
            >
              {t("header.ask")}
            </button>
            <button
              id="nav-btn-glossary"
              onClick={() => handleNavClick("glossary")}
              className={`px-3 lg:px-4 py-2 rounded-full transition-all cursor-pointer ${
                currentView === "glossary"
                  ? "bg-white text-[#005293] shadow-xs font-black"
                  : "text-white/95 hover:text-white hover:bg-white/10"
              }`}
            >
              {t("header.glossary")}
            </button>
            <button
              id="nav-btn-faq"
              onClick={() => handleNavClick("faq")}
              className={`px-3 lg:px-4 py-2 rounded-full transition-all cursor-pointer ${
                currentView === "faq"
                  ? "bg-white text-[#005293] shadow-xs font-black"
                  : "text-white/95 hover:text-white hover:bg-white/10"
              }`}
            >
              {t("header.faq")}
            </button>
            <button
              id="nav-btn-budget"
              onClick={() => handleNavClick("budget")}
              className={`px-3 lg:px-4 py-2 rounded-full transition-all cursor-pointer ${
                currentView === "budget"
                  ? "bg-white text-[#005293] shadow-xs font-black"
                  : "text-white/95 hover:text-white hover:bg-white/10"
              }`}
            >
              {t("header.budget")}
            </button>
            <button
              id="nav-btn-podcast"
              onClick={() => handleNavClick("podcast")}
              className={`px-3 lg:px-4 py-2 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === "podcast"
                  ? "bg-amber-400 text-[#003C6E] font-black shadow-xs"
                  : "text-amber-200 hover:text-white hover:bg-white/10 font-bold"
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>{t("header.podcast")}</span>
            </button>
          </nav>

          {/* Right Action: Search Icon, Language & Menu */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search Icon Trigger */}
            <button
              id="header-search-icon-btn"
              type="button"
              onClick={onOpenSearch}
              className="w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer transition-colors"
              title={t("header.search")}
              aria-label={t("header.search")}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Language Switcher Button */}
            <button 
              id="header-lang-btn"
              type="button"
              onClick={() => setIsLangSheetOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-white/15 active:bg-white/25 text-white transition-colors cursor-pointer min-h-[44px] min-w-[44px]"
              aria-label="اختر اللغة"
              title="تغيير اللغة"
            >
              <Globe className="w-5 h-5 text-sky-200" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                {(i18n.language || "ar").substring(0, 2)}
              </span>
            </button>

            {/* Mobile hamburger menu toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer transition-colors"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#004077] border-t border-white/10 p-5 space-y-2.5 animate-fade-in shadow-xl">
          {/* Mobile Search Button inside drawer */}
          <button
            id="mobile-search-trigger-drawer"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenSearch();
            }}
            className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-base transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-5 h-5 text-sky-200" />
              <span>{t("header.searchPlaceholder")}</span>
            </div>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md font-mono font-bold">بحث</span>
          </button>

          <div className="flex gap-2 mb-4 p-2 bg-white/10 rounded-2xl">
            <button 
              type="button"
              onClick={() => changeLanguage('ar')} 
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-center transition-all cursor-pointer ${i18n.language.startsWith('ar') ? 'bg-white text-[#005293] shadow-xs font-black' : 'text-white hover:bg-white/10'}`}
            >
              العربية
            </button>
            <button 
              type="button"
              onClick={() => changeLanguage('sv')} 
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-center transition-all cursor-pointer ${i18n.language.startsWith('sv') ? 'bg-white text-[#005293] shadow-xs font-black' : 'text-white hover:bg-white/10'}`}
            >
              Svenska
            </button>
            <button 
              type="button"
              onClick={() => changeLanguage('en')} 
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-center transition-all cursor-pointer ${i18n.language.startsWith('en') ? 'bg-white text-[#005293] shadow-xs font-black' : 'text-white hover:bg-white/10'}`}
            >
              English
            </button>
          </div>
          <button id="mobile-nav-home" onClick={() => handleNavClick("home")} className={`w-full text-right px-4 py-3.5 rounded-2xl font-bold text-base transition-all ${currentView === "home" ? "bg-white text-[#005293] font-black" : "text-white hover:bg-white/10"}`}> {t("header.home")} </button>
          <button id="mobile-nav-categories" onClick={() => handleNavClick("categories")} className={`w-full text-right px-4 py-3.5 rounded-2xl font-bold text-base transition-all ${currentView === "categories" ? "bg-white text-[#005293] font-black" : "text-white hover:bg-white/10"}`}>{t("header.categories")}</button>
          <button id="mobile-nav-ask" onClick={() => handleNavClick("ask")} className={`w-full text-right px-4 py-3.5 rounded-2xl font-bold text-base transition-all ${currentView === "ask" ? "bg-white text-[#005293] font-black" : "text-white hover:bg-white/10"}`}>{t("header.ask")}</button>
          <button id="mobile-nav-glossary" onClick={() => handleNavClick("glossary")} className={`w-full text-right px-4 py-3.5 rounded-2xl font-bold text-base transition-all ${currentView === "glossary" ? "bg-white text-[#005293] font-black" : "text-white hover:bg-white/10"}`}>{t("header.glossary")}</button>
          <button id="mobile-nav-faq" onClick={() => handleNavClick("faq")} className={`w-full text-right px-4 py-3.5 rounded-2xl font-bold text-base transition-all ${currentView === "faq" ? "bg-white text-[#005293] font-black" : "text-white hover:bg-white/10"}`}>{t("header.faq")}</button>
          <button id="mobile-nav-budget" onClick={() => handleNavClick("budget")} className={`w-full text-right px-4 py-3.5 rounded-2xl font-bold text-base transition-all ${currentView === "budget" ? "bg-white text-[#005293] font-black" : "text-white hover:bg-white/10"}`}>{t("header.budget")}</button>
          <button id="mobile-nav-podcast" onClick={() => handleNavClick("podcast")} className={`w-full text-right px-4 py-3.5 rounded-2xl font-black text-base transition-all flex items-center justify-between ${currentView === "podcast" ? "bg-amber-400 text-[#003C6E]" : "text-amber-200 hover:bg-white/10"}`}>
            <span>{t("header.podcast")}</span>
            <Radio className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Language Bottom Sheet Modal */}
      {isLangSheetOpen && (
        <div 
          id="language-modal-overlay" 
          className="language-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLangSheetOpen(false);
          }}
        >
          <div className="language-sheet" role="dialog" aria-modal="true" aria-labelledby="lang-sheet-title">
            {/* Drag Handle Indicator */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <div>
                <h3 id="lang-sheet-title" className="text-xl font-black text-slate-900 leading-tight">
                  اختر اللغة
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Välj språk • Select Language
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLangSheetOpen(false)}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Options List */}
            <div className="flex flex-col gap-3">
              {[
                { code: "ar", name: "العربية", subName: "Arabic" },
                { code: "sv", name: "Svenska", subName: "Swedish" },
                { code: "en", name: "English", subName: "English" },
              ].map((lang) => {
                const isSelected = (i18n.language || "ar").startsWith(lang.code);
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      changeLanguage(lang.code);
                      setIsLangSheetOpen(false);
                    }}
                    className={`w-full min-h-[58px] px-5 py-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer text-start ${
                      isSelected
                        ? "bg-sky-50 border-2 border-[#005293] text-[#005293] shadow-xs font-black"
                        : "bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 border border-slate-200 font-bold"
                    }`}
                  >
                    <div className="flex flex-col items-start text-start">
                      <span className={`text-lg leading-normal ${isSelected ? "text-[#005293] font-black" : "text-slate-900 font-bold"}`}>
                        {lang.name}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {lang.subName}
                      </span>
                    </div>

                    {isSelected ? (
                      <div className="w-7 h-7 rounded-full bg-[#005293] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-300 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

