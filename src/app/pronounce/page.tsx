"use client";

import { useMemo, useState } from "react";
import { Check, Play, RotateCcw, X } from "lucide-react";
import { loadChars, loadLevels, useAsync } from "@/lib/data";
import { speak } from "@/lib/audio";
import { rng } from "@/lib/quiz";
import { INITIALS, buildSyllables, initialOf, minimalPairs, tonePairWords, toneOf, type SylEntry } from "@/lib/syllables";
import { logPractice, useHydrated } from "@/lib/store";
import { PageHeader, Progress } from "@/components/ui";

type Tab = "tones" | "trainer" | "chart" | "pairs";
const TABS: [Tab, string][] = [["tones", "The four tones"], ["trainer", "Tone trainer"], ["chart", "Pinyin chart"], ["pairs", "Minimal pairs"]];

export default function PronouncePage() {
  const hydrated = useHydrated();
  const [tab, setTab] = useState<Tab>("tones");
  if (!hydrated) return null;
  return (
    <div>
      <PageHeader title="Pronounce" subtitle="Tones carry meaning in Mandarin — 买 mǎi is to buy, 卖 mài is to sell. Train your ear, then your mouth." />
      <div className="noscroll -mx-1 mb-5 flex gap-2 overflow-x-auto px-1">
        {TABS.map(([id, label]) => <button key={id} className="chip shrink-0" data-active={tab === id} onClick={() => setTab(id)}>{label}</button>)}
      </div>
      {tab === "tones" && <Tones />}
      {tab === "trainer" && <Trainer />}
      {tab === "chart" && <Chart />}
      {tab === "pairs" && <Pairs />}
    </div>
  );
}

