import React from "react";
import {
  Sparkles,
  MessageSquare,
  PhoneCall,
  CheckCircle2,
  ArrowLeft,
  Radio,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { CategoryId } from "../types";
import { CATEGORIES } from "../data/categories";
import { AudioPlayerButton } from "./AudioPlayerButton";

interface HeroProps {
  onStartAsk: () => void;
  onExploreCategory: (id: CategoryId) => void;
  onEmergencyClick: () => void;
  onOpenGlossary: () => void;
  onOpenPodcast?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onStartAsk,
  onExploreCategory,
  onEmergencyClick,
  onOpenGlossary,
  onOpenPodcast,
}) => {
  const { t } = useTranslation();
  
  const introAudioText = t("hero.description");

  return (
    <section id="hero-section" className="w-full space-y-6">
      {/* Main Hero Banner - Clean Minimalism Soft Mint & Navy Style */}
      <div className="relative overflow-hidden rounded-3xl bg-[#EAF6ED] text-[#2D3748] p-6 sm:p-10 lg:p-12 shadow-sm border border-[#D1EAD8]">
        <div className="relative z-10 max-w-4xl space-y-5">
          {/* Top Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-[#D1EAD8] text-[#005293]">
              <Sparkles className="w-4 h-4 text-[#005293]" />
              <span>{t("hero.badge")}</span>
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-[28px] sm:text-4xl lg:text-[38px] font-black text-[#003C6E] tracking-tight leading-[1.3] font-sans">
            {t("hero.headline")}
          </h1>

          {/* Project Explanation */}
          <p className="text-[16px] sm:text-lg lg:text-[19px] text-[#2D3748] leading-[1.75] max-w-3xl font-medium">
            {t("hero.description")}
          </p>

          {/* Audio TTS for Hero */}
          <div className="pt-1">
            <AudioPlayerButton
              textToRead={introAudioText}
              label={t("hero.audioLabel")}
              size="md"
              className="bg-white hover:bg-gray-50 text-[#005293] border border-[#D1EAD8] shadow-2xs text-sm sm:text-base"
            />
          </div>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              id="hero-ask-btn"
              onClick={onStartAsk}
              className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-[#005293] hover:bg-[#003C6E] text-white font-bold text-base sm:text-lg flex items-center gap-2.5 transition-all shadow-sm hover:shadow-md cursor-pointer min-h-[48px]"
            >
              <MessageSquare className="w-5 h-5" />
              <span>{t("hero.askButton")}</span>
            </button>

            {onOpenPodcast && (
              <button
                id="hero-podcast-btn"
                onClick={onOpenPodcast}
                className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-amber-400 hover:bg-amber-500 text-[#003C6E] font-black text-base sm:text-lg flex items-center gap-2.5 transition-all shadow-sm hover:shadow-md cursor-pointer group min-h-[48px]"
              >
                <Radio className="w-5 h-5 text-[#003C6E] group-hover:animate-pulse" />
                <span>{t("hero.podcastButton")}</span>
              </button>
            )}

            <button
              id="hero-emergency-btn"
              onClick={onEmergencyClick}
              className="hover-green-pulse px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-[#4CAF50] hover:bg-[#43a047] active:scale-95 text-white font-bold text-base sm:text-lg flex items-center gap-2.5 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:ring-4 hover:ring-emerald-400/40 group min-h-[48px]"
            >
              <PhoneCall className="w-5 h-5 text-white group-hover:animate-bounce transition-transform" />
              <span>{t("hero.emergencyButton")}</span>
            </button>
          </div>


          {/* Trust points */}
          <div className="pt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm sm:text-base text-[#2D3748] border-t border-[#D1EAD8] mt-6 font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#4CAF50] shrink-0" />
              <span>{t("hero.trust1")}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#4CAF50] shrink-0" />
              <span>{t("hero.trust2")}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#4CAF50] shrink-0" />
              <span>{t("hero.trust3")}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#4CAF50] shrink-0" />
              <span>{t("hero.trust4")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Swedish Keywords Quick Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-[#003C6E] shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#005293]"></span>
          <span>{t("hero.keywords")}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs sm:text-sm px-3.5 py-1.5 rounded-full bg-[#F0F7FF] text-[#005293] font-bold font-mono border border-blue-100">
            Socialtjänsten (السوسيال)
          </span>
          <span className="text-xs sm:text-sm px-3.5 py-1.5 rounded-full bg-[#F8FAFC] text-[#2D3748] font-bold font-mono border border-gray-200">
            Skola & Förskola (المدرسة والروضة)
          </span>
          <span className="text-xs sm:text-sm px-3.5 py-1.5 rounded-full bg-[#EAF6ED] text-[#1E7E34] font-bold font-mono border border-[#D1EAD8]">
            1177 Vårdguiden (الرعاية الصحية)
          </span>
          <span className="text-xs sm:text-sm px-3.5 py-1.5 rounded-full bg-[#FFFBEB] text-[#92400E] font-bold font-mono border border-amber-200">
            Barnkonventionen (حقوق الطفل)
          </span>
          <span className="text-xs sm:text-sm px-3.5 py-1.5 rounded-full bg-[#FAF5FF] text-[#6B21A8] font-bold font-mono border border-purple-200">
            Orosanmälan (بلاغ القلق)
          </span>
          <button
            onClick={onOpenGlossary}
            className="text-xs sm:text-sm text-[#005293] font-bold hover:underline px-3 py-1.5 cursor-pointer"
          >
            {t("hero.glossaryLink")}
          </button>
        </div>
      </div>

      {/* 5 Core Category Quick Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] sm:text-2xl lg:text-[28px] font-black text-[#003C6E]">
            {t("hero.categoriesTitle")}
          </h2>
          <span className="text-xs sm:text-sm text-gray-500 font-mono font-bold">
            {t("hero.categoriesLabel")}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              id={`quick-cat-card-${cat.id}`}
              onClick={() => onExploreCategory(cat.id)}
              className="bg-white hover:bg-slate-50/70 rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-100 flex flex-col justify-between hover:border-[#005293] transition-all cursor-pointer group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#005293] font-bold text-xs sm:text-sm uppercase tracking-wide font-mono bg-blue-50 px-2.5 py-1 rounded-full">
                    {cat.titleSwedish}
                  </span>
                  <span className="text-sm text-[#005293] font-black group-hover:translate-x-[-4px] transition-transform">
                    ←
                  </span>
                </div>
                <h3 className="text-[19px] sm:text-xl font-bold text-[#1e293b] group-hover:text-[#005293] transition-colors leading-snug">
                  {cat.titleArabic}
                </h3>
                <p className="text-[15px] sm:text-base text-gray-600 leading-[1.7]">
                  {cat.descriptionArabic}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between text-sm sm:text-base font-bold text-[#005293]">
                <span>تصفح الإرشادات والخطوات</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
              </div>
            </div>
          ))}

          {/* Glossary Card in Clean Navy Minimalist style */}
          <div
            onClick={onOpenGlossary}
            className="bg-[#005293] p-6 sm:p-7 rounded-3xl shadow-sm flex flex-col justify-between text-white hover:bg-[#004077] transition-all cursor-pointer group"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wide text-white/90 bg-white/15 px-2.5 py-1 rounded-full">
                  Ordlista
                </span>
                <span className="text-sm text-white font-black group-hover:translate-x-[-4px] transition-transform">←</span>
              </div>
              <h3 className="text-[19px] sm:text-xl font-bold text-white leading-snug">
                {t("hero.glossaryCardTitle")}
              </h3>
              <p className="text-[15px] sm:text-base text-white/90 leading-[1.7]">
                {t("hero.glossaryCardDesc")}
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-white/20 flex items-center justify-between text-sm sm:text-base font-bold text-white">
              <span>{t("hero.glossaryCardLink")}</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
