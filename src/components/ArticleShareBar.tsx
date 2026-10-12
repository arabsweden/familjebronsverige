import React, { useState } from "react";
import {
  Share2,
  Copy,
  Check,
  MessageCircle,
  Send,
  Mail,
  FileText,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { KnowledgeArticle } from "../types";

interface ArticleShareBarProps {
  article: KnowledgeArticle;
  categoryTitleArabic?: string;
}

export const ArticleShareBar: React.FC<ArticleShareBarProps> = ({
  article,
  categoryTitleArabic,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [showAllOptions, setShowAllOptions] = useState(false);

  // Generate shareable URL
  const getArticleUrl = () => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("cat", article.categoryId);
      url.searchParams.set("article", article.id);
      url.hash = `article-${article.id}`;
      return url.toString();
    }
    return `https://familjensbro.se/?cat=${article.categoryId}&article=${article.id}#article-${article.id}`;
  };

  const getShareText = () => {
    return `📌 دليل الأسرة في السويد: ${article.titleArabic} (${article.titleSwedish})\n\n💡 خلاصة هامة: ${article.summary}\n\n🔗 اقرأ الإرشادات والخطوات القانونية الكاملة:\n${getArticleUrl()}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getArticleUrl());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `دليل الأسرة في السويد: ${article.titleArabic}`,
          text: `💡 ${article.summary}`,
          url: getArticleUrl(),
        });
      } catch {
        // User cancelled or share failed, fallback to copy
        handleCopyLink();
      }
    } else {
      setShowAllOptions(true);
    }
  };

  const articleUrl = getArticleUrl();
  const shareText = getShareText();

  // Social URLs
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(`📌 ${article.titleArabic}\n${article.summary}`)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`دليل الأسرة في السويد: ${article.titleArabic}`)}&url=${encodeURIComponent(articleUrl)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(`دليل الأسرة في السويد: ${article.titleArabic}`)}&body=${encodeURIComponent(shareText)}`;

  return (
    <div
      id={`share-bar-${article.id}`}
      className="p-4 sm:p-5 rounded-2xl bg-white border border-blue-100 shadow-2xs space-y-3.5"
      dir="rtl"
    >
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#EAF6ED] text-[#1E7E34] flex items-center justify-center shrink-0">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs sm:text-sm font-black text-[#003C6E]">
              مشاركة هذه المقالة مع العائلات
            </h5>
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
              انشر الوعي القانوني والتربوي لدعم ومساندة الأسر الأخرى
            </p>
          </div>
        </div>

        {/* Quick Text Copy Badge */}
        <div className="flex items-center gap-2">
          <button
            id={`copy-summary-btn-${article.id}`}
            onClick={handleCopyText}
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 border ${
              copiedText
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
            }`}
            title="نسخ نص ملخص المقالة مع الرابط لمشاركته في مجموعات واتساب"
          >
            {copiedText ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span>تم نسخ الملخص!</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-gray-500" />
                <span>نسخ نص الملخص لواتساب</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action Buttons Grid */}
      <div className="flex flex-wrap items-center gap-2">
        {/* WhatsApp Button (Top Priority for Arab communities) */}
        <a
          id={`share-whatsapp-${article.id}`}
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs sm:text-sm font-black transition-all shadow-2xs hover:shadow-xs min-h-[40px] cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span>واتساب WhatsApp</span>
        </a>

        {/* Copy Link Button */}
        <button
          id={`copy-link-btn-${article.id}`}
          onClick={handleCopyLink}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[40px] cursor-pointer border ${
            copiedLink
              ? "bg-[#EAF6ED] text-[#1E7E34] border-[#D1EAD8]"
              : "bg-[#F0F7FF] hover:bg-blue-100 text-[#005293] border-blue-100"
          }`}
        >
          {copiedLink ? (
            <>
              <Check className="w-4 h-4 text-[#1E7E34]" />
              <span>تم نسخ رابط المقال!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-[#005293]" />
              <span>نسخ الرابط المباشر</span>
            </>
          )}
        </button>

        {/* Telegram Button */}
        <a
          id={`share-telegram-${article.id}`}
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#0088cc] text-xs sm:text-sm font-bold transition-all min-h-[40px] cursor-pointer border border-[#229ED9]/20"
          title="مشاركة عبر تيليجرام"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">تيليجرام</span>
        </a>

        {/* Facebook Button */}
        <a
          id={`share-facebook-${article.id}`}
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] text-xs sm:text-sm font-bold transition-all min-h-[40px] cursor-pointer border border-[#1877F2]/20"
          title="مشاركة عبر فيسبوك"
        >
          <span className="font-bold font-serif text-sm">f</span>
          <span className="hidden sm:inline">فيسبوك</span>
        </a>

        {/* Native Web Share API button (shows if supported) */}
        {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
          <button
            id={`native-share-${article.id}`}
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-bold transition-all min-h-[40px] cursor-pointer"
            title="مشاركة عبر تطبيقات أخرى"
          >
            <Share2 className="w-4 h-4 text-gray-600" />
            <span className="hidden md:inline">المزيد من التطبيقات</span>
          </button>
        )}

        {/* Email button */}
        <a
          id={`share-email-${article.id}`}
          href={emailUrl}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs sm:text-sm font-bold transition-all min-h-[40px] cursor-pointer border border-gray-200"
          title="إرسال عبر البريد الإلكتروني"
        >
          <Mail className="w-4 h-4 text-gray-500" />
        </a>
      </div>
    </div>
  );
};
