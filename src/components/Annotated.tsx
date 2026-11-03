"use client";

import { useMemo, useState } from "react";
import { tokenize } from "@/lib/text";
import { SpeakButton } from "./Speak";

/** Chinese text with ruby pinyin and tap-a-word glosses. */
export function Annotated({
  text,
  showPinyin = true,
  size = "text-xl",
}: {
  text: string;
  showPinyin?: boolean;
  size?: string;
}) {
  const tokens = useMemo(() => tokenize(text), [text]);
  const [sel, setSel] = useState<number | null>(null);
  const t = sel !== null ? tokens[sel] : null;

  return (
    <div>
      <p className={`han ${size} leading-[2.6]`}>
        {tokens.map((tk, i) =>
          tk.isZh ? (
            <button
              key={i}
              type="button"
              onClick={() => setSel(sel === i ? null : i)}
              className={`mr-0.5 rounded px-0.5 hover:bg-accent-soft ${sel === i ? "bg-accent-soft" : ""} ${tk.word ? "border-b border-dotted border-accent" : ""}`}
            >
              <ruby>
                {tk.text}
                <rt className={`text-[0.55em] font-sans text-muted ${showPinyin ? "" : "invisible"}`}>{tk.py}</rt>
              </ruby>
            </button>
          ) : (
            <span key={i}>{tk.text}</span>
          ),
        )}
      </p>
      {t && (
        <div className="mt-2 flex items-center gap-3 rounded-lg border border-line bg-card px-3 py-2 text-sm">
          <SpeakButton text={t.text} rate={0.8} />
          <div>
            <span className="han text-lg">{t.text}</span>{" "}
            <span className="text-accent">{t.py}</span>
            <div className="text-muted">{t.word ? t.word.en : "Not in your word list yet"}</div>
          </div>
        </div>
      )}
    </div>
  );
}
