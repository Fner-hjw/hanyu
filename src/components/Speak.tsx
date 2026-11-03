"use client";

import { Volume2 } from "lucide-react";
import { playUrl, speak, stopAll } from "@/lib/audio";

/** Plays a recorded clip when `src` is given (with TTS fallback), otherwise browser TTS. */
export function SpeakButton({
  text, src, rate = 0.9, label = "Play audio", className = "", size = "md",
}: { text: string; src?: string; rate?: number; label?: string; className?: string; size?: "sm" | "md" | "lg" }) {
  const dim = { sm: "h-7 w-7", md: "h-9 w-9", lg: "h-14 w-14" }[size];
  const icon = { sm: 14, md: 17, lg: 26 }[size];
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        stopAll();
        if (src) playUrl(src, text, rate >= 0.9 ? 1 : rate / 0.9);
        else speak(text, rate);
      }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-line bg-card text-accent transition-colors hover:bg-accent-soft ${dim} ${className}`}
    >
      <Volume2 size={icon} />
    </button>
  );
}
