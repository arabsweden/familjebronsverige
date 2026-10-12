// Audio playback helper for Gemini TTS (24kHz PCM) and Web Speech API fallback

let activeAudioCtx: AudioContext | null = null;
let currentSourceNode: AudioBufferSourceNode | null = null;
let isCurrentlyPlaying = false;
let onPlaybackEndCallback: (() => void) | null = null;

export async function playArabicAudio(
  text: string,
  voice: "female" | "male" = "female",
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: Error) => void
): Promise<void> {
  stopArabicAudio();

  try {
    onStart?.();
    isCurrentlyPlaying = true;
    onPlaybackEndCallback = onEnd || null;

    // 1. Try Gemini 3.1 Flash TTS API first
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.audio) {
        await playPcmBase64(data.audio, data.sampleRate || 24000);
        return;
      }
    }

    // 2. Fallback to Browser Web Speech API if server TTS isn't configured
    fallbackBrowserSpeech(text, onEnd, onError);
  } catch (error: any) {
    console.warn("Server TTS failed, using browser SpeechSynthesis fallback:", error);
    try {
      fallbackBrowserSpeech(text, onEnd, onError);
    } catch (fallbackError: any) {
      isCurrentlyPlaying = false;
      onError?.(fallbackError);
    }
  }
}

export function stopArabicAudio() {
  if (currentSourceNode) {
    try {
      currentSourceNode.stop();
      currentSourceNode.disconnect();
    } catch {}
    currentSourceNode = null;
  }

  if (activeAudioCtx && activeAudioCtx.state !== "closed") {
    try {
      activeAudioCtx.close();
    } catch {}
    activeAudioCtx = null;
  }

  if (typeof window !== "undefined" && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }

  isCurrentlyPlaying = false;
  if (onPlaybackEndCallback) {
    const cb = onPlaybackEndCallback;
    onPlaybackEndCallback = null;
    cb();
  }
}

export function isAudioPlaying(): boolean {
  return isCurrentlyPlaying;
}

// Convert base64 PCM 16-bit little-endian to AudioBuffer
async function playPcmBase64(base64Data: string, sampleRate = 24000) {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const int16Array = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16Array.length);

  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  activeAudioCtx = new AudioContextClass({ sampleRate });

  const audioBuffer = activeAudioCtx.createBuffer(1, float32Array.length, sampleRate);
  audioBuffer.copyToChannel(float32Array, 0);

  currentSourceNode = activeAudioCtx.createBufferSource();
  currentSourceNode.buffer = audioBuffer;
  currentSourceNode.connect(activeAudioCtx.destination);

  currentSourceNode.onended = () => {
    isCurrentlyPlaying = false;
    if (onPlaybackEndCallback) {
      const cb = onPlaybackEndCallback;
      onPlaybackEndCallback = null;
      cb();
    }
  };

  currentSourceNode.start(0);
}

function fallbackBrowserSpeech(
  text: string,
  onEnd?: () => void,
  onError?: (err: Error) => void
) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    throw new Error("Speech synthesis is not supported in this browser");
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ar-SA";
  utterance.rate = 0.95; // Slightly calmer pace

  // Try to find an Arabic voice
  const voices = window.speechSynthesis.getVoices();
  const arabicVoice = voices.find(
    (v) => v.lang.startsWith("ar") || v.name.toLowerCase().includes("arabic")
  );
  if (arabicVoice) {
    utterance.voice = arabicVoice;
  }

  utterance.onend = () => {
    isCurrentlyPlaying = false;
    onEnd?.();
  };

  utterance.onerror = (e) => {
    isCurrentlyPlaying = false;
    onError?.(new Error(e.error));
  };

  window.speechSynthesis.speak(utterance);
}
