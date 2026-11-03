"use client";

import { useEffect, useMemo, useState } from "react";
import { tokenize } from "@/lib/text";
import { SpeakButton } from "./Speak";
import { lookupWithFallback, refineTokens } from "@/lib/dict";
import { BookmarkCheck, BookmarkPlus } from "lucide-react";
import { addToBank, removeFromBank, useAppState } from "@/lib/store";

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
  const base = useMemo(() => tokenize(text), [text]);
  const [refined, setRefined] = useState<{ text: string; tokens: typeof base } | null>(null);
  const tokens = refined?.text === text ? refined.tokens : base;
  const [sel, setSel] = useState<number | null>(null);

  useEffect(() => {
    let live = true;
    refineTokens(base).then((r) => {
      if (!live) return;
      setRefined({ text, tokens: r });
      setSel(null);
    });
    return () => {
      live = false;
    };
  }, [base, text]);
  const t = sel !== null ? tokens[sel] : null;
  const bank = useAppState().bank;
  const [dict, setDict] = useState<{ word: string; entries: [string, string][] }[] | null>(null);

  useEffect(() => {
    if (!t || t.word) return;
    let live = true;
    lookupWithFallback(t.text).then((r) => live && setDict(r));
    return () => {
      live = false;
      setDict(null);
    };
  }, [t]);

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
        <div className="mt-2 flex items-start gap-3 rounded-lg border border-line bg-card px-3 py-2 text-sm">
          <SpeakButton text={t.text} rate={0.8} />
          <div className="min-w-0 flex-1">
            <span className="han text-lg">{t.text}</span>
            {t.word && <span className="text-accent"> {t.py}</span>}
            {t.word ? (
              <div className="text-muted">{t.word.en} <span className="text-xs">· in your list</span></div>
            ) : dict === null ? (
              <div className="text-muted">Looking up…</div>
            ) : dict.length === 0 ? (
              <div className="text-muted">No dictionary entry found</div>
            ) : (
              dict.map((d) => (
                <div key={d.word} className="mt-1 text-muted">
                  {dict.length > 1 && <span className="han text-fg">{d.word} </span>}
                  {d.entries.map(([py, m], i) => (
                    <div key={i}><span className="text-accent">{py}</span> {m}</div>
                  ))}
                </div>
              ))
            )}
          </div>
          {!t.word && (() => {
            const id = `bank:${t.text}`;
            const saved = !!bank[id];
            const en = dict?.find((d) => d.word === t.text)?.entries[0]?.[1] ?? dict?.map((d) => `${d.word}: ${d.entries[0]?.[1] ?? ""}`).join(" · ") ?? "";
            return (
              <button type="button" className={`btn btn-sm shrink-0 ${saved ? "text-good" : ""}`} disabled={!saved && dict === null}
                onClick={() => (saved ? removeFromBank(id) : addToBank(id, { zh: t.text, py: t.py, en }))}
                aria-label={saved ? "Remove from my words" : "Save to my words"}>
                {saved ? <BookmarkCheck size={14} /> : <BookmarkPlus size={14} />} {saved ? "Saved" : "Save"}
              </button>
            );
          })()}
        </div>
      )}
    </div>
  );
}
