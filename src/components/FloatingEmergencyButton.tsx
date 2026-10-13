import React, { useState, useRef, useEffect } from "react";
import {
  PhoneCall,
  X,
  AlertTriangle,
  HeartPulse,
  Shield,
  ExternalLink,
  ChevronUp,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface FloatingEmergencyButtonProps {
  onOpenFullModal: () => void;
}

export const FloatingEmergencyButton: React.FC<FloatingEmergencyButtonProps> = ({
  onOpenFullModal,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const buttonText = t("header.emergency") || "أين أجد المساعدة؟";

  return (
    <div
      ref={popoverRef}
      className="fixed bottom-5 left-5 z-50 flex flex-col items-start font-sans"
      dir="rtl"
    >
      {/* Small Popover Window */}
      {isOpen && (
        <div
          id="emergency-quick-popover"
          className="mb-2.5 w-[310px] sm:w-[340px] max-w-[calc(100vw-2.5rem)] bg-white rounded-[20px] shadow-2xl border border-red-100 overflow-hidden animate-fade-in text-gray-800"
          role="dialog"
          aria-labelledby="emergency-popover-title"
        >
          {/* Popover Header */}
          <div className="bg-[#DC2626] text-white px-4 sm:px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <h3
                id="emergency-popover-title"
                className="text-base sm:text-lg font-black tracking-tight"
              >
                هل تحتاج مساعدة طارئة؟
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="إغلاق نافذة المساعدة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Emergency Contacts */}
          <div className="p-4 space-y-2.5 bg-[#F8FAFC]">
            {/* 112 Card */}
            <a
              href="tel:112"
              className="flex items-center justify-between p-3 rounded-2xl bg-red-50 hover:bg-red-100/80 border border-red-200/80 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#DC2626] text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0 font-mono">
                  112
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-gray-900 group-hover:text-red-700">
                    الحالات الطارئة (Akut)
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    خطر على الحياة أو حوادث
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-red-600 bg-white px-2.5 py-1 rounded-full border border-red-200 group-hover:bg-red-600 group-hover:text-white transition-colors">
                اتصال
              </span>
            </a>

            {/* 1177 Card */}
            <a
              href="tel:1177"
              className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200/80 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#005293] text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0 font-mono">
                  1177
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-gray-900 group-hover:text-blue-700">
                    الاستشارات الصحية (Sjukvård)
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    استشارة طبية وممرضين 24/7
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#005293] bg-white px-2.5 py-1 rounded-full border border-blue-200 group-hover:bg-[#005293] group-hover:text-white transition-colors">
                اتصال
              </span>
            </a>

            {/* Quick Extra Numbers */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href="tel:116111"
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white border border-gray-200 hover:border-emerald-400 text-xs font-bold text-gray-800 hover:text-emerald-700 transition-colors"
              >
                <span>🧒 BRIS:</span>
                <span className="font-mono text-emerald-600 font-bold">116 111</span>
              </a>
              <a
                href="tel:11414"
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white border border-gray-200 hover:border-indigo-400 text-xs font-bold text-gray-800 hover:text-indigo-700 transition-colors"
              >
                <span>👮 الشرطة:</span>
                <span className="font-mono text-indigo-600 font-bold">114 14</span>
              </a>
            </div>

            {/* Open Full Modal Button */}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenFullModal();
              }}
              className="w-full mt-2 py-2.5 px-3.5 rounded-2xl bg-white hover:bg-gray-100 text-[#003C6E] text-xs sm:text-sm font-black border border-gray-200 flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[42px]"
            >
              <span>اعرف أين تحصل على المساعدة (الدليل الشامل)</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#005293]" />
            </button>
          </div>
        </div>
      )}

      {/* The Compact Floating Help Button */}
      <button
        id="floating-emergency-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={buttonText}
        className="w-[215px] sm:w-[240px] h-[50px] sm:h-[54px] max-w-[calc(100vw-2.5rem)] rounded-2xl bg-[#DC2626] hover:bg-[#B91C1C] active:scale-95 text-white font-black px-4 shadow-lg hover:shadow-xl shadow-red-900/25 transition-all duration-200 flex items-center justify-between cursor-pointer border border-white/30 select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <PhoneCall className="w-4 h-4 text-white animate-pulse" />
          </div>
          <span className="text-sm sm:text-base font-black whitespace-nowrap">
            {buttonText}
          </span>
        </div>

        <ChevronUp
          className={`w-4 h-4 text-white/90 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
    </div>
  );
};
