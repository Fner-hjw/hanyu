"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, PenLine, Play, RotateCcw, Search } from "lucide-react";
import { loadChars, loadLevel, useAsync, type CharInfo } from "@/lib/data";
import { addMistake, clearMistake, logPractice, saveWriting, useAppState, useHydrated } from "@/lib/store";
import { RADICALS } from "@/data/radicals";
import { Writer, type WriterHandle, type WriterMode } from "@/components/Writer";
import { SpeakButton } from "@/components/Speak";
import { Badge, PageHeader } from "@/components/ui";

const MODES: { id: WriterMode; label: string; desc: string }[] = [
  { id: "watch", label: "Watch", desc: "See the stroke order" },
  { id: "trace", label: "Trace", desc: "Write over the outline" },
  { id: "recall", label: "Recall", desc: "Write from memory" },
];
const HAN = /[一-鿿]/;

export default function WritePage() {
  const hydrated = useHydrated();
  const [tab, setTab] = useState<"practice" | "radicals">("practice");
  const [custom, setCustom] = useState<string[] | null>(null);
  if (!hydrated) return null;
  return (
    <div>
      <PageHeader title="Write" subtitle="Writing by hand fixes characters in memory. Watch the stroke order, trace it, then write it from memory — on touch screens use your finger, on desktop the mouse." />
      <div className="mb-5 flex gap-2">
        <button className="chip" data-active={tab === "practice"} onClick={() => setTab("practice")}>Practice</button>
        <button className="chip" data-active={tab === "radicals"} onClick={() => setTab("radicals")}>Radicals ({RADICALS.length})</button>
      </div>
      {tab === "practice" ? <Practice custom={custom} setCustom={setCustom} /> : <Radicals onPick={(chars) => { setCustom(chars); setTab("practice"); }} />}
    </div>
  );
}

