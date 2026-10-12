import React, { useState, useEffect } from "react";
import {
  Send,
  Sparkles,
  Shield,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Building2,
  RefreshCw,
  Copy,
  Check,
  HelpCircle,
  PhoneCall,
} from "lucide-react";
import { CategoryId, AIAnswer } from "../types";
import { CATEGORIES } from "../data/categories";
import { AudioPlayerButton } from "./AudioPlayerButton";
import { NoticeBanner } from "./NoticeBanner";

interface AnonymousQuestionBoxProps {
  onEmergencyClick: () => void;
  selectedCategory?: CategoryId;
  onSelectCategory?: (id: CategoryId) => void;
  initialQuestion?: string;
}

const PRESET_QUESTIONS = [
  {
    category: "social-services" as CategoryId,
    text: "وصلتني رسالة من السوسيال تطلب موعداً للحديث عن طفلي، ماذا أفعل وما هي حقوقي؟",
  },
  {
    category: "school" as CategoryId,
    text: "طفلي يرفض الذهاب للمدرسة ويشكو من صعوبة باللغة، كيف أطلب مساعدة من المدرسة؟",
  },
  {
    category: "child-rights" as CategoryId,
    text: "ما هي قواعد تربية وتأديب الأطفال في السويد، وأين ينتهي حق الأهل ويبدأ القانون؟",
  },
  {
    category: "family-disputes" as CategoryId,
    text: "نحن في خلاف عائلي ونفكر بالانفصال، كيف تحمى حقوق الأطفال وما هي خدمة Familjerådgivning؟",
  },
  {
    category: "daily-life" as CategoryId,
    text: "كيف أستفيد من تعويض رعاية الطفل المريض (VAB) وما هي خطوات صندوق التأمينات Försäkringskassan؟",
  },
];

