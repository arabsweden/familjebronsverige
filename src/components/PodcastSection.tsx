import React, { useState } from "react";
import {
  Mic,
  Radio,
  Sparkles,
  Copy,
  Check,
  Download,
  RotateCcw,
  Film,
  Clock,
  HeartHandshake,
  MessageSquare,
  ShieldAlert,
  Volume2,
  Share2,
  ChevronRight,
  Info,
  Layers,
  User,
  Headphones,
} from "lucide-react";
import { PodcastDuration, PodcastTone, PodcastGenerationResult } from "../types";
import { AudioPlayerButton } from "./AudioPlayerButton";

interface PreMadeExample {
  title: string;
  story: string;
  categoryName: string;
  defaultGuest: string;
  suggestedDuration: PodcastDuration;
  suggestedTone: PodcastTone;
}

const PRE_MADE_EXAMPLES: PreMadeExample[] = [
  {
    title: "ابني يواجه صعوبة في المدرسة والتأقلم",
    story:
      "ابني يبلغ من العمر 9 سنوات، بدأ يشعر بصعوبة في استيعاب بعض المواد باللغة السويدية، ويشعر بالإحباط أحياناً في الفصل. كيف أطلب دعماً إضافياً (Extra anpassningar) من المدرسة وفريق صحة الطالب دون تعقيدات؟",
    categoryName: "المدرسة والتعليم",
    defaultGuest: "أحمد",
    suggestedDuration: "3min",
    suggestedTone: "مطمئنة",
  },
  {
    title: "كيف أتواصل مع السوسيال بدون خوف؟",
    story:
      "تلقيت موعداً من الخدمات الاجتماعية (Socialtjänsten) بعد بلاغ قلق من الحضانة بسبب كثرة غياب طفلتي عند مرضها. أشعر بقلق شديد بسبب ما يُشاع على الإنترنت. كيف أتعامل مع المقابلة بهدوء وشفافية وأطلب مترجماً؟",
    categoryName: "الخدمات الاجتماعية",
    defaultGuest: "سامي",
    suggestedDuration: "3min",
    suggestedTone: "مطمئنة",
  },
  {
    title: "خلاف بين الوالدين بعد الانفصال وتنظيم رعاية الأطفال",
    story:
      "أنا وزوجتي السابقة نواجه صعوبة في التفاهم على جدول إقامة الأطفال ونفقاتهم بعد الطلاق. نريد حل النزاع ودياً لحماية نفسية أولادنا عبر خدمات البلدية دون الذهاب إلى المحكمة.",
    categoryName: "النزاعات الأسرية",
    defaultGuest: "طارق",
    suggestedDuration: "5min",
    suggestedTone: "عملية",
  },
  {
    title: "طفلي لا يريد الذهاب إلى المدرسة (رفض المدرسة)",
    story:
      "طفلتي في الصف السادس ترفض الذهاب إلى المدرسة وتشكو من ألم في البطن كل صباح وخوف من التنمر. كيف أتعامل مع إلزامية التعليم (Skolplikt) وأتعاون مع مديرة المدرسة لحماية طفلتي؟",
    categoryName: "المدرسة وحقوق الطفل",
    defaultGuest: "منى",
    suggestedDuration: "3min",
    suggestedTone: "توعوية",
  },
  {
    title: "أهمية الترجمة في الاجتماعات الرسمية",
    story:
      "كنت أتردد في طلب مترجم (Tolk) خلال مقابلاتي مع مكتب العمل ومجلس البلدية خشية أن يُفهم أنني لا أرغب بتعلم اللغة. ما هي الحقيقة القانونية لحق الترجمة وكيف يحميني؟",
    categoryName: "الحياة اليومية والقانون",
    defaultGuest: "خالد",
    suggestedDuration: "1min",
    suggestedTone: "توعوية",
  },
];

