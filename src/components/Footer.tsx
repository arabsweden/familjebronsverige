import React from "react";
import { PhoneCall, Shield, ExternalLink, Heart, AlertCircle } from "lucide-react";
import { CategoryId } from "../types";

interface FooterProps {
  onSelectCategory: (id: CategoryId) => void;
  onEmergencyClick: () => void;
  onOpenPodcast?: () => void;
  onOpenFAQ?: () => void;
  onOpenBudget?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onEmergencyClick,
  onOpenPodcast,
  onOpenFAQ,
  onOpenBudget,
}) => {
  return (
    <footer id="main-footer" className="bg-[#002D54] text-[#E2E8F0] mt-16 border-t border-[#003C6E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Top Emergency CTA in footer */}
        <div className="help-bottom-section">
          <button
            id="footer-emergency-btn"
            onClick={onEmergencyClick}
            className="help-bottom-button"
          >
            <PhoneCall className="w-6 h-6" />
            <span>أين أجد المساعدة؟</span>
          </button>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="text-lg font-bold text-white">جسر الأسرة في السويد</span>
            </div>
            <p className="text-xs text-blue-200 leading-relaxed">
              منصة غير ربحية تهدف لتعزيز الأمان والاستقرار وفهم القوانين والأنظمة السويدية للعائلات الناطقة بالعربية بكل هدوء وشفافية.
            </p>
            {onOpenPodcast && (
              <button
                onClick={onOpenPodcast}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold hover:bg-amber-400/30 transition-colors cursor-pointer"
              >
                <span>🎙️ استمع لبودكاست جسر الأسرة</span>
              </button>
            )}
            <div className="text-[11px] text-blue-300 font-mono">
              Familjens Bro i Sverige — Ett initiativ för trygghet och kunskap
            </div>
            {onOpenFAQ && (
              <button
                onClick={onOpenFAQ}
                className="text-xs text-sky-200 hover:text-white font-bold block pt-1 hover:underline cursor-pointer"
              >
                ❓ الأسئلة الشائعة والأجوبة (FAQ)
              </button>
            )}
            {onOpenBudget && (
              <button
                onClick={onOpenBudget}
                className="text-xs text-amber-300 hover:text-white font-bold block pt-1 hover:underline cursor-pointer"
              >
                📊 مخطط ميزانية الأسرة في السويد
              </button>
            )}
          </div>

          {/* Core Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              أقسام الدليل (Kategorier)
            </h4>
            <ul className="space-y-2 text-xs text-blue-200">
              <li>
                <button
                  onClick={() => onSelectCategory("school")}
                  className="hover:text-white transition-colors cursor-pointer text-right"
                >
                  المدرسة والتواصل مع المدرسة (Skola)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory("social-services")}
                  className="hover:text-white transition-colors cursor-pointer text-right"
                >
                  السوسيال وخدمات الأسرة (Socialtjänsten)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory("child-rights")}
                  className="hover:text-white transition-colors cursor-pointer text-right"
                >
                  حقوق الطفل وواجبات الأهل (Barnets rättigheter)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory("family-disputes")}
                  className="hover:text-white transition-colors cursor-pointer text-right"
                >
                  النزاعات الأسرية والطلاق (Familjerätt)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory("daily-life")}
                  className="hover:text-white transition-colors cursor-pointer text-right"
                >
                  الحياة اليومية في السويد (Vardagsliv)
                </button>
              </li>
            </ul>
          </div>

          {/* Official Swedish Authorities Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              الجهات السويدية الرسمية (Myndigheter)
            </h4>
            <ul className="space-y-2 text-xs text-blue-200">
              <li>
                <a
                  href="https://www.socialstyrelsen.se"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Socialstyrelsen (الشؤون الاجتماعية)</span>
                  <ExternalLink className="w-3 h-3 text-blue-300" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.skolverket.se"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Skolverket (مصلحة المدارس)</span>
                  <ExternalLink className="w-3 h-3 text-blue-300" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.1177.se"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>1177 Vårdguiden (الدليل الصحي)</span>
                  <ExternalLink className="w-3 h-3 text-blue-300" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.barnombudsmannen.se"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Barnombudsmannen (مفوض حقوق الطفل)</span>
                  <ExternalLink className="w-3 h-3 text-blue-300" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.forsakringskassan.se"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Försäkringskassan (التأمينات الاجتماعية)</span>
                  <ExternalLink className="w-3 h-3 text-blue-300" />
                </a>
              </li>
            </ul>
          </div>

          {/* Rights & Disclaimer Column */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              إخلاء المسؤولية القانونية
            </h4>
            <div className="bg-[#003C6E] p-4 rounded-2xl border border-blue-400/20 text-xs text-blue-100 leading-relaxed">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold mb-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>إرشاد عام وتوعية</span>
              </div>
              هذه المعلومات هي إرشاد عام وليست استشارة قانونية مخصصة. في حال وجود خطر عاجل، اتصل فوراً بالرقم <strong className="text-white">112</strong>.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#003C6E] flex flex-col items-center gap-6 text-xs text-blue-200">
          {/* Credits and Disclaimer */}
          <div className="text-center space-y-1">
            <div>
              © {new Date().getFullYear()} جسر الأسرة في السويد — افهم حقوقك وخطواتك بهدوء.
            </div>
            
            <div className="font-bold text-blue-100 text-sm mt-2">
              RAED SHIHAB
            </div>
            <div className="text-[10px] opacity-70 mt-1">
              تطبيق بالذكاء الاصطناعي لا نتحمل اي مسؤولية
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="hover:text-white transition-colors cursor-pointer">الخصوصية التامة</span>
            <span>•</span>
            <span className="hover:text-white transition-colors cursor-pointer">المصادر الرسمية المعتمدة</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
