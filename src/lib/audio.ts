"use client";

let cachedVoice: SpeechSynthesisVoice | null | undefined;

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices().filter((v) => /^zh/i.test(v.lang));
  if (!voices.length) return null;
  // Prefer natural/neural voices (Edge "Xiaoxiao", Google, Apple "Tingting/Ting-Ting") and mainland Mandarin
  const score = (v: SpeechSynthesisVoice) =>
    (/natural|neural|online|xiaoxiao|yunxi|google/i.test(v.name) ? 4 : 0) +
    (/zh[-_]CN/i.test(v.lang) ? 2 : 0) +
    (/ting|mei-jia|lili/i.test(v.name) ? 1 : 0);
  cachedVoice = [...voices].sort((a, b) => score(b) - score(a))[0];
  return cachedVoice;
}

export function audioSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string, rate = 0.9): Promise<void> {
  return new Promise((resolve) => {
    if (!audioSupported()) return resolve();
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "zh-CN";
    const v = pickVoice();
    if (v) u.voice = v;
    u.rate = rate;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    synth.speak(u);
  });
}

export function stopSpeaking() {
  if (audioSupported()) window.speechSynthesis.cancel();
}

// voices load asynchronously in Chrome
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = undefined;
  };
}

let current: HTMLAudioElement | null = null;

/** Play a recorded clip; fall back to browser TTS of `fallbackText` if it can't load. */
export function playUrl(url: string, fallbackText?: string, rate = 1): Promise<void> {
  return new Promise((resolve) => {
    stopAll();
    const a = new Audio(url);
    current = a;
    a.playbackRate = rate;
    let fellBack = false;
    const fallback = () => {
      if (fellBack) return;
      fellBack = true;
      if (fallbackText) speak(fallbackText, 0.9 * rate).then(resolve);
      else resolve();
    };
    a.onended = () => resolve();
    a.onerror = fallback;
    a.play().catch(fallback);
  });
}

export function stopAll() {
  stopSpeaking();
  if (current) {
    current.pause();
    current = null;
  }
}
