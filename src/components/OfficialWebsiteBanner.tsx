import React from "react";
import { Globe, ExternalLink, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface OfficialWebsiteBannerProps {
  className?: string;
}

export const OfficialWebsiteBanner: React.FC<OfficialWebsiteBannerProps> = ({
  className = "",
}) => {
  const { i18n } = useTranslation();
  const lang = i18n.language || "ar";

  const getBannerText = () => {
    if (lang === "sv") {
      return "Upptäck mer på Familjebrons officiella webbplats i Sverige";
    }
    if (lang === "en") {
      return "Discover more on the official Familjebron Sweden website";
    }
    return "اكتشف المزيد على الموقع الرسمي لجسر الأسرة في السويد";
  };

  const getBadgeText = () => {
    if (lang === "sv") return "Officiell webbplats";
    if (lang === "en") return "Official Website";
    return "الموقع الرسمي";
  };

  return (
    <a
      id="official-website-banner"
      href="https://www.familjebronsverige.se/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="الموقع الرسمي لجسر الأسرة في السويد - familjebronsverige.se"
      className={`group relative block w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99] focus:outline-none focus:ring-3 focus:ring-[#005293]/40 ${className}`}
    >
      {/* Background with subtle gradient matching Swedish blue theme */}
      <div className="bg-gradient-to-r from-[#00335E] via-[#004A85] to-[#00335E] text-white p-3 sm:py-3.5 sm:px-5 border border-[#005FA8]/40 flex items-center justify-between gap-3 min-h-[48px] sm:min-h-[52px]">
        {/* Left / Right Main Content */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
          {/* Globe Icon Container */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 group-hover:bg-amber-400 group-hover:text-[#003C6E] text-amber-300 transition-all duration-200">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:rotate-12" />
          </div>

          {/* Text and Badge */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-xs sm:text-sm md:text-base font-black text-white group-hover:text-amber-100 transition-colors leading-snug">
              {getBannerText()}
            </span>

            {/* Official Badge */}
            <span className="hidden xs:inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 shrink-0 whitespace-nowrap">
              <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
              <span>{getBadgeText()}</span>
            </span>
          </div>
        </div>

        {/* Action Link / Domain Indicator */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-100 group-hover:text-white shrink-0 bg-white/10 group-hover:bg-white/20 px-3 py-1.5 rounded-xl border border-white/15 transition-all">
          <span className="hidden md:inline font-mono text-xs opacity-90 dir-ltr">familjebronsverige.se</span>
          <span className="hidden sm:inline">زيارة الموقع</span>
          <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[-2px] ltr:group-hover:translate-x-[2px] transition-transform" />
        </div>
      </div>
    </a>
  );
};