export const PodcastSection: React.FC = () => {
  const [title, setTitle] = useState("");
  const [guestName, setGuestName] = useState("أحمد");
  const [story, setStory] = useState("");
  const [duration, setDuration] = useState<PodcastDuration>("3min");
  const [tone, setTone] = useState<PodcastTone>("مطمئنة");

  const [isLoading, setIsLoading] = useState(false);
  const [generatedPodcast, setGeneratedPodcast] = useState<PodcastGenerationResult | null>(null);
  const [copiedFull, setCopiedFull] = useState(false);
  const [copiedReels, setCopiedReels] = useState(false);
  const [activeTab, setActiveTab] = useState<"dialogue" | "reels">("dialogue");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectExample = (example: PreMadeExample) => {
    setTitle(example.title);
    setStory(example.story);
    setGuestName(example.defaultGuest);
    setDuration(example.suggestedDuration);
    setTone(example.suggestedTone);
    setErrorMessage(null);
  };

  const handleGeneratePodcast = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!story.trim()) {
      setErrorMessage("يرجى كتابة فكرة أو قصة الحلقة أو اختيار أحد النماذج الجاهزة.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/podcast/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || `حوار حول: ${story.slice(0, 35)}...`,
          guestName: guestName.trim() || "أحمد",
          story: story.trim(),
          duration,
          tone,
        }),
      });

      if (!response.ok) {
        throw new Error("تعذر توليد الحوار حالياً");
      }

      const data = await response.json();
      if (data.podcast) {
        setGeneratedPodcast(data.podcast);
        setActiveTab("dialogue");
        // Scroll smoothly to output
        setTimeout(() => {
          const el = document.getElementById("podcast-output-card");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 150);
      }
    } catch (err: any) {
      console.error("Error generating podcast:", err);
      setErrorMessage("حدث خطأ أثناء توليد الحوار. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, isReels = false) => {
    navigator.clipboard.writeText(text);
    if (isReels) {
      setCopiedReels(true);
      setTimeout(() => setCopiedReels(false), 2500);
    } else {
      setCopiedFull(true);
      setTimeout(() => setCopiedFull(false), 2500);
    }
  };

  const handleDownloadTxt = (filename: string, content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `${filename}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <section id="podcast-section" className="space-y-8 animate-fade-in" dir="rtl">
      {/* Podcast Hero Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#003C6E] via-[#005293] to-[#0A4B82] text-white p-6 sm:p-10 shadow-lg border border-white/10">
        <div className="absolute top-0 left-0 -mt-10 -ml-10 w-64 h-64 bg-sky-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 -mb-10 -mr-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-white/15 text-amber-300 backdrop-blur-xs border border-white/10">
              <Radio className="w-3.5 h-3.5 animate-pulse text-amber-300" />
              <span>بودكاست جسر الأسرة في السويد</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              بودكاست جسر الأسرة
            </h2>
            <p className="text-base sm:text-xl text-sky-100 font-bold leading-relaxed">
              حوار يقرّب الفهم ويدعم الأسرة
            </p>

            <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-xl font-normal">
              حوارات صوتية ومكتوبة هادئة تحاكي قصصاً واقعية للعائلات في السويد مع المستشارة الأسرية <strong>«هبه»</strong> لتوضيح القوانين، حقوق الوالدين والأطفال، وخطوات التعامل الإيجابي مع المؤسسات السويدية.
            </p>

            <div className="pt-2">
              <AudioPlayerButton
                textToRead="مرحباً بكم في بودكاست جسر الأسرة في السويد. حوار يقرّب الفهم ويدعم الأسرة. هنا نستمع لقصصكم الأسرية ونقدم إرشادات قانونية وتربوية مطمئنة مع المستشارة هبه."
                label="استمع لمقدمة البودكاست"
                size="md"
                className="bg-white/15 hover:bg-white/25 text-white border-white/20"
              />
            </div>
          </div>

          {/* Decorative Microphone Badge / Illustration */}
          <div className="shrink-0 flex items-center justify-center self-center md:self-auto">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-tr from-white/10 to-white/20 border-2 border-white/30 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center shadow-inner group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-400 text-[#003C6E] flex items-center justify-center shadow-md mb-2 group-hover:scale-110 transition-transform">
                <Mic className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-white tracking-wider">
                استشارة • حوار • أمان
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form & Clickable Examples */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Interactive Generator Form */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg sm:text-xl font-extrabold text-[#003C6E] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>أنشئ حوار حلقة جديدة مخصصة</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              اكتب فكرة الحلقة أو التحدي الأسري الذي ترغب في استكشافه، وسيقوم الذكاء الاصطناعي بتوليد حوار كامل بين المستشارة «هبه» والضيف.
            </p>
          </div>

          <form onSubmit={handleGeneratePodcast} className="space-y-5">
            {/* 1. Episode Title */}
            <div className="space-y-1.5">
              <label htmlFor="podcast-title" className="block text-xs sm:text-sm font-bold text-slate-700">
                1. عنوان الحلقة المقترح (اختياري)
              </label>
              <input
                id="podcast-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: كيف نتواصل مع المدرسة بهدوء وإيجابية؟"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#005293] focus:ring-3 focus:ring-blue-100 text-sm outline-none transition-all placeholder:text-slate-400 bg-slate-50/50"
              />
            </div>

            {/* 2. Guest Name */}
            <div className="space-y-1.5">
              <label htmlFor="podcast-guest-name" className="block text-xs sm:text-sm font-bold text-slate-700">
                2. اسم الضيف في الحوار
              </label>
              <div className="relative">
                <input
                  id="podcast-guest-name"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="أحمد"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#005293] focus:ring-3 focus:ring-blue-100 text-sm outline-none transition-all placeholder:text-slate-400 bg-slate-50/50"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                  الافتراضي: أحمد
                </span>
              </div>
            </div>

            {/* 3. Story or Topic Description */}
            <div className="space-y-1.5">
              <label htmlFor="podcast-story-input" className="block text-xs sm:text-sm font-bold text-slate-700">
                3. موضوع أو قصة الحلقة <span className="text-red-500">*</span>
              </label>
              <textarea
                id="podcast-story-input"
                rows={4}
                value={story}
                onChange={(e) => {
                  setStory(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="اكتب هنا تفاصيل الموقف، التساؤل، أو التجربة الأسرية التي ترغب بمناقشتها (مثال: ابني يشكو من صعوبة في مادة السويدي، أو كيف نستفيد من دورات الوالدية في البلدية...)"
                className="w-full p-4 rounded-2xl border border-slate-200 focus:border-[#005293] focus:ring-3 focus:ring-blue-100 text-sm leading-relaxed outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 resize-y"
              />
              <p className="text-[11px] text-slate-400">
                💡 تذكير بالأمان والخصوصية: لا تستخدم أسماء أشخاص حقيقيين أو بيانات خاصة سرية.
              </p>
            </div>

            {/* 4. Duration & 5. Tone selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Duration */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-slate-700">
                  4. مدة الحوار المقترحة
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "1min", label: "1 دقيقة", desc: "حوار سريع" },
                    { id: "3min", label: "3 دقائق", desc: "متوازن وشامل" },
                    { id: "5min", label: "5 دقائق", desc: "متعمق ومفصل" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDuration(item.id as PodcastDuration)}
                      className={`p-2 rounded-xl text-center border text-xs font-bold transition-all cursor-pointer ${
                        duration === item.id
                          ? "bg-[#005293] text-white border-[#005293] shadow-xs"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      <div>{item.label}</div>
                      <div className={`text-[10px] font-normal ${duration === item.id ? "text-sky-200" : "text-slate-400"}`}>
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-slate-700">
                  5. نبرة الحوار
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "مطمئنة", label: "مطمئنة", desc: "تهدئة وبناء ثقة" },
                    { id: "توعوية", label: "توعوية", desc: "شرح الأنظمة" },
                    { id: "عملية", label: "عملية", desc: "خطوات تطبيقية" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTone(item.id as PodcastTone)}
                      className={`p-2 rounded-xl text-center border text-xs font-bold transition-all cursor-pointer ${
                        tone === item.id
                          ? "bg-[#005293] text-white border-[#005293] shadow-xs"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      <div>{item.label}</div>
                      <div className={`text-[10px] font-normal ${tone === item.id ? "text-sky-200" : "text-slate-400"}`}>
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 6. Big Action Button */}
            <button
              id="generate-podcast-btn"
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer ${
                isLoading
                  ? "bg-slate-400 text-white cursor-not-allowed"
                  : "bg-[#005293] hover:bg-[#003C6E] text-white hover:shadow-lg active:scale-[0.99] border border-blue-400/30"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>جاري كتابة وتوليد حوار الحلقة مع المستشارة هبه...</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 text-amber-300" />
                  <span>توليد حوار الحلقة</span>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column (4 cols): Clickable Pre-made Examples */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-amber-50/70 rounded-3xl p-5 sm:p-6 border border-amber-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Headphones className="w-4 h-4 text-amber-700" />
              <span>أمثلة وقصص جاهزة للاستخدام:</span>
            </div>
            <p className="text-xs text-amber-800/80 leading-relaxed">
              اضغط على أي من المواضيع الواقعية التالية لتعبئة النموذج وتوليد الحوار فوراً:
            </p>

            <div className="space-y-2 pt-1">
              {PRE_MADE_EXAMPLES.map((example, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectExample(example)}
                  className="w-full text-right p-3 rounded-xl bg-white hover:bg-amber-100/70 border border-amber-200/60 hover:border-amber-300 text-xs text-slate-800 transition-all font-semibold shadow-2xs hover:shadow-xs cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-[#003C6E] group-hover:text-[#005293]">
                      {example.title}
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {example.categoryName} • {example.suggestedDuration}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-600 group-hover:-translate-x-1 transition-transform shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Counselor Profile Card */}
          <div className="bg-[#EAF6ED] rounded-3xl p-5 border border-[#D1EAD8] space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#4CAF50] text-white flex items-center justify-center font-black text-sm">
                هـ
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[#003C6E]">المستشارة «هبه»</h4>
                <p className="text-[11px] text-[#4A5568]">مرشدة أسرية واجتماعية في السويد</p>
              </div>
            </div>
            <p className="text-xs text-[#2D3748] leading-relaxed">
              تعتمد هبه أسلوباً هادئاً ومتعاطفاً، وتركز على تبسيط القوانين السويدية وتقديم خطوات عملية لبناء الثقة بين الأسرة والمؤسسات الرسمية.
            </p>
          </div>
        </div>
      </div>

      {/* Generated Dialogue Output Card */}
      {generatedPodcast && (
        <div
          id="podcast-output-card"
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-blue-200 space-y-6 animate-fade-in"
        >
          {/* Header of Output */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-[#005293]">
                  حلقة بودكاست جاهزة
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                  المدة: {generatedPodcast.duration === "1min" ? "دقيقة واحدة" : generatedPodcast.duration === "5min" ? "5 دقائق" : "3 دقائق"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                  النبرة: {generatedPodcast.tone}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#003C6E]">
                {generatedPodcast.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                حوار بين: <strong>المستشارة هبه</strong> والضيف <strong>{generatedPodcast.guestName}</strong>
              </p>
            </div>

            {/* Tab switch between full Dialogue and Reels version */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab("dialogue")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "dialogue"
                    ? "bg-white text-[#005293] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                الحوار الكامل
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("reels")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "reels"
                    ? "bg-[#005293] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Film className="w-3.5 h-3.5 text-amber-300" />
                <span>نسخة ريلز (30-45 ثانية)</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Full Dialogue View */}
          {activeTab === "dialogue" && (
            <div className="space-y-6">
              {/* Dialogue Turns List */}
              <div className="space-y-4">
                {generatedPodcast.turns.map((turn, index) => {
                  const isHost = turn.speaker === "هبه" || turn.role === "host";
                  return (
                    <div
                      key={index}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isHost
                          ? "bg-gradient-to-r from-[#F0F7FF] to-white border-blue-100 mr-0 sm:mr-4 shadow-2xs"
                          : "bg-gradient-to-r from-amber-50/50 to-white border-amber-100 ml-0 sm:ml-4 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                              isHost
                                ? "bg-[#005293] text-white"
                                : "bg-amber-600 text-white"
                            }`}
                          >
                            {isHost ? "هـ" : turn.speaker.charAt(0)}
                          </div>
                          <span className={`text-sm font-extrabold ${isHost ? "text-[#003C6E]" : "text-amber-900"}`}>
                            {turn.speaker}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              isHost
                                ? "bg-blue-100 text-[#005293]"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {isHost ? "المستشارة الأسرية" : "الضيف"}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm sm:text-base leading-relaxed text-slate-800 font-normal pr-9">
                        {turn.text}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Summary and Practical Call Box */}
              {(generatedPodcast.summary || generatedPodcast.actionCall) && (
                <div className="bg-[#EAF6ED] rounded-2xl p-4 sm:p-5 border border-[#D1EAD8] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-[#003C6E]">
                    <HeartHandshake className="w-4 h-4 text-[#4CAF50]" />
                    <span>خلاصة الحلقة والدعوة العملية:</span>
                  </div>
                  {generatedPodcast.summary && (
                    <p className="text-xs sm:text-sm text-[#2D3748] leading-relaxed">
                      {generatedPodcast.summary}
                    </p>
                  )}
                  {generatedPodcast.actionCall && (
                    <div className="text-xs font-semibold text-[#003C6E] pt-1">
                      📌 الخطوة المقترحة: {generatedPodcast.actionCall}
                    </div>
                  )}
                </div>
              )}

              {/* Audio Listen for Dialogue */}
              <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Volume2 className="w-4 h-4 text-[#005293]" />
                  <span>الاستماع الصوتي للحوار:</span>
                </div>
                <AudioPlayerButton
                  textToRead={generatedPodcast.fullText}
                  label="تشغيل الحوار صوتياً"
                  size="sm"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Reels Short Version (30-45 seconds) */}
          {activeTab === "reels" && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 p-4 sm:p-5 rounded-2xl border border-purple-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-600 text-white shadow-xs">
                    <Film className="w-3.5 h-3.5" />
                    <span>سكريبت ريلز / تيك توك (30 - 45 ثانية)</span>
                  </span>
                  <span className="text-xs font-mono text-purple-900 font-bold">
                    ⏱️ سريع وجذاب
                  </span>
                </div>

                {/* Hook Line */}
                <div className="bg-white/90 p-3.5 rounded-xl border border-purple-200">
                  <div className="text-[11px] font-bold text-purple-700 mb-1">
                    🎯 جملة البداية القوية (Hook):
                  </div>
                  <p className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                    "{generatedPodcast.reelsVersion?.hook || generatedPodcast.title}"
                  </p>
                </div>

                {/* Quick Reels Dialogue */}
                <div className="space-y-2.5 pt-1">
                  {generatedPodcast.reelsVersion?.turns?.map((turn, i) => (
                    <div key={i} className="p-3 bg-white rounded-xl border border-slate-200/80 text-xs sm:text-sm">
                      <strong className={turn.role === "host" ? "text-[#005293]" : "text-amber-800"}>
                        {turn.speaker}:{" "}
                      </strong>
                      <span className="text-slate-800 font-medium">{turn.text}</span>
                    </div>
                  ))}
                </div>

                {/* Mandatory Closing Phrase */}
                <div className="bg-[#003C6E] text-white p-3.5 rounded-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-amber-300 font-bold mb-0.5">العبارة الختامية:</div>
                    <div className="text-sm sm:text-base font-black">
                      «جسر الأسرة في السويد — نفهم معًا، ونبني الثقة.»
                    </div>
                  </div>
                  <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
                </div>
              </div>

              {/* Reels audio */}
              <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Volume2 className="w-4 h-4 text-purple-600" />
                  <span>الاستماع لنسخة الريلز:</span>
                </div>
                <AudioPlayerButton
                  textToRead={generatedPodcast.reelsVersion?.fullText || generatedPodcast.fullText}
                  label="استمع للريلز"
                  size="sm"
                />
              </div>
            </div>
          )}

          {/* Mandatory Disclaimer Box */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              {generatedPodcast.disclaimer || "هذا المحتوى توعوي عام ولا يغني عن الاستشارة المتخصصة في الحالات الفردية أو الطارئة."}
            </span>
          </div>

          {/* Action Buttons Toolbar below text */}
          <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-slate-100">
            {/* Copy Full Dialogue */}
            <button
              type="button"
              onClick={() => handleCopyText(activeTab === "reels" ? generatedPodcast.reelsVersion?.fullText : generatedPodcast.fullText, activeTab === "reels")}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              {(activeTab === "reels" ? copiedReels : copiedFull) ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">تم النسخ بنجاح!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>نسخ الحوار</span>
                </>
              )}
            </button>

            {/* Regenerate */}
            <button
              type="button"
              onClick={() => handleGeneratePodcast()}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-600" />
              <span>إعادة توليد</span>
            </button>

            {/* Download as .txt file */}
            <button
              type="button"
              onClick={() =>
                handleDownloadTxt(
                  `بودكاست-جسر-الأسرة-${generatedPodcast.title.slice(0, 25).replace(/\s+/g, "_")}`,
                  `${generatedPodcast.title}\nبودكاست جسر الأسرة في السويد\nالمستشارة هبه والضيف ${generatedPodcast.guestName}\n\n` +
                    (activeTab === "reels" ? generatedPodcast.reelsVersion.fullText : generatedPodcast.fullText) +
                    `\n\nتنبيه: ${generatedPodcast.disclaimer}`
                )
              }
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>تحميل كنص (.txt)</span>
            </button>

            {/* Switch / Generate Reels Short version toggle */}
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === "dialogue" ? "reels" : "dialogue")}
              className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer mr-auto"
            >
              <Film className="w-4 h-4 text-purple-600" />
              <span>{activeTab === "dialogue" ? "عرض نسخة ريلز (30-45 ثانية)" : "عرض الحوار الكامل"}</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
