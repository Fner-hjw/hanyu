"use client";

import { speak, stopSpeaking } from "@/lib/audio";

export function SpeakButton({
  text,
  rate = 0.9,
  label = "Play audio",
  className = "",
}: {
  text: string;
  rate?: number;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        stopSpeaking();
        speak(text, rate);
      }}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card text-lg hover:bg-accent-soft ${className}`}
    >
      🔊
    </button>
  );
}
