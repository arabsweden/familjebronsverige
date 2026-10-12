import React from "react";
import { AlertCircle, PhoneCall } from "lucide-react";

interface NoticeBannerProps {
  variant?: "inline" | "full" | "subtle";
  onEmergencyClick?: () => void;
  className?: string;
}

export const NoticeBanner: React.FC<NoticeBannerProps> = ({
  variant = "full",
  onEmergencyClick,
  className = "",
}) => {
  if (variant === "subtle") {
    return (
      <div
        id="notice-banner-subtle"
        className={`bg-[#FFFBEB] border border-amber-200 rounded-3xl p-4 sm:p-5 text-sm sm:text-base text-[#78350F] flex items-start gap-3 shadow-2xs ${className}`}
      >
        <AlertCircle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
        <div className="flex-1 leading-relaxed font-medium">
          <strong className="text-[#92400E] font-black">تنبيه قانوني هام:</strong> هذه المعلومات هي إرشاد عام وتوعية مبسطة وليست استشارة قانونية مخصصة. في حال وجود خطر عاجل أو طوارئ، اتصل فوراً بالرقم <span className="font-black text-red-600 tracking-wider">112</span>.
        </div>
      </div>
    );
  }

  return (
    <div
      id="notice-banner-full"
      className={`bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 relative overflow-hidden ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#EAF6ED] text-[#1E7E34] border border-[#D1EAD8] flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base sm:text-lg font-black text-[#003C6E]">إرشاد عام موثوق للأسرة</h4>
              <span className="text-xs px-3 py-0.5 rounded-full bg-[#F0F7FF] text-[#005293] font-mono font-bold">
                Allmän vägledning
              </span>
            </div>
            <p className="text-sm sm:text-base text-gray-700 mt-1.5 leading-relaxed max-w-3xl font-medium">
              هذه المعلومات هي إرشاد عام وليست استشارة قانونية. في حال وجود خطر عاجل على سلامة أو حياة أي شخص، اتصل فوراً برقم الطوارئ <strong className="text-red-600 font-black">112</strong>.
            </p>
          </div>
        </div>

        {onEmergencyClick && (
          <button
            id="emergency-quick-btn-notice"
            onClick={onEmergencyClick}
            className="hover-green-pulse self-end sm:self-center shrink-0 flex items-center gap-2 bg-[#4CAF50] hover:bg-[#43a047] active:scale-95 text-white text-xs sm:text-sm font-black px-6 py-3 rounded-full transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:ring-4 hover:ring-emerald-400/40 group min-h-[44px]"
          >
            <PhoneCall className="w-4 h-4 text-white group-hover:animate-bounce transition-transform" />
            <span>أين أجد المساعدة؟</span>
          </button>
        )}
      </div>
    </div>
  );
};
