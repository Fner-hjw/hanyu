"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Eye, Languages, Mic, MicOff, Play, Repeat, Square, Volume2 } from "lucide-react";
import { loadSentences, sentenceAudio, useAsync } from "@/lib/data";
import { playUrl, speak, stopAll } from "@/lib/audio";
import { rng } from "@/lib/quiz";
import { compareHanzi, type Compared } from "@/lib/compare";
import { recognitionSupported, useRecognizer, useRecorder } from "@/lib/speech";
import { addMistake, clearMistake, logPractice, useHydrated } from "@/lib/store";
import { DIALOGUES } from "@/data/dialogues";
import { DIALOGUES_MORE } from "@/data/dialogues-more";
import { PHRASES } from "@/data/toolkit";
import { Annotated } from "@/components/Annotated";
import { Marked, ScorePill } from "@/components/Marked";
import { PageHeader, Progress } from "@/components/ui";

type Mode = "read" | "shadow" | "translate";
type Source = "sentences" | "work" | "dialogues";
type Item = { key: string; zh: string; en: string; audio?: string };

const MODES: { id: Mode; label: string; icon: typeof Mic; desc: string }[] = [
  { id: "read", label: "Read aloud", icon: Eye, desc: "See the sentence, say it, get scored" },
  { id: "shadow", label: "Shadow", icon: Repeat, desc: "Hear it, then repeat without the text" },
  { id: "translate", label: "Say it in Chinese", icon: Languages, desc: "See English, produce the Chinese" },
];

export default function SpeakPage() {
  const hydrated = useHydrated();
  return hydrated ? <Speak /> : null;
}

const WORK_ITEMS: Item[] = PHRASES.flatMap((g) => g.phrases.map((p, i) => ({ key: `p:${g.id}:${i}`, zh: p.zh, en: p.en })));
const DIALOGUE_ITEMS: Item[] = [...DIALOGUES, ...DIALOGUES_MORE].flatMap((d) =>
  d.lines.map((l, i) => ({ key: `d:${d.id}:${i}`, zh: l.zh, en: l.en, who: l.who })).filter((l) => l.who === "我" && l.zh.length <= 60),
);

function Speak() {
  const [source, setSource] = useState<Source>("work");
  const [level, setLevel] = useState(3);
  const [mode, setMode] = useState<Mode>("read");
  const [round, setRound] = useState<{ items: Item[]; seed: number } | null>(null);
  const sents = useAsync(() => loadSentences(level), [level]);

  const pool: Item[] = useMemo(() => {
    if (source === "work") return WORK_ITEMS;
    if (source === "dialogues") return DIALOGUE_ITEMS;
    return (sents.data ?? []).filter((s) => s.z.length <= 28).map((s) => ({ key: `s:${s.id}`, zh: s.z, en: s.e, audio: s.id }));
  }, [source, sents.data]);

  const start = () => {
    const seed = Date.now();
    const r = rng(seed);
    setRound({ items: [...pool].sort(() => r() - 0.5).slice(0, 8), seed });
  };

  if (round) return <Round key={round.seed} items={round.items} mode={mode} onExit={() => setRound(null)} onAgain={start} />;

  return (
    <div>
      <PageHeader title="Speak" subtitle="Speak out loud every day — it's the fastest cure for hesitation. Speech recognition scores each character; record yourself to compare with the model." />
      {!recognitionSupported() && (
        <div className="card-flat mb-4 border-gold bg-gold-soft p-4 text-sm">
          <b>Speech scoring isn&apos;t available in this browser.</b> You can still listen, record yourself and compare. For automatic scoring use Chrome, Edge or Safari.
        </div>
      )}
      <div className="card space-y-5 p-5">
        <div>
          <div className="eyebrow mb-2">What to practise</div>
          <div className="flex flex-wrap gap-2">
            <button className="chip" data-active={source === "work"} onClick={() => setSource("work")}>Workplace phrases ({WORK_ITEMS.length})</button>
            <button className="chip" data-active={source === "dialogues"} onClick={() => setSource("dialogues")}>My lines from dialogues ({DIALOGUE_ITEMS.length})</button>
            <button className="chip" data-active={source === "sentences"} onClick={() => setSource("sentences")}>Graded sentences</button>
          </div>
          {source === "sentences" && (
            <div className="mt-3 flex flex-wrap gap-2">{[1, 2, 3, 4, 5, 6].map((l) => <button key={l} className="chip" data-active={level === l} onClick={() => setLevel(l)}>HSK {l}</button>)}</div>
          )}
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {MODES.map(({ id, label, icon: Icon, desc }) => (
            <button key={id} onClick={() => setMode(id)} className={`rounded-xl border p-4 text-left ${mode === id ? "border-accent bg-accent-soft" : "border-line hover:bg-card2"}`}>
              <Icon size={20} className="text-accent" /><div className="mt-1 font-semibold">{label}</div><div className="text-sm text-muted">{desc}</div>
            </button>
          ))}
        </div>
        <button className="btn btn-primary" disabled={!pool.length} onClick={start}><Mic size={16} /> Start 8 prompts</button>
        <p className="text-xs text-muted">Tip: speak at a natural pace and finish the whole sentence — the recogniser stops when you pause.</p>
      </div>
    </div>
  );
}

