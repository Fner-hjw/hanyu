"use client";

import { useEffect, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { loadChars, levelLabel, sentenceAudio, useAsync, type Word } from "@/lib/data";
import { lookup } from "@/lib/dict";
import { addCards, isKnown, markKnown, setNote, useAppState } from "@/lib/store";
import { SpeakButton } from "./Speak";
import { Badge } from "./ui";
import { TOPICS } from "@/data/vocab";

export function wordStatus(s: ReturnType<typeof useAppState>, id: string): "known" | "learning" | "new" {
  if (s.known[id] || isKnown(s.cards[id])) return "known";
  return s.cards[id] ? "learning" : "new";
}

export function StatusBadge({ status }: { status: "known" | "learning" | "new" }) {
  return status === "known" ? <Badge tone="good">Known</Badge> : status === "learning" ? <Badge tone="sky">Learning</Badge> : <Badge>New</Badge>;
}

export function WordSheet({ word, onClose }: { word: Word | null; onClose: () => void }) {
  useEffect(() => {
    if (!word) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [word, onClose]);
  if (!word) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 backdrop-blur-[2px] sm:items-stretch sm:justify-end" onClick={onClose} role="dialog" aria-modal="true" aria-label={`${word.zh} details`}>
      <div className="pop max-h-[88vh] w-full overflow-y-auto rounded-t-3xl border border-line bg-bg p-5 shadow-2xl sm:max-h-none sm:max-w-md sm:rounded-none sm:rounded-l-3xl sm:p-6" onClick={(e) => e.stopPropagation()}>
        <WordDetail key={word.id} word={word} onClose={onClose} />
      </div>
    </div>
  );
}

function WordDetail({ word, onClose }: { word: Word; onClose: () => void }) {
  const s = useAppState();
  const status = wordStatus(s, word.id);
  const chars = useAsync(loadChars, []);
  const more = useAsync(() => lookup(word.zh), [word.zh]);
  const [note, setNoteText] = useState(s.notes[word.id] ?? "");
  const glyphs = [...word.zh].filter((c) => /[一-鿿]/.test(c));

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {word.level > 0 ? <Badge tone="accent">{levelLabel(word.level)}</Badge> : word.topic && <Badge tone="gold">{TOPICS[word.topic]}</Badge>}
          {word.pos.map((p) => <Badge key={p}>{p}</Badge>)}
          <StatusBadge status={status} />
        </div>
        <button onClick={onClose} className="rounded-full p-1.5 text-muted hover:bg-accent-soft" aria-label="Close"><X size={20} /></button>
      </div>

      <div className="text-center">
        <div className="hanzi text-6xl leading-tight sm:text-7xl">{word.zh}</div>
        <div className="mt-2 flex items-center justify-center gap-2 text-xl text-accent">{word.py}<SpeakButton text={word.zh} rate={0.8} /></div>
        <p className="mt-2 text-lg">{word.en || <span className="text-muted">No short definition</span>}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {status === "new" && <button className="btn btn-primary btn-sm" onClick={() => addCards([word.id])}><Plus size={15} /> Add to review</button>}
        {status !== "known" ? (
          <button className="btn btn-sm" onClick={() => markKnown([word.id])}><Check size={15} /> I know this</button>
        ) : s.known[word.id] && <button className="btn btn-sm" onClick={() => markKnown([word.id], false)}>Unmark known</button>}
      </div>

      {word.ex.length > 0 && (
        <section>
          <h3 className="eyebrow mb-2">Examples</h3>
          <div className="space-y-2">
            {word.ex.map((e, i) => (
              <div key={i} className="card-flat flex items-start gap-3 p-3">
                <SpeakButton text={e.zh} src={e.id ? sentenceAudio(e.id) : undefined} size="sm" className="mt-0.5" />
                <div className="min-w-0">
                  <div className="han text-[1.05rem]">{e.zh}</div>
                  {e.py && <div className="text-xs text-muted">{e.py}</div>}
                  <div className="text-sm text-muted">{e.en}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {glyphs.length > 0 && (
        <section>
          <h3 className="eyebrow mb-2">Characters</h3>
          <div className="grid grid-cols-2 gap-2">
            {glyphs.map((c, i) => {
              const info = chars.data?.[c];
              const parts = info ? [info[5], info[6]].filter((p) => p && p !== c && !p.includes("*")) : [];
              return (
                <div key={c + i} className="card-flat p-3">
                  <div className="flex items-baseline gap-2"><span className="hanzi text-3xl">{c}</span><span className="text-accent">{info?.[1]}</span></div>
                  <div className="line-clamp-2 text-xs text-muted">{info?.[2]}</div>
                  <div className="mt-1 text-[0.7rem] text-muted">
                    {info?.[3] ? `${info[3]} strokes` : ""}{parts.length ? ` · ${parts.join(" + ")}` : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {more.data && more.data.length > 0 && (
        <section>
          <h3 className="eyebrow mb-2">Dictionary (CC-CEDICT)</h3>
          <ul className="space-y-1 text-sm">
            {more.data.map(([py, m], i) => <li key={i}><span className="text-accent">{py}</span> <span className="text-muted">{m}</span></li>)}
          </ul>
        </section>
      )}

      <section>
        <h3 className="eyebrow mb-2">My note / mnemonic</h3>
        <textarea className="input min-h-20 text-sm" placeholder="e.g. 预 = in advance + 算 = calculate → budget" value={note}
          onChange={(e) => setNoteText(e.target.value)} onBlur={() => setNote(word.id, note)} />
      </section>
    </div>
  );
}
