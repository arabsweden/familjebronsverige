import React, { useState } from "react";
import {
  X,
  PhoneCall,
  AlertTriangle,
  Heart,
  Shield,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Info,
} from "lucide-react";
import { EMERGENCY_AUTHORITIES } from "../data/emergencyContacts";
import { AudioPlayerButton } from "./AudioPlayerButton";

interface EmergencyHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyHelpModal: React.FC<EmergencyHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [filter, setFilter] = useState<"all" | "emergency" | "urgent" | "routine">("all");

  if (!isOpen) return null;

  const filteredAuthorities = EMERGENCY_AUTHORITIES.filter((item) => {
    if (filter === "all") return true;
    return item.urgency === filter;
  });

  const emergencyOverviewText =
    "أرقام المساعدة الرسمية في السويد: في الحالات الخطيرة المهددة للحياة اتصل برقم 112. للاستشارات الطبية الموثوقة على مدار الساعة اتصل برقم 1177. للسوسيال والدعم الأسري تواصل مع بلديتك، ولشؤون التعليم تواصل مع مدرسة طفلك.";

  return (
    <div
      id="emergency-help-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        id="emergency-help-modal-content"
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="bg-[#005293] text-white p-6 sm:p-8 shrink-0 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shadow-inner">
                <PhoneCall className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xs sm:text-sm uppercase font-bold tracking-widest text-blue-200 font-mono">
                  Var hittar jag hjälp?
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  أين أجد المساعدة في السويد؟
                </h2>
              </div>
            </div>
            <button
              id="emergency-modal-close-btn"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
              aria-label="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm sm:text-base text-blue-100 mt-3.5 leading-relaxed font-medium">
            دليل مباشر للأرقام والجهات السويدية الرسمية المعتمدة لحالات الطوارئ، الرعاية الصحية، الدعم الأسري، والتعليم.
          </p>

          <div className="mt-4 flex items-center justify-between">
            <AudioPlayerButton
              textToRead={emergencyOverviewText}
              label="استمع لأرقام الطوارئ صوتياً"
              size="md"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-full text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* Filter Badges */}
        <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-gray-100 flex flex-wrap items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-gray-600 ml-1">تصفية حسب الحالة:</span>
          <button
            id="filter-emergency-all"
            onClick={() => setFilter("all")}
            className={`px-4 py-2 text-xs sm:text-sm rounded-full font-bold transition-all cursor-pointer min-h-[38px] ${
              filter === "all"
                ? "bg-[#005293] text-white shadow-xs"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            الكل ({EMERGENCY_AUTHORITIES.length})
          </button>
          <button
            id="filter-emergency-urgent"
            onClick={() => setFilter("emergency")}
            className={`px-4 py-2 text-xs sm:text-sm rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[38px] ${
              filter === "emergency"
                ? "bg-[#DC2626] text-white shadow-xs"
                : "bg-[#FEF2F2] text-[#DC2626] hover:bg-red-100 border border-red-200"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            طوارئ عاجلة (112)
          </button>
          <button
            id="filter-emergency-medical"
            onClick={() => setFilter("urgent")}
            className={`px-4 py-2 text-xs sm:text-sm rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[38px] ${
              filter === "urgent"
                ? "bg-[#005293] text-white shadow-xs"
                : "bg-[#F0F7FF] text-[#005293] hover:bg-blue-100 border border-blue-200"
            }`}
          >
            <Heart className="w-4 h-4" />
            صحة وسوسيال (1177 / Socialtjänsten)
          </button>
          <button
            id="filter-emergency-routine"
            onClick={() => setFilter("routine")}
            className={`px-4 py-2 text-xs sm:text-sm rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[38px] ${
              filter === "routine"
                ? "bg-[#4CAF50] text-white shadow-xs"
                : "bg-[#EAF6ED] text-[#1E7E34] hover:bg-emerald-100 border border-emerald-200"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            مدرسة ودعم نفسي (Skola / BRIS)
          </button>
        </div>

        {/* Modal Body - List of authorities */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {filteredAuthorities.map((auth, index) => {
            const isTop112 = auth.contactNumber === "112";
            const is1177 = auth.contactNumber === "1177";

            return (
              <div
                key={index}
                id={`emergency-card-${index}`}
                className={`rounded-3xl p-5 sm:p-6 transition-all ${
                  isTop112
                    ? "bg-[#FEF2F2] border border-[#FCA5A5] shadow-xs"
                    : is1177
                    ? "bg-[#F0F7FF] border border-[#BAE6FD] shadow-xs"
                    : "bg-white hover:bg-[#F8FAFC] border border-gray-100 shadow-2xs"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-mono font-bold px-3 py-1 rounded-full bg-[#005293] text-white">
                        {auth.nameSwedish}
                      </span>
                      {isTop112 && (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#DC2626] text-white">
                          طوارئ مهددة للحياة
                        </span>
                      )}
                      {is1177 && (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#005293] text-white">
                          دليل طبي واستشارات
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#1e293b]">
                      {auth.nameArabic}
                    </h3>
                  </div>

                  {auth.contactNumber && (
                    <a
                      id={`call-button-${auth.contactNumber.replace(/\s+/g, "")}`}
                      href={auth.contactNumber.includes("http") ? auth.contactNumber : `tel:${auth.contactNumber.replace(/[^0-9+]/g, "")}`}
                      className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-black text-sm sm:text-base shrink-0 transition-all shadow-xs cursor-pointer min-h-[44px] ${
                        isTop112
                          ? "bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-red-200"
                          : is1177
                          ? "bg-[#005293] hover:bg-[#003C6E] text-white"
                          : "bg-[#005293] hover:bg-[#003C6E] text-white"
                      }`}
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span dir="ltr">{auth.contactNumber}</span>
                    </a>
                  )}
                </div>

                <p className="text-sm sm:text-base text-gray-700 mt-3 leading-[1.7]">
                  {auth.description}
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm bg-white/90 p-3.5 rounded-2xl text-gray-700 border border-gray-200/80">
                  <div>
                    <span className="font-bold text-gray-900 ml-1">متى تتصل؟:</span>
                    <span>{auth.whenToContact}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 ml-1">أوقات العمل:</span>
                    <span>{auth.openingHours}</span>
                  </div>
                </div>

                {auth.website && (
                  <div className="mt-3 text-right">
                    <a
                      href={auth.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#005293] hover:underline"
                    >
                      <span>الموقع الرسمي ({auth.nameSwedish})</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#F8FAFC] border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-[#005293] shrink-0" />
            <span className="font-medium">يمكنك دائماً طلب مترجم مجاني باللغة العربية (Tolk) عند التحدث مع أي جهة رسمية.</span>
          </div>
          <button
            id="emergency-modal-close-bottom-btn"
            onClick={onClose}
            className="w-full sm:w-auto px-7 py-3 bg-[#005293] hover:bg-[#003C6E] text-white font-bold rounded-full transition-all cursor-pointer min-h-[44px]"
          >
            إغلاق الدليل
          </button>
        </div>
      </div>
    </div>
  );
};
