"use client";

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import HanziWriter from "hanzi-writer";

export type WriterMode = "watch" | "trace" | "recall";
export type WriterHandle = { animate: () => void; restart: () => void };

const SOURCES = [
  (c: string) => `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${encodeURIComponent(c)}.json`,
  (c: string) => `https://unpkg.com/hanzi-writer-data@2.0.1/${encodeURIComponent(c)}.json`,
];
const cache = new Map<string, Promise<unknown>>();

/** stroke data from the hanzi-writer-data CDN, with a fallback mirror */
function loadData(ch: string): Promise<unknown> {
  let p = cache.get(ch);
  if (!p) {
    p = (async () => {
      for (const src of SOURCES) {
        try {
          const r = await fetch(src(ch));
          if (r.ok) return await r.json();
        } catch { /* try next */ }
      }
      throw new Error("Stroke data unavailable");
    })();
    p.catch(() => cache.delete(ch));
    cache.set(ch, p);
  }
  return p;
}

const css = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || undefined;

/**
 * Stroke-order animation and handwriting quiz on a 米字格 grid.
 * `onDone(mistakes, strokes)` fires when a trace/recall quiz is completed.
 */
export function Writer({ ch, mode, size = 280, onDone, ref }: {
  ch: string; mode: WriterMode; size?: number; onDone?: (mistakes: number, strokes: number) => void; ref?: Ref<WriterHandle>;
}) {
  const host = useRef<HTMLDivElement>(null);
  const writer = useRef<HanziWriter | null>(null);
  const done = useRef(onDone);
  const [error, setError] = useState<string | null>(null);
  const [strokes, setStrokes] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  useEffect(() => { done.current = onDone; }, [onDone]);

  const startQuiz = (w: HanziWriter) => {
    let miss = 0;
    void w.quiz({
      showHintAfterMisses: mode === "trace" ? 2 : 3,
      highlightOnComplete: true,
      onMistake: () => { miss++; setMistakes(miss); },
      onComplete: ({ totalMistakes }) => {
        void w.getCharacterData().then((d) => done.current?.(totalMistakes, d.strokes.length));
      },
    });
  };

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    el.innerHTML = "";
    let alive = true;
    const t = setTimeout(() => { setError(null); setMistakes(0); }, 0);
    const w = HanziWriter.create(el, ch, {
      width: size, height: size, padding: 12,
      showOutline: mode !== "recall",
      showCharacter: false,
      strokeColor: css("--fg") ?? "#1e1a15",
      outlineColor: css("--line") ?? "#e5dccd",
      drawingColor: css("--accent") ?? "#c4352b",
      highlightColor: css("--good") ?? "#2c7a64",
      radicalColor: css("--accent") ?? "#c4352b",
      strokeAnimationSpeed: 1, delayBetweenStrokes: 250, drawingWidth: 22,
      charDataLoader: (c, onLoad, onErr) => { loadData(c).then((d) => onLoad(d as Parameters<typeof onLoad>[0]), onErr); },
      onLoadCharDataError: () => alive && setError("Couldn't load stroke data — check your connection."),
      onLoadCharDataSuccess: (d) => alive && setStrokes(d.strokes.length),
    });
    writer.current = w;
    if (mode === "watch") void w.loopCharacterAnimation();
    else startQuiz(w);
    return () => { alive = false; clearTimeout(t); w.cancelQuiz(); writer.current = null; el.innerHTML = ""; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ch, mode, size]);

  useImperativeHandle(ref, () => ({
    animate: () => { const w = writer.current; if (!w) return; w.cancelQuiz(); void w.animateCharacter({ onComplete: () => { if (mode !== "watch") { void w.hideCharacter(); startQuiz(w); } } }); },
    restart: () => { const w = writer.current; if (!w) return; setMistakes(0); if (mode === "watch") void w.loopCharacterAnimation(); else { void w.hideCharacter(); startQuiz(w); } },
  }));

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative rounded-2xl border border-line bg-card" style={{ width: size, height: size }}>
        {/* 米字格 practice grid */}
        <svg className="pointer-events-none absolute inset-0" width={size} height={size} aria-hidden>
          <g stroke="var(--line)" strokeDasharray="5 5" strokeWidth="1">
            <line x1="0" y1={size / 2} x2={size} y2={size / 2} /><line x1={size / 2} y1="0" x2={size / 2} y2={size} />
            <line x1="0" y1="0" x2={size} y2={size} /><line x1={size} y1="0" x2="0" y2={size} />
          </g>
        </svg>
        <div ref={host} className="relative touch-none" aria-label={`Writing area for ${ch}`} />
        {error && <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-accent">{error}</div>}
      </div>
      <div className="text-xs text-muted">{strokes ? `${strokes} strokes` : " "}{mode !== "watch" && strokes ? ` · ${mistakes} mistake${mistakes === 1 ? "" : "s"}` : ""}</div>
    </div>
  );
}
