import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { playArabicAudio, stopArabicAudio } from "../utils/audioPlayer";

interface AudioPlayerButtonProps {
  textToRead: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const AudioPlayerButton: React.FC<AudioPlayerButtonProps> = ({
  textToRead,
  label = "استمع للشرح صوتياً",
  size = "md",
  className = "",
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (isPlaying) {
        stopArabicAudio();
      }
    };
  }, [isPlaying]);

  const handleTogglePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isPlaying || isLoading) {
      stopArabicAudio();
      setIsPlaying(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    await playArabicAudio(
      textToRead,
      "female",
      () => {
        setIsLoading(false);
        setIsPlaying(true);
      },
      () => {
        setIsPlaying(false);
        setIsLoading(false);
      },
      (err) => {
        console.error("Audio playback error:", err);
        setIsLoading(false);
        setIsPlaying(false);
      }
    );
  };

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-3.5 py-1.5 text-xs sm:text-sm gap-2",
    lg: "px-4 py-2 text-sm sm:text-base gap-2.5",
  };

  return (
    <button
      type="button"
      id="audio-tts-player-btn"
      onClick={handleTogglePlay}
      className={`inline-flex items-center rounded-xl font-medium transition-all cursor-pointer select-none shadow-xs border ${
        isPlaying
          ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-emerald-200 ring-2 ring-emerald-300/50"
          : isLoading
          ? "bg-sky-100 text-sky-800 border-sky-300"
          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200/80 hover:border-emerald-300"
      } ${sizeClasses[size]} ${className}`}
      title={isPlaying ? "إيقاف الاستماع" : "استمع للقراءة بالصوت (Gemini TTS)"}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
          <span className="font-semibold">جاري تحضير الصوت...</span>
        </>
      ) : isPlaying ? (
        <>
          <VolumeX className="w-4 h-4 text-white animate-pulse" />
          <span className="font-bold flex items-center gap-1.5">
            <span>جاري القراءة</span>
            <span className="inline-flex gap-0.5 items-end h-3">
              <span className="w-0.5 h-2 bg-white animate-bounce"></span>
              <span className="w-0.5 h-3 bg-white animate-bounce [animation-delay:0.15s]"></span>
              <span className="w-0.5 h-1.5 bg-white animate-bounce [animation-delay:0.3s]"></span>
            </span>
          </span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{label}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200/60 text-emerald-900 font-mono">صوت</span>
        </>
      )}
    </button>
  );
};