/* ---------- tones ---------- */
const CONTOURS: { t: string; name: string; d: string; desc: string; ex: [string, string][] }[] = [
  { t: "1", name: "First · high level", d: "M10 14 L90 14", desc: "High and steady, as if singing one note.", ex: [["妈", "mā"], ["汤", "tāng"], ["先", "xiān"]] },
  { t: "2", name: "Second · rising", d: "M10 42 L90 12", desc: "Rises like a surprised “what?”.", ex: [["麻", "má"], ["糖", "táng"], ["钱", "qián"]] },
  { t: "3", name: "Third · dipping", d: "M10 32 Q40 62 60 52 T90 20", desc: "Low and dipping. Before another 3rd tone it becomes 2nd (你好 → ní hǎo); in fast speech it's mostly just low.", ex: [["马", "mǎ"], ["躺", "tǎng"], ["好", "hǎo"]] },
  { t: "4", name: "Fourth · falling", d: "M10 12 L90 50", desc: "Sharp fall, like a firm “No!”.", ex: [["骂", "mà"], ["烫", "tàng"], ["是", "shì"]] },
  { t: "·", name: "Neutral", d: "M45 34 L55 34", desc: "Short and light, no tone mark (吗 ma, 的 de).", ex: [["吗", "ma"], ["的", "de"], ["了", "le"]] },
];
function Tones() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CONTOURS.map((c) => (
          <div key={c.t} className="card p-4">
            <div className="flex items-center justify-between"><span className="font-semibold">{c.name}</span><span className="text-2xl font-bold text-accent">{c.t}</span></div>
            <svg viewBox="0 0 100 64" className="my-2 h-16 w-full" aria-hidden>
              {[12, 24, 36, 48].map((y) => <line key={y} x1="6" x2="94" y1={y} y2={y} stroke="var(--line)" strokeDasharray="2 3" />)}
              <path d={c.d} fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <p className="text-sm text-muted">{c.desc}</p>
            <div className="mt-3 flex gap-2">
              {c.ex.map(([ch, py]) => (
                <button key={ch} className="btn btn-sm" onClick={() => speak(ch, 0.7)}><span className="hanzi text-lg">{ch}</span> {py}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="card-flat p-4 text-sm">
        <b>Tone changes to know:</b> 不 bù becomes <b>bú</b> before a 4th tone (不是 bú shì) · 一 yī becomes <b>yí</b> before a 4th tone and <b>yì</b> before others (一个 yí gè, 一天 yì tiān) · 3rd + 3rd → 2nd + 3rd (很好 hén hǎo).
      </div>
    </div>
  );
}

/* ---------- tone trainer ---------- */
type TQ = { zh: string; py: string; en?: string; answer: string; options: string[] };
const PATTERNS = ["1", "2", "3", "4"].flatMap((a) => ["1", "2", "3", "4"].map((b) => `${a}-${b}`));

function Trainer() {
  const chars = useAsync(loadChars, []);
  const words = useAsync(() => loadLevels([1, 2, 3]), []);
  const [kind, setKind] = useState<"single" | "pair">("single");
  const [qs, setQs] = useState<TQ[] | null>(null);

  const start = () => {
    if (!chars.data || !words.data) return;
    const r = rng(Date.now());
    if (kind === "single") {
      const pool = [...buildSyllables(chars.data).values()].flatMap((e) => Object.values(e.tones)).filter((x) => x && x.level <= 3) as { ch: string; py: string }[];
      const pick = [...pool].sort(() => r() - 0.5).slice(0, 10);
      setQs(pick.map((x) => ({ zh: x.ch, py: x.py, answer: String(toneOf(x.py)), options: ["1", "2", "3", "4"] })));
    } else {
      const pool = tonePairWords(words.data);
      const pick = [...pool].sort(() => r() - 0.5).slice(0, 10);
      setQs(pick.map((w) => {
        const others = PATTERNS.filter((p) => p !== w.pattern).sort(() => r() - 0.5).slice(0, 3);
        return { zh: w.zh, py: w.py, en: w.en, answer: w.pattern, options: [...others, w.pattern].sort(() => r() - 0.5) };
      }));
    }
  };

  if (qs) return <ToneQuiz key={qs.map((q) => q.zh).join()} qs={qs} onAgain={start} onExit={() => setQs(null)} />;
  return (
    <div className="card space-y-4 p-5">
      <p>Listen to a syllable or word and identify its tones. 10 questions, replay as often as you like.</p>
      <div className="flex flex-wrap gap-2">
        <button className="chip" data-active={kind === "single"} onClick={() => setKind("single")}>Single syllables</button>
        <button className="chip" data-active={kind === "pair"} onClick={() => setKind("pair")}>Two-syllable words (tone pairs)</button>
      </div>
      <button className="btn btn-primary" onClick={start} disabled={!chars.data || !words.data}><Play size={16} /> {chars.data && words.data ? "Start" : "Loading…"}</button>
    </div>
  );
}

function ToneQuiz({ qs, onAgain, onExit }: { qs: TQ[]; onAgain: () => void; onExit: () => void }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const q = qs[i];
  if (!q) return (
    <div className="card pop p-8 text-center">
      <div className="text-3xl font-bold">{score}/{qs.length}</div>
      <p className="text-muted">{score >= 8 ? "Excellent ear!" : "Tones take time — a few minutes a day works wonders."}</p>
      <div className="mt-4 flex justify-center gap-2"><button className="btn btn-primary" onClick={onAgain}><RotateCcw size={15} /> Again</button><button className="btn" onClick={onExit}>Back</button></div>
    </div>
  );
  const choose = (o: string) => { if (picked) return; setPicked(o); logPractice(1); if (o === q.answer) setScore((s) => s + 1); };
  const label = (o: string) => o.split("-").map((t) => ["", "ˉ 1", "ˊ 2", "ˇ 3", "ˋ 4"][+t]).join("  +  ");
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Progress value={(i / qs.length) * 100} />
      <div className="card flex flex-col items-center gap-3 p-6">
        <button className="btn btn-primary h-16 w-16 rounded-full p-0" onClick={() => speak(q.zh, 0.75)} aria-label="Play"><Play size={26} /></button>
        {picked && <div className="pop text-center"><div className="hanzi text-4xl">{q.zh}</div><div className="text-lg text-accent">{q.py}</div>{q.en && <div className="text-sm text-muted">{q.en}</div>}</div>}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((o) => {
          const state = !picked ? undefined : o === q.answer ? "right" : o === picked ? "wrong" : undefined;
          return <button key={o} className="opt text-center text-lg font-semibold" data-state={state} disabled={!!picked} onClick={() => choose(o)}>{label(o)}</button>;
        })}
      </div>
      {picked && <div className="flex justify-end"><button className="btn btn-primary" autoFocus onClick={() => { setI(i + 1); setPicked(null); }}>Next</button></div>}
    </div>
  );
}

/* ---------- pinyin chart ---------- */
function Chart() {
  const chars = useAsync(loadChars, []);
  const map = useMemo(() => (chars.data ? buildSyllables(chars.data) : null), [chars.data]);
  const [ini, setIni] = useState<string>("zh");
  const [sel, setSel] = useState<SylEntry | null>(null);
  if (!map) return <p className="text-muted">Loading syllables…</p>;
  const list = [...map.values()].filter((e) => initialOf(e.syl) === ini).sort((a, b) => a.syl.localeCompare(b.syl));
  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="eyebrow mb-2">Initial</div>
        <div className="flex flex-wrap gap-1.5">
          {INITIALS.map((x) => <button key={x || "none"} className="chip min-w-10 justify-center" data-active={ini === x} onClick={() => { setIni(x); setSel(null); }}>{x || "∅"}</button>)}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
        {list.map((e) => (
          <button key={e.syl} className={`card-flat px-2 py-3 text-center font-semibold hover:bg-accent-soft ${sel?.syl === e.syl ? "ring-2 ring-accent" : ""}`} onClick={() => setSel(e)}>{e.syl}</button>
        ))}
      </div>
      {sel && (
        <div className="card pop p-4">
          <div className="mb-3 font-semibold">{sel.syl}</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {([1, 2, 3, 4] as const).map((t) => {
              const x = sel.tones[t];
              return x ? (
                <button key={t} className="card-flat p-3 text-center hover:bg-accent-soft" onClick={() => speak(x.ch, 0.7)}>
                  <div className="hanzi text-3xl">{x.ch}</div><div className="text-accent">{x.py}</div>
                </button>
              ) : <div key={t} className="rounded-xl border border-dashed border-line p-3 text-center text-sm text-muted">tone {t}: —</div>;
            })}
          </div>
        </div>
      )}
      <p className="text-xs text-muted">Only syllables with an unambiguous common character are shown, so the voice always pronounces the intended sound.</p>
    </div>
  );
}