function Practice({ custom, setCustom }: { custom: string[] | null; setCustom: (c: string[] | null) => void }) {
  const s = useAppState();
  const chars = useAsync(loadChars, []);
  const [level, setLevel] = useState(1);
  const [mode, setMode] = useState<WriterMode>("watch");
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [last, setLast] = useState<{ ch: string; pct: number } | null>(null);
  const writer = useRef<WriterHandle>(null);
  const words = useAsync(() => loadLevel(level), [level]);

  // characters introduced at this level, weakest first (not yet written well)
  const list = useMemo(() => {
    if (custom) return custom;
    if (!chars.data) return [];
    return Object.entries(chars.data).filter(([, v]) => v[0] === level).map(([c]) => c)
      .sort((a, b) => (s.writing[a] ?? -1) - (s.writing[b] ?? -1));
    // only re-sort when the level or source changes, not after every attempt
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chars.data, level, custom]);
  const ch = list[Math.min(i, list.length - 1)];
  const info: CharInfo | undefined = ch ? chars.data?.[ch] : undefined;
  const examples = useMemo(() => (words.data ?? []).filter((w) => ch && w.zh.includes(ch)).slice(0, 4), [words.data, ch]);
  const size = typeof window !== "undefined" ? Math.min(300, window.innerWidth - 64) : 280;

  const finished = (mistakes: number, strokes: number) => {
    if (!ch) return;
    const pct = Math.max(0, Math.round(100 * (1 - mistakes / Math.max(1, strokes))));
    if (mode === "recall") {
      saveWriting(ch, pct);
      if (pct < 60) addMistake(`char:${ch}`, "char"); else clearMistake(`char:${ch}`);
    }
    logPractice(1);
    setLast({ ch, pct });
  };
  const go = (d: number) => { setI((x) => Math.max(0, Math.min(list.length - 1, x + d))); setLast(null); };

  return (
    <div className="grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)]">
      <div className="card flex flex-col items-center gap-4 p-5">
        <div className="grid w-full grid-cols-3 gap-1.5">
          {MODES.map((m) => (
            <button key={m.id} onClick={() => { setMode(m.id); setLast(null); }} className={`rounded-xl border px-2 py-2 text-center ${mode === m.id ? "border-accent bg-accent-soft" : "border-line hover:bg-card2"}`}>
              <div className="text-sm font-semibold">{m.label}</div><div className="text-[0.65rem] text-muted">{m.desc}</div>
            </button>
          ))}
        </div>
        {ch ? <Writer key={`${ch}-${mode}`} ref={writer} ch={ch} mode={mode} size={size} onDone={finished} /> : <div className="text-muted">Loading…</div>}
        {last && last.ch === ch && (
          <div className={`pop text-sm font-semibold ${last.pct >= 80 ? "text-good" : last.pct >= 60 ? "text-gold" : "text-accent"}`}>
            {mode === "recall" ? `Written from memory: ${last.pct}%` : `Traced with ${last.pct}% accuracy`} — {last.pct >= 80 ? "很好！" : "try once more"}
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          <button className="btn btn-sm" onClick={() => go(-1)} disabled={i === 0}><ArrowLeft size={14} /> Prev</button>
          <button className="btn btn-sm" onClick={() => writer.current?.animate()}><Play size={14} /> Show strokes</button>
          <button className="btn btn-sm" onClick={() => { writer.current?.restart(); setLast(null); }}><RotateCcw size={14} /> Again</button>
          <button className="btn btn-sm btn-primary" onClick={() => go(1)} disabled={i >= list.length - 1}>Next <ArrowRight size={14} /></button>
        </div>
      </div>

      <div className="min-w-0 space-y-4">
        <div className="card space-y-3 p-4">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((l) => <button key={l} className="chip" data-active={!custom && level === l} onClick={() => { setCustom(null); setLevel(l); setI(0); setLast(null); }}>HSK {l}</button>)}
          </div>
          <form className="relative" onSubmit={(e) => { e.preventDefault(); const cs = [...new Set([...text].filter((c) => HAN.test(c)))]; if (cs.length) { setCustom(cs); setI(0); setLast(null); } }}>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input han pl-9" value={text} onChange={(e) => setText(e.target.value)} placeholder="Practise your own characters: type or paste 汉字 and press Enter" aria-label="Characters to practise" />
          </form>
          <div className="noscroll -mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
            {list.slice(0, 80).map((c, k) => (
              <button key={c + k} onClick={() => { setI(k); setLast(null); }} title={s.writing[c] !== undefined ? `best ${s.writing[c]}%` : "not written yet"}
                className={`hanzi flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-xl ${k === i ? "border-accent bg-accent-soft" : s.writing[c] >= 80 ? "border-good/40 bg-good-soft" : "border-line bg-card"}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="text-xs text-muted">{custom ? `${list.length} custom characters` : `${list.length} characters introduced at HSK ${level} · weakest first`} · green = written from memory ≥ 80%</div>
        </div>

        {ch && (
          <div className="card space-y-3 p-5">
            <div className="flex items-start gap-4">
              {mode === "recall" ? (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-card2 text-muted"><Eye size={22} /></div>
              ) : <div className="hanzi text-7xl leading-none">{ch}</div>}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-2xl text-accent">{info?.[1] || "—"} <SpeakButton text={ch} rate={0.7} size="sm" /></div>
                <div className="text-sm">{info?.[2]}</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {info?.[3] ? <Badge>{info[3]} strokes</Badge> : null}
                  {info && [info[5], info[6]].filter((p) => p && p !== ch && !p.includes("*")).map((p) => <Badge key={p} tone="sky">{p}</Badge>)}
                  {s.writing[ch] !== undefined && <Badge tone="good">best {s.writing[ch]}%</Badge>}
                </div>
              </div>
            </div>
            {mode === "recall" && <p className="text-sm text-muted"><PenLine size={13} className="mr-1 inline" />Recall mode: write the character for <b>{info?.[1]}</b> “{info?.[2]?.split(";")[0]}” without looking. Hints appear after 3 misses.</p>}
            {examples.length > 0 && (
              <div>
                <div className="eyebrow mb-1">Words with {mode === "recall" ? "this character" : ch}</div>
                <ul className="space-y-1">
                  {examples.map((w) => (
                    <li key={w.id} className="flex items-center gap-2 text-sm">
                      <SpeakButton text={w.zh} size="sm" rate={0.8} />
                      <span className="hanzi text-lg">{mode === "recall" ? w.zh.replaceAll(ch, "□") : w.zh}</span>
                      <span className="text-accent">{w.py}</span>
                      <span className="truncate text-muted">{w.en}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Radicals({ onPick }: { onPick: (chars: string[]) => void }) {
  const [q, setQ] = useState("");
  const list = RADICALS.filter((r) => !q || r.meaning.toLowerCase().includes(q.toLowerCase()) || r.r.includes(q) || (r.forms ?? "").includes(q) || r.examples.includes(q));
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Radicals are the building blocks of characters and often hint at meaning: 氵(water) appears in 河 river, 湖 lake, 洗 wash. Tap a radical to practise writing its example characters.</p>
      <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search meaning (water, hand…) or character" aria-label="Search radicals" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((r) => (
          <button key={r.r} className="card p-4 text-left hover:-translate-y-0.5" onClick={() => onPick([r.r, ...r.examples])}>
            <div className="flex items-baseline gap-2"><span className="hanzi text-4xl">{r.r}</span>{r.forms && <span className="hanzi text-2xl text-muted">{r.forms}</span>}</div>
            <div className="mt-1 font-semibold">{r.meaning}</div>
            <div className="text-xs text-muted">{r.py} · {r.strokes} strokes</div>
            <div className="hanzi mt-2 text-lg tracking-widest text-accent">{r.examples}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
