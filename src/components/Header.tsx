import React, { useState, useEffect } from "react";
import {
  PhoneCall,
  Menu,
  X,
  Radio,
  Globe,
  Search,
  Command,
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
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white text-[#005293] flex items-center justify-center font-black text-2xl shadow-xs">
              <span>🇸🇪</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-white tracking-tight leading-snug">
                <div className="text-lg sm:text-xl font-black">جسر الأسرة في السويد</div>
                <div className="text-xs sm:text-sm font-medium opacity-90 font-mono">Familjebron Sverige</div>
              </div>
            </div>
          </div>

          {/* Desktop Global Search Bar Trigger */}
          <div className="hidden lg:flex flex-1 max-w-xs xl:max-w-sm mx-2">
            <button
              id="header-global-search-btn"
              type="button"
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between gap-2 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white/90 hover:text-white transition-all text-xs sm:text-sm font-medium cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-4 h-4 text-sky-200 group-hover:text-white transition-colors shrink-0" />
                <span className="truncate">{t("header.searchPlaceholder")}</span>
              </div>
              <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-white/20 text-[11px] font-mono font-bold shrink-0 text-white/90">
                <span>⌘K</span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/10 p-1.5 rounded-full text-xs lg:text-sm font-bold backdrop-blur-xs">
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

          {/* Right Action: Search Icon (Mobile/Tablet), Language & Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Search Icon Trigger for smaller screens & quick access */}
            <button
              id="header-search-icon-btn"
              type="button"
              onClick={onOpenSearch}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer transition-colors"
              title={t("header.search")}
              aria-label={t("header.search")}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Language Switcher */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer min-h-[44px]">
                <Globe className="w-5 h-5" />
                <span className="text-xs sm:text-sm font-bold uppercase">{i18n.language}</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-36 bg-white rounded-2xl shadow-xl text-slate-800 p-2 hidden group-hover:block z-50 border border-gray-100">
                <button onClick={() => changeLanguage('ar')} className={`block w-full text-right px-3 py-2 text-sm hover:bg-slate-100 rounded-xl ${i18n.language === 'ar' ? 'font-black bg-blue-50 text-[#005293]' : 'font-semibold'}`}>العربية</button>
                <button onClick={() => changeLanguage('en')} className={`block w-full text-left px-3 py-2 text-sm hover:bg-slate-100 rounded-xl ${i18n.language === 'en' ? 'font-black bg-blue-50 text-[#005293]' : 'font-semibold'}`}>English</button>
                <button onClick={() => changeLanguage('sv')} className={`block w-full text-left px-3 py-2 text-sm hover:bg-slate-100 rounded-xl ${i18n.language === 'sv' ? 'font-black bg-blue-50 text-[#005293]' : 'font-semibold'}`}>Svenska</button>
              </div>
            </div>

            {/* Mobile hamburger menu toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-11 h-11 rounded-2xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer transition-colors"
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
            <button onClick={() => changeLanguage('ar')} className={`flex-1 py-2.5 rounded-xl text-sm font-black text-center transition-all ${i18n.language === 'ar' ? 'bg-white text-[#005293] shadow-xs' : 'text-white hover:bg-white/10'}`}>العربية (AR)</button>
            <button onClick={() => changeLanguage('en')} className={`flex-1 py-2.5 rounded-xl text-sm font-black text-center transition-all ${i18n.language === 'en' ? 'bg-white text-[#005293] shadow-xs' : 'text-white hover:bg-white/10'}`}>English (EN)</button>
            <button onClick={() => changeLanguage('sv')} className={`flex-1 py-2.5 rounded-xl text-sm font-black text-center transition-all ${i18n.language === 'sv' ? 'bg-white text-[#005293] shadow-xs' : 'text-white hover:bg-white/10'}`}>Svenska (SV)</button>
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
    </header>
  );
};