/* ---------- minimal pairs ---------- */
function Pairs() {
  const chars = useAsync(loadChars, []);
  const all = useMemo(() => (chars.data ? minimalPairs(buildSyllables(chars.data)) : []), [chars.data]);
  const labels = useMemo(() => [...new Set(all.map((p) => p.label))], [all]);
  const [label, setLabel] = useState("all");
  const [round, setRound] = useState<{ items: { a: { ch: string; py: string }; b: { ch: string; py: string }; target: 0 | 1 }[] } | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<0 | 1 | null>(null);
  const [score, setScore] = useState(0);

  const start = () => {
    const r = rng(Date.now());
    const pool = all.filter((p) => label === "all" || p.label === label);
    setRound({ items: [...pool].sort(() => r() - 0.5).slice(0, 10).map((p) => ({ ...p, target: r() < 0.5 ? 0 : 1 })) });
    setI(0); setPicked(null); setScore(0);
  };
  if (!chars.data) return <p className="text-muted">Loading…</p>;
  const it = round?.items[i];

  if (!round || !it) return (
    <div className="card space-y-4 p-5">
      {round && <p className="text-lg font-semibold">Score: {score}/{round.items.length}</p>}
      <p>Hear one of two similar syllables and pick which one it was. These contrasts trip up most English speakers.</p>
      <div className="flex flex-wrap gap-2">
        <button className="chip" data-active={label === "all"} onClick={() => setLabel("all")}>Mixed</button>
        {labels.map((l) => <button key={l} className="chip" data-active={label === l} onClick={() => setLabel(l)}>{l}</button>)}
      </div>
      <button className="btn btn-primary" onClick={start}><Play size={16} /> {round ? "Play again" : "Start 10 pairs"}</button>
    </div>
  );
  const target = it.target === 0 ? it.a : it.b;
  const choose = (k: 0 | 1) => { if (picked !== null) return; setPicked(k); logPractice(1); if (k === it.target) setScore((s) => s + 1); };
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Progress value={(i / round.items.length) * 100} />
      <div className="card flex justify-center p-6"><button className="btn btn-primary h-16 w-16 rounded-full p-0" onClick={() => speak(target.ch, 0.7)} aria-label="Play"><Play size={26} /></button></div>
      <div className="grid grid-cols-2 gap-3">
        {([it.a, it.b] as const).map((x, k) => {
          const state = picked === null ? undefined : k === it.target ? "right" : k === picked ? "wrong" : undefined;
          return (
            <button key={k} className="opt py-5 text-center" data-state={state} disabled={picked !== null} onClick={() => choose(k as 0 | 1)}>
              <div className="text-2xl font-bold">{x.py}</div>
              {picked !== null && <div className="hanzi text-2xl">{x.ch}</div>}
              {state === "right" && <Check className="mx-auto text-good" size={18} />}{state === "wrong" && <X className="mx-auto text-accent" size={18} />}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="flex justify-between">
          <button className="btn btn-sm" onClick={() => { speak(it.a.ch, 0.7); setTimeout(() => speak(it.b.ch, 0.7), 1100); }}>Hear both</button>
          <button className="btn btn-primary" autoFocus onClick={() => { setI(i + 1); setPicked(null); }}>Next</button>
        </div>
      )}
    </div>
  );
}
