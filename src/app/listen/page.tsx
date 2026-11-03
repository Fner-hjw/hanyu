"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Headphones, Keyboard, Play, RotateCcw, Snail, X } from "lucide-react";
import { loadSentences, sentenceAudio, useAsync, type Sentence } from "@/lib/data";
import { playUrl, stopAll } from "@/lib/audio";
import { rng } from "@/lib/quiz";
import { compareHanzi, comparePinyin, isHanInput, type Compared } from "@/lib/compare";
import { addMistake, clearMistake, logPractice, useHydrated } from "@/lib/store";
import { Annotated } from "@/components/Annotated";
import { Marked, ScorePill } from "@/components/Marked";
import { PageHeader, Progress, plural } from "@/components/ui";

type Mode = "meaning" | "dictation";
const LEVELS = [1, 2, 3, 4, 5, 6];
const ROUND = 10;
const topicLabel = (t: string) => t.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

export default function ListenPage() {
  const hydrated = useHydrated();
  return hydrated ? <Listen /> : null;
}

function Listen() {
  const [level, setLevel] = useState(3);
  const [topic, setTopic] = useState("all");
  const [mode, setMode] = useState<Mode>("meaning");
  const [slow, setSlow] = useState(false);
  const [session, setSession] = useState<{ items: Sentence[]; seed: number } | null>(null);
  const data = useAsync(() => loadSentences(level), [level]);
  const topics = useMemo(() => [...new Set((data.data ?? []).map((s) => s.tp))].sort(), [data.data]);
  const pool = useMemo(() => (data.data ?? []).filter((s) => topic === "all" || s.tp === topic), [data.data, topic]);

  const start = () => {
    const seed = Date.now();
    const r = rng(seed);
    const items = [...pool].sort(() => r() - 0.5).slice(0, ROUND);
    setSession({ items, seed });
  };

  if (session && data.data) {
    return <Session key={session.seed} items={session.items} pool={data.data} mode={mode} slow={slow} setSlow={setSlow} seed={session.seed} onExit={() => setSession(null)} onAgain={start} />;
  }

  return (
    <div>
      <PageHeader title="Listen" subtitle="Real recordings of 4,354 graded sentences. Train your ear for meaning, then for every syllable with dictation." />
      <div className="card space-y-5 p-5">
        <div>
          <div className="eyebrow mb-2">Level</div>
          <div className="flex flex-wrap gap-2">{LEVELS.map((l) => <button key={l} className="chip" data-active={level === l} onClick={() => { setLevel(l); setTopic("all"); }}>HSK {l}</button>)}</div>
        </div>
        <div>
          <div className="eyebrow mb-2">Topic</div>
          <div className="noscroll -mx-1 flex gap-2 overflow-x-auto px-1">
            <button className="chip shrink-0" data-active={topic === "all"} onClick={() => setTopic("all")}>All topics</button>
            {topics.map((t) => <button key={t} className="chip shrink-0" data-active={topic === t} onClick={() => setTopic(t)}>{topicLabel(t)}</button>)}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {([["meaning", Headphones, "Meaning", "Hear a sentence, pick the right translation"], ["dictation", Keyboard, "Dictation", "Type what you hear — characters or pinyin"]] as const).map(([id, Icon, label, desc]) => (
            <button key={id} onClick={() => setMode(id)} className={`rounded-xl border p-4 text-left ${mode === id ? "border-accent bg-accent-soft" : "border-line hover:bg-card2"}`}>
              <Icon size={20} className="text-accent" /><div className="mt-1 font-semibold">{label}</div><div className="text-sm text-muted">{desc}</div>
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={slow} onChange={(e) => setSlow(e.target.checked)} /> Start with slow audio</label>
        <button className="btn btn-primary w-full sm:w-auto" disabled={!pool.length} onClick={start}>
          <Play size={16} /> {data.loading ? "Loading…" : `Start ${ROUND} sentences`}
        </button>
        <p className="text-xs text-muted">{pool.length.toLocaleString()} sentences available · audio by no7z/hsk-sentences-audio (CC BY-SA 4.0)</p>
      </div>
    </div>
  );
}

function Session({ items, pool, mode, slow, setSlow, seed, onExit, onAgain }: {
  items: Sentence[]; pool: Sentence[]; mode: Mode; slow: boolean; setSlow: (v: boolean) => void; seed: number; onExit: () => void; onAgain: () => void;
}) {
  const [i, setI] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const item = items[i];

  if (!item) {
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length));
    return (
      <div className="card pop mx-auto max-w-lg p-8 text-center">
        <div className="hanzi text-5xl text-accent">{avg >= 80 ? "耳朵很好！" : "继续练习！"}</div>
        <p className="mt-3 text-lg font-semibold">Average {avg}% over {plural(scores.length, "sentence")}</p>
        <p className="text-sm text-muted">Sentences under 60% were added to your Mistakes.</p>
        <div className="mt-5 flex justify-center gap-2">
          <button className="btn btn-primary" onClick={onAgain}><RotateCcw size={15} /> New round</button>
          <button className="btn" onClick={onExit}>Change settings</button>
        </div>
      </div>
    );
  }
  const done = (score: number) => {
    logPractice(1);
    if (score < 60) addMistake(`listen:${item.id}`, "listen"); else clearMistake(`listen:${item.id}`);
    setScores((s) => [...s, score]);
  };
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center gap-3 text-sm">
        <button onClick={() => { stopAll(); onExit(); }} className="text-muted hover:text-fg">← Settings</button>
        <span className="font-semibold">{mode === "meaning" ? "Listening for meaning" : "Dictation"}</span>
        <span className="ml-auto text-muted">{i + 1}/{items.length}</span>
      </div>
      <Progress className="mb-4" value={(i / items.length) * 100} />
      <Item key={item.id} item={item} pool={pool} mode={mode} slow={slow} setSlow={setSlow} seed={seed + i} onDone={done} onNext={() => setI(i + 1)} last={i + 1 === items.length} />
    </div>
  );
}

