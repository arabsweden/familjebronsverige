import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { AnonymousQuestionBox } from "./components/AnonymousQuestionBox";
import { CategorySection } from "./components/CategorySection";
import { GlossarySection } from "./components/GlossarySection";
import { FAQSection } from "./components/FAQSection";
import { PodcastSection } from "./components/PodcastSection";
import { BudgetPlanner } from "./components/BudgetPlanner";
import { OfficialWebsiteBanner } from "./components/OfficialWebsiteBanner";
import { EmergencyHelpModal } from "./components/EmergencyHelpModal";
import { BackToTop } from "./components/BackToTop";
import { NoticeBanner } from "./components/NoticeBanner";
import { GlobalSearchOverlay } from "./components/GlobalSearchOverlay";
import { Footer } from "./components/Footer";
import { CategoryId } from "./types";
import { MessageSquare, BookOpen, Layers, ShieldCheck, Radio, HelpCircle, Calculator } from "lucide-react";

export default function App() {
  const { i18n } = useTranslation();
  const [currentView, setCurrentView] = useState<"home" | "ask" | "categories" | "glossary" | "faq" | "podcast" | "budget">("home");
  const [activeCategoryId, setActiveCategoryId] = useState<CategoryId>("school");
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [prefillQuestion, setPrefillQuestion] = useState<string>("");
  const [glossarySearchTerm, setGlossarySearchTerm] = useState<string>("");

  useEffect(() => {
    document.documentElement.dir = i18n.dir(i18n.language);
  }, [i18n.language]);

  // Deep linking: Check URL parameters or hash on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get("cat") as CategoryId;
      const articleParam = params.get("article");
      const hash = window.location.hash;

      if (catParam && ["school", "social-services", "child-rights", "family-disputes", "daily-life"].includes(catParam)) {
        setActiveCategoryId(catParam);
        setCurrentView("categories");
      } else if (articleParam || hash.startsWith("#article-")) {
        setCurrentView("categories");
      }
    }
  }, []);

  const handleOpenEmergency = () => {
    setIsEmergencyModalOpen(true);
  };

  const handleExploreCategory = (catId: CategoryId) => {
    setActiveCategoryId(catId);
    setCurrentView("categories");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStartAsk = (initialText?: string) => {
    if (initialText) {
      setPrefillQuestion(initialText);
    }
    setCurrentView("ask");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAskAboutCategory = (catId: CategoryId) => {
    setActiveCategoryId(catId);
    setCurrentView("ask");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigateToGlossary = (searchTerm?: string) => {
    if (searchTerm) {
      setGlossarySearchTerm(searchTerm);
    }
    setCurrentView("glossary");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#2D3748] font-sans antialiased selection:bg-blue-100 selection:text-[#005293]">
      {/* Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onEmergencyClick={handleOpenEmergency}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-5 space-y-4">
        {/* Prominent Official Website Banner */}
        <OfficialWebsiteBanner />

        {/* Notice Banner at top */}
        <NoticeBanner
          variant="full"
          onEmergencyClick={handleOpenEmergency}
        />

        {/* View Switcher */}
        {currentView === "home" && (
          <div className="space-y-10">
            {/* Hero Section with Headline: افهم حقوقك وخطواتك بهدوء */}
            <Hero
              onStartAsk={handleStartAsk}
              onExploreCategory={handleExploreCategory}
              onEmergencyClick={handleOpenEmergency}
              onOpenGlossary={() => {
                setCurrentView("glossary");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onOpenPodcast={() => {
                setCurrentView("podcast");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />

            {/* Featured Podcast Section on Home */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#003C6E]">
                    بودكاست جسر الأسرة في السويد
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setCurrentView("podcast");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-xs sm:text-sm font-bold text-[#005293] hover:underline flex items-center gap-1 cursor-pointer min-h-[38px] px-3 py-1.5 rounded-full bg-[#F0F7FF]"
                >
                  <span>فتح استوديو البودكاست الكامل</span>
                  <span>←</span>
                </button>
              </div>
              <PodcastSection />
            </div>

            {/* Quick Anonymous Question Box right on Homepage */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#4CAF50] animate-pulse"></span>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#003C6E]">
                    اسأل سؤالاً مجهولاً الآن
                  </h2>
                </div>
                <span className="text-xs sm:text-sm font-mono text-gray-500 font-medium">
                  Direkt anonym rådgivning
                </span>
              </div>
              <AnonymousQuestionBox
                onEmergencyClick={handleOpenEmergency}
                selectedCategory={activeCategoryId}
                onSelectCategory={setActiveCategoryId}
                initialQuestion={prefillQuestion}
              />
            </div>

            {/* Frequently Asked Questions (FAQ) Accordion Section */}
            <FAQSection
              onAskQuestion={(prefill, catId) => {
                if (catId) setActiveCategoryId(catId);
                handleStartAsk(prefill);
              }}
              onExploreCategory={handleExploreCategory}
            />

            {/* Categories Deep Browser */}
            <CategorySection
              activeCategory={activeCategoryId}
              onSelectCategory={setActiveCategoryId}
              onEmergencyClick={handleOpenEmergency}
              onAskQuestionAboutCategory={handleAskAboutCategory}
            />

            {/* Swedish Glossary Highlights */}
            <GlossarySection initialSearchTerm={glossarySearchTerm} />

            {/* Interactive Monthly Budget Planner Tool */}
            <BudgetPlanner
              onExploreCategory={handleExploreCategory}
              onAskQuestion={(q) => handleStartAsk(q)}
            />
          </div>
        )}

        {currentView === "budget" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#003C6E]">
                  مخطط ميزانية الأسرة التفاعلي في السويد
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1 font-medium">
                  Interaktiv hushållsbudget med spar- och stödtips enligt Konsumentverket och Försäkringskassan
                </p>
              </div>
              <button
                onClick={() => setCurrentView("home")}
                className="text-xs sm:text-sm font-bold text-[#005293] hover:underline px-5 py-2.5 rounded-full bg-[#F0F7FF] cursor-pointer min-h-[40px]"
              >
                ← العودة للرئيسية
              </button>
            </div>

            <BudgetPlanner
              onExploreCategory={handleExploreCategory}
              onAskQuestion={(q) => handleStartAsk(q)}
            />
          </div>
        )}

        {currentView === "faq" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#003C6E]">
                  الأسئلة الشائعة والمستخلصة من استفسارات الأسر
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1 font-medium">
                  Vanliga frågor och svar (FAQ) för familjer i Sverige
                </p>
              </div>
              <button
                onClick={() => setCurrentView("home")}
                className="text-xs sm:text-sm font-bold text-[#005293] hover:underline px-5 py-2.5 rounded-full bg-[#F0F7FF] cursor-pointer min-h-[40px]"
              >
                ← العودة للرئيسية
              </button>
            </div>

            <FAQSection
              onAskQuestion={(prefill, catId) => {
                if (catId) setActiveCategoryId(catId);
                handleStartAsk(prefill);
              }}
              onExploreCategory={handleExploreCategory}
            />
          </div>
        )}

        {currentView === "podcast" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#003C6E]">
                  بودكاست جسر الأسرة في السويد
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1 font-medium">
                  حوار يقرّب الفهم ويدعم الأسرة مع المستشارة «هبه»
                </p>
              </div>
              <button
                onClick={() => setCurrentView("home")}
                className="text-xs sm:text-sm font-bold text-[#005293] hover:underline px-5 py-2.5 rounded-full bg-[#F0F7FF] cursor-pointer min-h-[40px]"
              >
                ← العودة للرئيسية
              </button>
            </div>

            <PodcastSection />
          </div>
        )}

        {currentView === "ask" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#003C6E]">
                  صندوق الأسئلة والاستشارة المجهولة
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1 font-medium">
                  اطرح استفسارك بسرية تامة دون تسجيل أو أسماء واحصل على إجابة واضحة وموثوقة من القوانين السويدية.
                </p>
              </div>
              <button
                onClick={() => setCurrentView("home")}
                className="text-xs sm:text-sm font-bold text-[#005293] hover:underline px-5 py-2.5 rounded-full bg-[#F0F7FF] cursor-pointer min-h-[40px]"
              >
                ← العودة للرئيسية
              </button>
            </div>

            <AnonymousQuestionBox
              onEmergencyClick={handleOpenEmergency}
              selectedCategory={activeCategoryId}
              onSelectCategory={setActiveCategoryId}
              initialQuestion={prefillQuestion}
            />
          </div>
        )}

        {currentView === "categories" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#003C6E]">
                  أقسام الدليل الإرشادي السويدي الخمسة
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1 font-medium">
                  المدرسة، السوسيال، حقوق الطفل، النزاعات الأسرية، والحياة اليومية مع المصطلحات السويدية والخطوات العملية.
                </p>
              </div>
              <button
                onClick={() => setCurrentView("home")}
                className="text-xs sm:text-sm font-bold text-[#005293] hover:underline px-5 py-2.5 rounded-full bg-[#F0F7FF] cursor-pointer min-h-[40px]"
              >
                ← العودة للرئيسية
              </button>
            </div>

            <CategorySection
              activeCategory={activeCategoryId}
              onSelectCategory={setActiveCategoryId}
              onEmergencyClick={handleOpenEmergency}
              onAskQuestionAboutCategory={handleAskAboutCategory}
            />
          </div>
        )}

        {currentView === "glossary" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#003C6E]">
                  قاموس المصطلحات والمؤسسات السويدية للأسرة
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1 font-medium">
                  Svensk-Arabisk Ordlista för familjer i Sverige
                </p>
              </div>
              <button
                onClick={() => setCurrentView("home")}
                className="text-xs sm:text-sm font-bold text-[#005293] hover:underline px-5 py-2.5 rounded-full bg-[#F0F7FF] cursor-pointer min-h-[40px]"
              >
                ← العودة للرئيسية
              </button>
            </div>

            <GlossarySection initialSearchTerm={glossarySearchTerm} />
          </div>
        )}
      </main>

      {/* Global Search Overlay */}
      <GlobalSearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateToCategory={(catId, articleId) => {
          setActiveCategoryId(catId);
          setCurrentView("categories");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onNavigateToGlossary={(term) => {
          handleNavigateToGlossary(term);
        }}
        onNavigateToAsk={(questionText, catId) => {
          if (catId) setActiveCategoryId(catId);
          if (questionText) setPrefillQuestion(questionText);
          setCurrentView("ask");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onOpenEmergencyModal={() => {
          setIsEmergencyModalOpen(true);
        }}
      />

      {/* Floating Compact Help Button & BackToTop */}
      <BackToTop />

      {/* Emergency Help Modal */}
      <EmergencyHelpModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

      {/* Footer */}
      <Footer
        onSelectCategory={handleExploreCategory}
        onEmergencyClick={handleOpenEmergency}
        onOpenPodcast={() => {
          setCurrentView("podcast");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onOpenFAQ={() => {
          setCurrentView("faq");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onOpenBudget={() => {
          setCurrentView("budget");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
