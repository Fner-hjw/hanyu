"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Link2, Play, Puzzle, RotateCcw, X, Zap } from "lucide-react";
import { loadLevel, loadSentences, sentenceAudio, useAsync, type Sentence, type Word } from "@/lib/data";
import { playUrl, speak, stopAll } from "@/lib/audio";
import { makeQuiz, rng } from "@/lib/quiz";
import { addMistake, clearMistake, logPractice, useHydrated } from "@/lib/store";
import { PageHeader, Progress } from "@/components/ui";

const LEVELS = [1, 2, 3, 4, 5, 6];
const PAIRS = 6;
const BUILD_ROUND = 8;
const SPEED_SECONDS = 60;
const SPEED_BATCH = 40;

type GameId = "match" | "build" | "speed";
type Active = { id: GameId; seed: number };

const newSeed = () => Date.now();

function shuffled<T>(arr: T[], r: () => number): T[] {
  const b = [...arr];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export default function GamesPage() {
  const hydrated = useHydrated();
  return hydrated ? <Games /> : null;
}

function Games() {
  const [level, setLevel] = useState(3);
  const [active, setActive] = useState<Active | null>(null);
  const words = useAsync(() => loadLevel(level), [level]);
  const sentences = useAsync(() => loadSentences(level), [level]);

  const start = (id: GameId) => setActive({ id, seed: newSeed() });
  const exit = () => { stopAll(); setActive(null); };

  if (active && words.data && sentences.data) {
    const common = { key: active.seed, seed: active.seed, onAgain: () => start(active.id), onExit: exit };
    if (active.id === "match") return <MatchGame {...common} words={words.data} />;
    if (active.id === "build") return <BuildGame {...common} sentences={sentences.data} />;
    return <SpeedGame {...common} words={words.data} />;
  }

  const loading = words.loading || sentences.loading;
  const cards = [
    { id: "match" as const, Icon: Link2, title: "Match pairs", desc: "Connect 6 characters to their English meanings, as fast as you can.", ok: !!words.data?.length },
    { id: "build" as const, Icon: Puzzle, title: "Sentence builder", desc: "Put shuffled words in order to build the sentence for the English prompt.", ok: !!sentences.data?.length },
    { id: "speed" as const, Icon: Zap, title: "Speed round", desc: "60 seconds of rapid-fire multiple choice. How many can you get?", ok: !!words.data?.length },
  ];

  return (
    <div>
      <PageHeader title="Games" subtitle="Quick, fun drills that still count toward your daily goal." />
      <div className="card mb-4 p-5">
        <div className="eyebrow mb-2">Level</div>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((l) => <button key={l} className="chip" data-active={level === l} onClick={() => setLevel(l)}>HSK {l}</button>)}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ id, Icon, title, desc, ok }) => (
          <div key={id} className="card flex flex-col gap-3 p-5">
            <Icon size={24} className="text-accent" aria-hidden />
            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-muted">{desc}</p>
            </div>
            <button className="btn btn-primary mt-auto w-full" disabled={!ok} onClick={() => start(id)}>
              <Play size={16} /> {loading ? "Loading…" : "Start"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

type GameProps = { seed: number; onAgain: () => void; onExit: () => void };

function Results({ title, children, onAgain, onExit }: { title: string; children: React.ReactNode; onAgain: () => void; onExit: () => void }) {
  return (
    <div className="card pop mx-auto max-w-lg p-6 text-center sm:p-8">
      <div className="hanzi text-5xl text-accent">{title}</div>
      <div aria-live="polite" className="mt-3 space-y-1">{children}</div>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button className="btn btn-primary" onClick={onAgain}><RotateCcw size={15} /> Play again</button>
        <button className="btn" onClick={onExit}>Back to games</button>
      </div>
    </div>
  );
}

/* ---------------- Match pairs ---------------- */

function MatchGame({ words, seed, onAgain, onExit }: GameProps & { words: Word[] }) {
  const init = useMemo(() => {
    const r = rng(seed);
    const picked = shuffled(words.filter((w) => w.en.trim()), r).slice(0, PAIRS);
    const idx = picked.map((_, i) => i);
    return { picked, left: shuffled(idx, r), right: shuffled(idx, r) };
  }, [words, seed]);
  const { picked, left, right } = init;
  const n = picked.length;

  const [matched, setMatched] = useState<number[]>([]);
  const [selL, setSelL] = useState<number | null>(null);
  const [selR, setSelR] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [involved, setInvolved] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const done = n > 0 && matched.length === n;

  useEffect(() => {
    if (done) return;
    const iv = setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => clearInterval(iv);
  }, [done]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const pick = (side: "l" | "r", w: number) => {
    if (flash || matched.includes(w)) return;
    const l = side === "l" ? w : selL;
    const r = side === "r" ? w : selR;
    setSelL(l);
    setSelR(r);
    if (l === null || r === null) return;
    if (l === r) {
      void speak(picked[l].zh, 0.8);
      const next = [...matched, l];
      setMatched(next);
      setSelL(null);
      setSelR(null);
      if (next.length === n) {
        logPractice(6);
        for (const i of involved) addMistake(picked[i].id, "word");
      }
    } else {
      setMistakes((m) => m + 1);
      setInvolved((v) => [...new Set([...v, l, r])]);
      setFlash(true);
      timer.current = setTimeout(() => { setFlash(false); setSelL(null); setSelR(null); }, 600);
    }
  };

  const state = (side: "l" | "r", w: number) => {
    if (matched.includes(w)) return "right";
    const sel = side === "l" ? selL : selR;
    if (sel !== w) return undefined;
    return flash ? "wrong" : "picked";
  };

  if (done) {
    return (
      <Results title="太棒了！" onAgain={onAgain} onExit={onExit}>
        <p className="text-lg font-semibold">{elapsed}s with {mistakes} {mistakes === 1 ? "mistake" : "mistakes"}</p>
        {involved.length > 0 && <p className="text-sm text-muted">Words from wrong pairs were added to your Mistakes.</p>}
      </Results>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center gap-3 text-sm">
        <button onClick={onExit} className="text-muted hover:text-fg">← Back to games</button>
        <span className="font-semibold">Match pairs</span>
        <span className="ml-auto text-muted" aria-live="polite">{elapsed}s · {mistakes} {mistakes === 1 ? "mistake" : "mistakes"}</span>
      </div>
      <Progress className="mb-4" value={(matched.length / Math.max(1, n)) * 100} />
      <div className="grid grid-cols-2 gap-3">
        <div className="grid content-start gap-2">
          {left.map((w) => (
            <button key={w} className="opt han text-xl" data-state={state("l", w)} disabled={matched.includes(w)} aria-label={`Character ${picked[w].zh}`} onClick={() => pick("l", w)}>
              {picked[w].zh}
            </button>
          ))}
        </div>
        <div className="grid content-start gap-2">
          {right.map((w) => (
            <button key={w} className="opt break-words text-sm" data-state={state("r", w)} disabled={matched.includes(w)} aria-label={`Meaning ${picked[w].en}`} onClick={() => pick("r", w)}>
              {picked[w].en}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Sentence builder ---------------- */

const PUNCT = /^[\p{P}\p{S}\s]+$/u;
type BuildItem = { s: Sentence; tokens: string[]; order: number[] };

function BuildGame({ sentences, seed, onAgain, onExit }: GameProps & { sentences: Sentence[] }) {
  const items = useMemo<BuildItem[]>(() => {
    const r = rng(seed);
    const usable = sentences
      .map((s) => ({ s, tokens: s.k.map((t) => t[0]).filter((t) => !PUNCT.test(t)) }))
      .filter((x) => x.tokens.length >= 4 && x.tokens.length <= 10);
    return shuffled(usable, r).slice(0, BUILD_ROUND).map((x) => {
      const idx = x.tokens.map((_, i) => i);
      let order = shuffled(idx, r);
      for (let tries = 0; tries < 20 && order.every((v, i) => x.tokens[v] === x.tokens[i]); tries++) order = shuffled(idx, r);
      return { ...x, order };
    });
  }, [sentences, seed]);

  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const item = items[i];

  useEffect(() => () => stopAll(), []);

  if (!item) {
    return (
      <Results title={items.length && score >= items.length * 0.75 ? "很好！" : "加油！"} onAgain={onAgain} onExit={onExit}>
        <p className="text-lg font-semibold">Score {score}/{items.length}</p>
      </Results>
    );
  }

  const finish = (ok: boolean) => {
    logPractice(1);
    if (ok) { clearMistake(`build:${item.s.id}`); setScore((s) => s + 1); } else addMistake(`build:${item.s.id}`, "sentence");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center gap-3 text-sm">
        <button onClick={onExit} className="text-muted hover:text-fg">← Back to games</button>
        <span className="font-semibold">Sentence builder</span>
        <span className="ml-auto text-muted" aria-live="polite">{i + 1}/{items.length} · {score} correct</span>
      </div>
      <Progress className="mb-4" value={(i / items.length) * 100} />
      <BuildRound key={item.s.id} item={item} last={i + 1 === items.length} onFinish={finish}
        onOverride={() => { clearMistake(`build:${item.s.id}`); setScore((x) => x + 1); }} onNext={() => { stopAll(); setI(i + 1); }} />
    </div>
  );
}

function BuildRound({ item, last, onFinish, onOverride, onNext }: {
  item: BuildItem; last: boolean; onFinish: (ok: boolean) => void; onOverride: () => void; onNext: () => void;
}) {
  const [answer, setAnswer] = useState<number[]>([]);
  const [result, setResult] = useState<boolean | null>(null);
  const { s, tokens, order } = item;
  const remaining = order.filter((v) => !answer.includes(v));

  const check = () => {
    const ok = answer.map((v) => tokens[v]).join("") === tokens.join("");
    setResult(ok);
    onFinish(ok);
    if (ok) void playUrl(sentenceAudio(s.id), s.z);
  };

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="eyebrow mb-1">Build this sentence</div>
        <p className="text-lg font-semibold">{s.e}</p>
      </div>
      <div
        className={`card flex min-h-16 flex-wrap items-center gap-2 p-3 ${result === true ? "border-good bg-good-soft" : result === false ? "border-accent bg-accent-soft" : ""}`}
        aria-label="Your answer"
      >
        {answer.length === 0 && <span className="px-1 text-sm text-muted">Tap words below to build the sentence</span>}
        {answer.map((v) => (
          <button key={v} className="btn han text-lg" disabled={result !== null} aria-label={`Remove ${tokens[v]}`} onClick={() => setAnswer(answer.filter((x) => x !== v))}>
            {tokens[v]}
          </button>
        ))}
      </div>
      {result === null && (
        <>
          <div className="flex flex-wrap gap-2" aria-label="Available words">
            {remaining.map((v) => (
              <button key={v} className="btn han text-lg" aria-label={`Add ${tokens[v]}`} onClick={() => setAnswer([...answer, v])}>{tokens[v]}</button>
            ))}
          </div>
          <div className="flex justify-end">
            <button className="btn btn-primary" disabled={answer.length !== tokens.length} onClick={check}>Check</button>
          </div>
        </>
      )}
      {result !== null && (
        <div className="card pop space-y-3 p-5" aria-live="polite">
          <div className={`flex items-center gap-2 font-semibold ${result ? "text-good" : "text-accent"}`}>
            {result ? <><Check size={18} /> Correct</> : <><X size={18} /> Not quite. The correct sentence:</>}
          </div>
          <div className="rounded-xl bg-card2 p-3">
            <div className="hanzi text-xl">{s.z}</div>
            <div className="text-sm text-muted">{s.p}</div>
          </div>
          {result === false && (
            <p className="text-sm text-muted">
              Your order: <span className="han text-fg">{answer.map((v) => tokens[v]).join("")}</span>. Chinese word order is fairly fixed, but some words (especially time words like 明天 or 今天) can move before or after the subject.
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            {result === false && <button className="btn" onClick={() => { setResult(true); onOverride(); }}>Mine is also correct</button>}
            <button className="btn btn-primary" onClick={onNext} autoFocus>{last ? "Finish" : "Next"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Speed round ---------------- */

function SpeedGame({ words, seed, onAgain, onExit }: GameProps & { words: Word[] }) {
  const questions = useMemo(
    () => makeQuiz(words, words, SPEED_BATCH * 3, seed).filter((q) => q.kind === "meaning").slice(0, SPEED_BATCH),
    [words, seed],
  );
  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(SPEED_SECONDS);
  const [fb, setFb] = useState<number | null>(null);
  const [tally, setTally] = useState({ answered: 0, correct: 0, missed: [] as Word[] });
  const [done, setDone] = useState(false);
  const tallyRef = useRef(tally);
  const leftRef = useRef(SPEED_SECONDS);
  const finished = useRef(false);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    const t = tallyRef.current;
    logPractice(t.answered);
    for (const w of t.missed) addMistake(w.id, "word");
    setDone(true);
  };

  useEffect(() => {
    const iv = setInterval(() => {
      leftRef.current -= 1;
      setLeft(leftRef.current);
      if (leftRef.current <= 0) { clearInterval(iv); finish(); }
    }, 1000);
    const pending = timeouts.current;
    return () => { clearInterval(iv); pending.forEach(clearTimeout); };
  }, []);

  const q = questions[idx];

  const answer = (k: number) => {
    if (fb !== null || finished.current || !q) return;
    const ok = k === q.answer;
    const prev = tallyRef.current;
    const next = { answered: prev.answered + 1, correct: prev.correct + (ok ? 1 : 0), missed: ok ? prev.missed : [...prev.missed, q.word] };
    tallyRef.current = next;
    setTally(next);
    setFb(k);
    timeouts.current.push(setTimeout(() => {
      if (finished.current) return;
      setFb(null);
      if (idx + 1 >= questions.length) finish(); else setIdx(idx + 1);
    }, 300));
  };

  if (done || !q) {
    const missed = [...new Map(tally.missed.map((w) => [w.id, w])).values()];
    return (
      <Results title={tally.answered && tally.correct / tally.answered >= 0.8 ? "快如闪电！" : "时间到！"} onAgain={onAgain} onExit={onExit}>
        <p className="text-lg font-semibold">{tally.correct} correct, {tally.answered - tally.correct} incorrect</p>
        {missed.length > 0 && (
          <div className="mt-4 text-left">
            <div className="eyebrow mb-2">Words you missed</div>
            <ul className="space-y-1">
              {missed.map((w) => (
                <li key={w.id} className="flex flex-wrap items-baseline gap-x-3 rounded-lg bg-card2 px-3 py-2">
                  <span className="hanzi text-lg">{w.zh}</span>
                  <span className="text-sm text-muted">{w.py}</span>
                  <span className="min-w-0 break-words text-sm">{w.en}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Results>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-3 flex items-center gap-3 text-sm">
        <button onClick={onExit} className="text-muted hover:text-fg">← Back to games</button>
        <span className="font-semibold">Speed round</span>
        <span className="ml-auto text-muted" aria-live="polite">{left}s · {tally.correct} correct · {tally.answered - tally.correct} wrong</span>
      </div>
      <Progress className="mb-4" value={(left / SPEED_SECONDS) * 100} tone="gold" />
      <div className="card mb-3 p-6 text-center">
        <div className="eyebrow mb-1">What does this mean?</div>
        <div className="hanzi text-5xl">{q.word.zh}</div>
        <div className="mt-1 text-sm text-muted">{q.word.py}</div>
      </div>
      <div className="grid gap-2">
        {q.options.map((o, k) => {
          const st = fb === null ? undefined : k === q.answer ? "right" : fb === k ? "wrong" : undefined;
          return <button key={k} className="opt break-words" data-state={st} disabled={fb !== null} onClick={() => answer(k)}>{o}</button>;
        })}
      </div>
    </div>
  );
}