function Round({ items, mode, onExit, onAgain }: { items: Item[]; mode: Mode; onExit: () => void; onAgain: () => void }) {
  const [i, setI] = useState(0);
  const [best, setBest] = useState<number[]>([]);
  const item = items[i];
  if (!item) {
    const avg = Math.round(best.reduce((a, b) => a + b, 0) / Math.max(1, best.length));
    return (
      <div className="card pop mx-auto max-w-lg p-8 text-center">
        <div className="hanzi text-5xl text-accent">{avg >= 80 ? "说得真好！" : "多练就会好！"}</div>
        <p className="mt-3 text-lg font-semibold">{best.length ? `Average score ${avg}%` : "Round complete"}</p>
        <div className="mt-5 flex justify-center gap-2">
          <button className="btn btn-primary" onClick={onAgain}>New round</button>
          <button className="btn" onClick={onExit}>Change settings</button>
        </div>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center gap-3 text-sm">
        <button onClick={() => { stopAll(); onExit(); }} className="text-muted hover:text-fg">← Settings</button>
        <span className="font-semibold">{MODES.find((m) => m.id === mode)?.label}</span>
        <span className="ml-auto text-muted">{i + 1}/{items.length}</span>
      </div>
      <Progress className="mb-4" value={(i / items.length) * 100} />
      <Prompt key={item.key} item={item} mode={mode} onScore={(s) => setBest((b) => { const n = [...b]; n[i] = Math.max(n[i] ?? 0, s); return n; })} onNext={() => setI(i + 1)} />
    </div>
  );
}

function Prompt({ item, mode, onScore, onNext }: { item: Item; mode: Mode; onScore: (s: number) => void; onNext: () => void }) {
  const rec = useRecognizer();
  const voice = useRecorder();
  const [result, setResult] = useState<{ cmp: Compared; said: string } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [reveal, setReveal] = useState(mode === "read");
  const scoredFor = useRef<string[] | null>(null);
  const onScoreRef = useRef(onScore);
  useEffect(() => { onScoreRef.current = onScore; }, [onScore]);
  const playModel = () => (item.audio ? playUrl(sentenceAudio(item.audio), item.zh) : speak(item.zh, 0.85));

  // shadowing: play the model first
  useEffect(() => {
    if (mode !== "shadow") return;
    const t = setTimeout(() => void (item.audio ? playUrl(sentenceAudio(item.audio), item.zh) : speak(item.zh, 0.85)), 300);
    return () => { clearTimeout(t); stopAll(); };
  }, [mode, item]);

  // score when the recogniser delivers its final alternatives
  useEffect(() => {
    // each set of recogniser results is scored exactly once
    if (rec.listening || !rec.alternatives.length || scoredFor.current === rec.alternatives) return;
    const alts = rec.alternatives;
    const scored = rec.alternatives.map((a) => ({ said: a, cmp: compareHanzi(item.zh, a) })).sort((a, b) => b.cmp.score - a.cmp.score)[0];
    const t = setTimeout(() => {
      scoredFor.current = alts;
      setResult(scored);
      setReveal(true);
      setAttempts((n) => n + 1);
      onScoreRef.current(scored.cmp.score);
      logPractice(1);
      if (scored.cmp.score < 60) addMistake(`speak:${item.key}`, "sentence"); else clearMistake(`speak:${item.key}`);
    }, 0);
    return () => clearTimeout(t);
  }, [rec.listening, rec.alternatives, item]);

  const talk = () => { stopAll(); setResult(null); rec.reset(); rec.start({ target: item.zh }); };

  return (
    <div className="space-y-4">
      <div className="card space-y-4 p-6 text-center">
        {mode === "translate" && <div className="text-xl font-semibold">{item.en}</div>}
        {reveal ? (
          <div className="mx-auto max-w-xl text-left">{result ? <div className="text-center"><Marked result={result.cmp} /></div> : <Annotated text={item.zh} size="text-2xl" />}</div>
        ) : (
          <div className="text-muted">{mode === "shadow" ? "Listen, then repeat what you heard." : "Say it in Chinese, then compare."}</div>
        )}
        {mode !== "translate" && reveal && !result && <div className="text-sm text-muted">{item.en}</div>}

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button className="btn" onClick={() => void playModel()}><Volume2 size={16} /> Model</button>
          {rec.listening ? (
            <button className="btn btn-primary h-16 w-16 animate-pulse rounded-full p-0" onClick={rec.stop} aria-label="Stop listening"><Square size={22} /></button>
          ) : (
            <button className="btn btn-primary h-16 w-16 rounded-full p-0" onClick={talk} aria-label="Speak now" disabled={!recognitionSupported()}><Mic size={26} /></button>
          )}
          {voice.recording ? (
            <button className="btn" onClick={voice.stop}><MicOff size={16} /> Stop recording</button>
          ) : (
            <button className="btn" onClick={() => void voice.start()}><Mic size={16} /> Record myself</button>
          )}
          {voice.url && <button className="btn" onClick={voice.play}><Play size={16} /> My voice</button>}
        </div>
        {rec.listening && <div className="han min-h-7 text-lg text-muted">{rec.interim || "Listening…"}</div>}
        {(rec.error || voice.error) && <div className="text-sm text-accent">{rec.error ?? voice.error}</div>}
      </div>

      {result && (
        <div className="card pop space-y-2 p-5">
          <ScorePill score={result.cmp.score} />
          <div className="text-sm">I heard: <span className="han text-base">{result.said || "—"}</span></div>
          <div className="text-xs text-muted">Green = right · gold = right sound, different character (usually fine) · red = missed. {mode === "translate" && "In this mode the score is similarity to one reference answer — other correct phrasings are possible."}</div>
          {mode !== "read" && <div className="rounded-xl bg-card2 p-3 text-left"><Annotated text={item.zh} size="text-lg" /><div className="text-sm text-muted">{item.en}</div></div>}
        </div>
      )}

      <div className="flex justify-between">
        {!reveal ? <button className="btn" onClick={() => setReveal(true)}><Eye size={16} /> Show text</button> : <span />}
        <button className="btn btn-primary" onClick={() => { stopAll(); onNext(); }}>{attempts ? "Next" : "Skip"} <ArrowRight size={16} /></button>
      </div>
    </div>
  );
}