function Item({ item, pool, mode, slow, setSlow, seed, onDone, onNext, last }: {
  item: Sentence; pool: Sentence[]; mode: Mode; slow: boolean; setSlow: (v: boolean) => void; seed: number;
  onDone: (score: number) => void; onNext: () => void; last: boolean;
}) {
  const [answered, setAnswered] = useState<{ score: number; picked?: number; compared?: Compared } | null>(null);
  const [typed, setTyped] = useState("");
  const [plays, setPlays] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const play = (s = slow) => { setPlays((p) => p + 1); void playUrl(sentenceAudio(item.id, s), item.z, s ? 0.85 : 1); };

  // autoplay once when the item appears
  useEffect(() => {
    const t = setTimeout(() => { void playUrl(sentenceAudio(item.id, slow), item.z, slow ? 0.85 : 1); }, 250);
    if (mode === "dictation") inputRef.current?.focus();
    return () => { clearTimeout(t); stopAll(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  const options = useMemo(() => {
    if (mode !== "meaning") return [];
    const r = rng(seed);
    const len = item.z.length;
    const cands = pool.filter((s) => s.id !== item.id && s.e !== item.e)
      .map((s) => ({ s, k: (s.tp === item.tp ? 0 : 3) + Math.abs(s.z.length - len) / 3 + r() * 2 }))
      .sort((a, b) => a.k - b.k).slice(0, 8).sort(() => r() - 0.5).slice(0, 3).map((x) => x.s.e);
    const all = [...cands, item.e].sort(() => r() - 0.5);
    return all;
  }, [mode, pool, item, seed]);

  const pick = (k: number) => {
    if (answered) return;
    const score = options[k] === item.e ? 100 : 0;
    setAnswered({ score, picked: k });
    onDone(score);
  };
  const check = () => {
    if (answered) return;
    const compared = typed.trim() ? (isHanInput(typed) ? compareHanzi(item.z, typed) : comparePinyin(item.z, typed)) : compareHanzi(item.z, "");
    setAnswered({ score: compared.score, compared });
    onDone(compared.score);
  };

  return (
    <div className="space-y-4">
      <div className="card flex flex-col items-center gap-4 p-6">
        <div className="flex items-center gap-3">
          <button className="btn btn-primary h-16 w-16 rounded-full p-0" onClick={() => play()} aria-label="Play sentence"><Play size={26} /></button>
          <button className={`btn btn-sm ${slow ? "border-accent bg-accent-soft" : ""}`} onClick={() => { setSlow(!slow); play(!slow); }} aria-pressed={slow}><Snail size={15} /> Slow</button>
        </div>
        <div className="text-xs text-muted">Played {plays + 1}× · replay as often as you need</div>
      </div>

      {mode === "meaning" && (
        <div className="grid gap-2">
          {options.map((o, k) => {
            const state = !answered ? undefined : o === item.e ? "right" : answered.picked === k ? "wrong" : undefined;
            return (
              <button key={k} className="opt" data-state={state} disabled={!!answered} onClick={() => pick(k)}>
                <span className="flex items-center justify-between gap-2">{o}{state === "right" && <Check size={18} className="shrink-0 text-good" />}{state === "wrong" && <X size={18} className="shrink-0 text-accent" />}</span>
              </button>
            );
          })}
        </div>
      )}

      {mode === "dictation" && !answered && (
        <form className="card space-y-3 p-4" onSubmit={(e) => { e.preventDefault(); check(); }}>
          <input ref={inputRef} className="input han text-lg" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Type the sentence in 汉字 or pinyin…" autoComplete="off" spellCheck={false} aria-label="Your dictation" />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted">Pinyin is fine — tones optional, spaces optional.</span>
            <button className="btn btn-primary">Check</button>
          </div>
        </form>
      )}

      {answered && (
        <div className="card pop space-y-3 p-5">
          {answered.compared ? (
            <>
              <ScorePill score={answered.score} />
              <div><Marked result={answered.compared} /></div>
              {typed && <div className="text-sm text-muted">You typed: <span className="han">{typed}</span></div>}
            </>
          ) : (
            <div className={`font-semibold ${answered.score ? "text-good" : "text-accent"}`}>{answered.score ? "✓ Correct" : "✗ Not quite"}</div>
          )}
          <div className="rounded-xl bg-card2 p-3">
            <Annotated text={item.z} size="text-xl" />
            <div className="text-sm text-muted">{item.e}</div>
          </div>
          <div className="flex justify-end"><button className="btn btn-primary" onClick={onNext} autoFocus>{last ? "Finish" : "Next"}</button></div>
        </div>
      )}
    </div>
  );
}