export const AnonymousQuestionBox: React.FC<AnonymousQuestionBoxProps> = ({
  onEmergencyClick,
  selectedCategory = "school",
  onSelectCategory,
  initialQuestion,
}) => {
  const [question, setQuestion] = useState(initialQuestion || "");
  const [activeCat, setActiveCat] = useState<CategoryId>(selectedCategory);
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState<AIAnswer | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialQuestion !== undefined) {
      setQuestion(initialQuestion);
    }
  }, [initialQuestion]);

  useEffect(() => {
    setActiveCat(selectedCategory);
  }, [selectedCategory]);

  const handleCategoryChange = (id: CategoryId) => {
    setActiveCat(id);
    onSelectCategory?.(id);
  };

  const handlePresetClick = (q: typeof PRESET_QUESTIONS[0]) => {
    setActiveCat(q.category);
    setQuestion(q.text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);
    setAnswer(null);

    const activeCatInfo = CATEGORIES.find((c) => c.id === activeCat);
    const categoryName = activeCatInfo ? `${activeCatInfo.titleArabic} (${activeCatInfo.titleSwedish})` : "عام";

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          category: categoryName,
        }),
      });

      if (!response.ok) {
        throw new Error(`خطأ في الاستجابة (${response.status})`);
      }

      const data = await response.json();
      if (data.answer) {
        setAnswer(data.answer);
      } else {
        throw new Error("لم تصل إجابة متوافقة");
      }
    } catch (err: any) {
      console.error("Ask error:", err);
      // Fallback helpful answer if server is unavailable
      setAnswer({
        summary: `أهلاً بك. بخصوص استفسارك حول "${question.trim()}": في النظام السويدي، تركز القوانين على مصلحة الطفل الفضلى (Barnets bästa) والتعاون الإيجابي بين الأسرة والمؤسسات الرسمية.`,
        steps: [
          "تواصل مباشرة مع الجهة المعنية واطلب حضور مترجم مجاني بلغتك الأم (Tolk) لضمان فهم كافة التفاصيل دون أي التباس.",
          "اطلع على حقوقك في اتفاقية حقوق الطفل وقوانين المدرسة والرعاية الاجتماعية عبر الأقسام التفاعلية في هذا التطبيق.",
          "إذا كان لديك أي قلق بشأن رسائل رسمية، توجه لقسم استقبال المواطنين (Medborgarkontor) في بلديتك للمساعدة."
        ],
        swedishTerms: [
          { term: "Tolk", arabic: "مترجم فوري مجاني", note: "حق قانوني مجاني في كافة المراجعات الحكومية" },
          { term: "Barnets bästa", arabic: "مصلحة الطفل الفضلى", note: "المبدأ الأساسي في القانون السويدي" },
          { term: "Socialtjänsten", arabic: "الخدمات الاجتماعية", note: "تقديم المساعدات والبرامج التربوية" }
        ],
        authorities: [
          { name: "البلدية والمدرسة (Kommun & Skola)", role: "تقديم الدعم المباشر ومتابعة الطفل", contact: "عبر موقع بلديتك الرسمي" },
          { name: "الدليل الصحي 1177", role: "الاستشارات الطبية والتمريضية", contact: "هاتف: 1177" }
        ],
        disclaimer: "هذه المعلومات هي إرشاد عام وليست استشارة قانونية. في حال وجود خطر عاجل، اتصل فوراً بالرقم 112."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAnswer = () => {
    if (!answer) return;
    const textToCopy = `جسر الأسرة في السويد - إجابة استرشادية:\n\nالسؤال: ${question}\n\nالملخص:\n${answer.summary}\n\nالخطوات العملية:\n${answer.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nالمصطلحات السويدية:\n${answer.swedishTerms.map((t) => `- ${t.term}: ${t.arabic} (${t.note})`).join("\n")}\n\n${answer.disclaimer}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentCategoryInfo = CATEGORIES.find((c) => c.id === activeCat) || CATEGORIES[0];

  const fullAnswerTextForAudio = answer
    ? `${answer.summary}. الخطوات العملية: ${answer.steps.join(". ")}. تنبيه هام: ${answer.disclaimer}`
    : "";

  return (
    <section id="anonymous-question-section" className="w-full">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 relative">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-gray-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-[#EAF6ED] text-[#1E7E34] border border-[#D1EAD8]">
                <Shield className="w-4 h-4 text-[#1E7E34]" />
                <span>مجهول 100% وبدون تسجيل</span>
              </span>
              <span className="text-xs sm:text-sm text-gray-500 font-mono font-medium">Anonym Frågelåda</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#003C6E]">
              صندوق الأسئلة والاستشارات المجهول
            </h2>
            <p className="text-base sm:text-lg text-[#2D3748] max-w-3xl leading-[1.75] font-medium">
              اطرح أي سؤال بالعربية حول المدرسة، السوسيال، حقوق الطفل، أو الحياة في السويد، واحصل على إجابة هادئة ومبسطة بخطوات عملية ومصطلحات سويدية رسمية.
            </p>
          </div>
        </div>

        {/* Category selector pills */}
        <div className="mt-6 space-y-2.5">
          <label className="block text-sm sm:text-base font-black text-[#1e293b]">
            اختر التصنيف الأنسب لاستفسارك:
          </label>
          <div className="flex flex-wrap gap-2.5">
            {CATEGORIES.map((cat) => {
              const isSelected = cat.id === activeCat;
              return (
                <button
                  key={cat.id}
                  id={`cat-btn-${cat.id}`}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 border min-h-[42px] ${
                    isSelected
                      ? "bg-[#005293] text-white border-[#005293] shadow-xs"
                      : "bg-[#F8FAFC] hover:bg-gray-100 text-[#2D3748] border-gray-200"
                  }`}
                >
                  <span>{cat.titleArabic}</span>
                  <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-gray-200/80 text-gray-800"}`}>
                    {cat.titleSwedish}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preset sample questions */}
        <div className="mt-6 bg-[#F0F7FF] border border-blue-100 rounded-3xl p-5 sm:p-6">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-[#005293] mb-3">
            <HelpCircle className="w-4 h-4 text-[#005293]" />
            <span>أسئلة شائعة يسألها القادمون الجدد في السويد (انقر لتجربتها):</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {PRESET_QUESTIONS.map((pq, idx) => (
              <button
                key={idx}
                id={`preset-question-${idx}`}
                type="button"
                onClick={() => handlePresetClick(pq)}
                className="text-xs sm:text-sm bg-white hover:bg-[#EAF6ED] text-[#2D3748] hover:text-[#005293] px-4 py-2.5 rounded-2xl border border-gray-200 transition-all text-right cursor-pointer shadow-2xs font-medium leading-relaxed"
              >
                {pq.text}
              </button>
            ))}
          </div>
        </div>

        {/* Question Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="question-input" className="block text-sm sm:text-base font-black text-[#1e293b] mb-2">
              اكتب سؤالك بكلماتك البسيطة:
            </label>
            <div className="relative">
              <textarea
                id="question-input"
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="مثال: وصلني استدعاء من المدرسة لأن طفلي لم يحضر حصة السباحة، ما هو القانون وماذا أفعل بهدوء؟"
                className="w-full rounded-3xl border border-gray-200 bg-[#F8FAFC] p-5 text-base sm:text-lg text-[#2D3748] placeholder:text-gray-400 focus:bg-white focus:border-[#005293] focus:ring-2 focus:ring-blue-100 transition-all resize-none shadow-2xs leading-[1.7]"
                required
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 font-medium">
              <Shield className="w-4 h-4 text-[#4CAF50] shrink-0" />
              <span>لا يتم حفظ أي بيانات شخصية أو أسماء أو عناوين IP.</span>
            </div>

            <button
              id="submit-question-btn"
              type="submit"
              disabled={isLoading || !question.trim()}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#005293] hover:bg-[#003C6E] disabled:bg-gray-300 text-white font-black text-sm sm:text-base transition-all shadow-sm hover:shadow-md disabled:cursor-not-allowed cursor-pointer min-h-[48px]"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري إعداد الإجابة الموثوقة...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>احصل على إجابة واضحة</span>
                  <Send className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Render Answer Box */}
        {answer && (
          <div
            id="ai-answer-container"
            className="mt-8 rounded-3xl bg-[#F8FAFC] border border-gray-200 p-6 sm:p-8 shadow-sm animate-fade-in space-y-6"
          >
            {/* Answer Header with Audio & Copy */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#005293] text-white flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#003C6E]">
                    الإجابة الإرشادية الموثوقة
                  </h3>
                  <span className="text-xs sm:text-sm text-gray-500 font-mono font-medium">
                    Enligt svensk lagstiftning och praxis
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {/* Audio read-aloud TTS button */}
                <AudioPlayerButton
                  textToRead={fullAnswerTextForAudio}
                  label="استمع للإجابة صوتياً"
                  size="md"
                />

                <button
                  id="copy-answer-btn"
                  type="button"
                  onClick={handleCopyAnswer}
                  className="px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-[#4A5568] text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs min-h-[38px]"
                  title="نسخ الإجابة"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-[#4CAF50]" />
                      <span className="text-[#1E7E34]">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-gray-500" />
                      <span>نسخ</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 1. Summary */}
            <div className="space-y-2.5">
              <h4 className="text-base font-black text-[#003C6E] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#005293]" />
                <span>الشرح والملخص المباشر:</span>
              </h4>
              <p className="text-base sm:text-lg text-[#2D3748] leading-[1.8] whitespace-pre-line bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs font-medium">
                {answer.summary}
              </p>
            </div>

            {/* 2. Step by step practical actions */}
            {answer.steps && answer.steps.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-base font-black text-[#1E7E34] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
                  <span>الخطوات العملية المقترحة (ماذا تفعل بهدوء؟):</span>
                </h4>
                <div className="space-y-2.5">
                  {answer.steps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#4CAF50] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <p className="text-sm sm:text-base text-[#2D3748] leading-[1.75] font-medium">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Swedish Keywords & Terms */}
            {answer.swedishTerms && answer.swedishTerms.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-base font-black text-[#003C6E] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#005293]" />
                  <span>المصطلحات السويدية الهامة للتعرف عليها في الخطابات والمقابلات:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {answer.swedishTerms.map((term, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm font-bold font-mono px-3 py-1 rounded-full bg-[#F0F7FF] text-[#005293]">
                          {term.term}
                        </span>
                        <span className="text-sm sm:text-base font-bold text-[#2D3748]">
                          {term.arabic}
                        </span>
                      </div>
                      {term.note && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                          {term.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Official Responsible Authorities */}
            {answer.authorities && answer.authorities.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-base font-black text-[#003C6E] flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#005293]" />
                  <span>الجهات الرسمية المسؤولة:</span>
                </h4>
                <div className="space-y-2.5">
                  {answer.authorities.map((auth, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs sm:text-sm shadow-2xs"
                    >
                      <div>
                        <strong className="text-[#2D3748] block text-sm sm:text-base font-bold">{auth.name}</strong>
                        <span className="text-gray-600 font-medium">{auth.role}</span>
                      </div>
                      <span className="font-mono font-bold text-[#005293] bg-[#F0F7FF] px-3 py-1 rounded-full self-start sm:self-center text-xs sm:text-sm">
                        {auth.contact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Required Mandatory Legal Disclaimer & Emergency trigger */}
            <div className="pt-2">
              <NoticeBanner
                variant="subtle"
                onEmergencyClick={onEmergencyClick}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
