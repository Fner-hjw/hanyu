"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Eye, Mic, Play, RotateCcw, Square } from "lucide-react";
import { ALL_DIALOGUES, SCENARIO_LABEL } from "@/data/dialogues-all";
import type { Dialogue, Line } from "@/data/dialogues";
import { Annotated } from "@/components/Annotated";
import { Marked, ScorePill } from "@/components/Marked";
import { SpeakButton } from "@/components/Speak";
import { Badge } from "@/components/ui";
import { speak, stopAll } from "@/lib/audio";
import { compareHanzi, type Compared } from "@/lib/compare";
import { shuffleOptions } from "@/lib/shuffle";
import { recognitionSupported, useRecognizer } from "@/lib/speech";
import { addMistake, logPractice, saveDialogueScore, updateSettings, useAppState, useHydrated } from "@/lib/store";

type Mode = "read" | "role" | "quiz";
const ME = "我";

export default function DialogueClient({ id }: { id: string }) {
  const hydrated = useHydrated();
  return hydrated ? <Inner id={id} /> : null;
}

function Inner({ id }: { id: string }) {
  const d = ALL_DIALOGUES.find((x) => x.id === id);
  const [mode, setMode] = useState<Mode>("read");

  if (!d) {
    return (
      <p>
        Dialogue not found. <Link className="underline" href="/dialogues">Back to dialogues</Link>
      </p>
    );
  }
  const hasMine = d.lines.some((l) => l.who === ME);
  const modes: { id: Mode; label: string }[] = [
    { id: "read", label: "Read & listen" },
    ...(hasMine ? [{ id: "role" as const, label: "Role-play: be 我" }] : []),
    { id: "quiz", label: "Quiz" },
  ];

  return (
    <div className="space-y-5">
      <Link href="/dialogues" className="text-sm text-muted underline">← All dialogues</Link>
      <header>
        <h1 className="hanzi text-2xl font-bold">{d.titleZh}</h1>
        <p className="font-semibold">{d.title}</p>
        <p className="mt-1 text-sm text-muted">{d.intro}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge tone="sky">{SCENARIO_LABEL[d.scenario]}</Badge>
          <Badge tone="gold">HSK {d.level}</Badge>
          <Badge>{d.lines.length} lines</Badge>
        </div>
      </header>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Practice mode">
        {modes.map((m) => (
          <button key={m.id} className="chip" data-active={mode === m.id} onClick={() => { stopAll(); setMode(m.id); }}>{m.label}</button>
        ))}
      </div>

      {mode === "read" && <ReadMode key={d.id} d={d} />}
      {mode === "role" && <RolePlay key={d.id} d={d} />}
      {mode === "quiz" && <Quiz key={d.id} d={d} />}
    </div>
  );
}

function Bubble({ line, children, active = false }: { line: Line; children: React.ReactNode; active?: boolean }) {
  const mine = line.who === ME;
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`min-w-0 max-w-[92%] rounded-2xl p-3 sm:max-w-[80%] ${mine ? "bg-accent-soft" : "card"} ${active ? "ring-2 ring-accent" : ""}`}>
        {!mine && <div className="eyebrow mb-1">{line.who}</div>}
        {children}
      </div>
    </div>
  );
}

function ReadMode({ d }: { d: Dialogue }) {
  const s = useAppState();
  const speed = s.settings.speed;
  const [showEn, setShowEn] = useState(true);
  const [showPy, setShowPy] = useState(true);
  const [playing, setPlaying] = useState<number | null>(null);
  const stopRef = useRef(false);

  useEffect(() => {
    return () => {
      stopRef.current = true;
      stopAll();
    };
  }, []);

  const playAll = async () => {
    stopAll();
    stopRef.current = false;
    for (let i = 0; i < d.lines.length; i++) {
      if (stopRef.current) return;
      setPlaying(i);
      await speak(d.lines[i].zh, speed);
    }
    if (!stopRef.current) setPlaying(null);
  };
  const stop = () => {
    stopRef.current = true;
    stopAll();
    setPlaying(null);
  };

  return (
    <div className="space-y-4">
      <div className="card-flat flex flex-wrap items-center gap-3 p-3 text-sm">
        <button className="btn btn-primary btn-sm" onClick={() => void playAll()}><Play size={14} /> Play all</button>
        <button className="btn btn-sm" onClick={stop}><Square size={14} /> Stop</button>
        <label className="flex items-center gap-1.5"><input type="checkbox" checked={showPy} onChange={(e) => setShowPy(e.target.checked)} /> Pinyin</label>
        <label className="flex items-center gap-1.5"><input type="checkbox" checked={showEn} onChange={(e) => setShowEn(e.target.checked)} /> English</label>
        <label className="flex items-center gap-1.5">
          Speed
          <select className="rounded-md border border-line bg-card px-1.5 py-1" value={speed} onChange={(e) => updateSettings({ speed: Number(e.target.value) })}>
            <option value={0.6}>0.6×</option>
            <option value={0.75}>0.75×</option>
            <option value={0.9}>0.9×</option>
            <option value={1.1}>1.1×</option>
          </select>
        </label>
      </div>
      <div className="space-y-3">
        {d.lines.map((l, i) => (
          <Bubble key={i} line={l} active={playing === i}>
            <div className="flex items-start gap-2">
              <SpeakButton text={l.zh} rate={speed} label={`Play line ${i + 1}`} size="sm" className="mt-2" />
              <div className="min-w-0 flex-1">
                <Annotated text={l.zh} showPinyin={showPy} size="text-lg" />
                {showEn && <p className="mt-1 text-sm text-muted">{l.en}</p>}
              </div>
            </div>
          </Bubble>
        ))}
      </div>
    </div>
  );
}

function RolePlay({ d }: { d: Dialogue }) {
  const s = useAppState();
  const speed = s.settings.speed;
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<number, number>>({});
  const line = d.lines[step];

  useEffect(() => () => stopAll(), []);

  // other speakers' lines play automatically, then the conversation moves on
  const other = line && line.who !== ME ? line : null;
  useEffect(() => {
    if (!other) return;
    let live = true;
    void speak(other.zh, speed).then(() => {
      if (live) setStep((n) => n + 1);
    });
    return () => {
      live = false;
      stopAll();
    };
  }, [other, speed]);

  const vals = Object.values(scores);
  const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;

  if (!line) {
    return (
      <div className="card pop p-6 text-center">
        <div className="hanzi text-4xl text-accent">{avg !== null && avg >= 80 ? "说得真好！" : "对话结束"}</div>
        <p className="mt-3 text-lg font-semibold">{avg !== null ? `Average score ${avg}%` : "Conversation complete"}</p>
        <div className="mt-4 flex justify-center gap-2">
          <button className="btn btn-primary" onClick={() => { setStep(0); setScores({}); }}><RotateCcw size={16} /> Play again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted" aria-live="polite">Line {step + 1} of {d.lines.length}</div>
      {d.lines.slice(0, step).map((l, i) => (
        <Bubble key={i} line={l}>
          <p className="han text-base">{l.zh}</p>
          {l.who === ME && scores[i] !== undefined && <div className="mt-1 text-xs text-muted">Score {scores[i]}%</div>}
        </Bubble>
      ))}
      {other ? (
        <Bubble line={other} active>
          <p className="han text-base">{other.zh}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted">
            Listening…
            <button className="btn btn-sm" onClick={() => setStep(step + 1)}>Skip <ArrowRight size={14} /></button>
          </div>
        </Bubble>
      ) : (
        <MyTurn
          key={step}
          line={line}
          speed={speed}
          onScore={(sc) => setScores((p) => ({ ...p, [step]: Math.max(p[step] ?? 0, sc) }))}
          onNext={() => setStep(step + 1)}
          dialogueId={d.id}
          index={step}
        />
      )}
    </div>
  );
}

function MyTurn({ line, speed, dialogueId, index, onScore, onNext }: {
  line: Line; speed: number; dialogueId: string; index: number; onScore: (s: number) => void; onNext: () => void;
}) {
  const rec = useRecognizer();
  const supported = recognitionSupported();
  const [result, setResult] = useState<{ cmp: Compared; said: string } | null>(null);
  const [reveal, setReveal] = useState(false);
  const scoredFor = useRef<string[] | null>(null);
  const onScoreRef = useRef(onScore);
  useEffect(() => { onScoreRef.current = onScore; }, [onScore]);

  useEffect(() => {
    // each set of recogniser results is scored exactly once
    if (rec.listening || !rec.alternatives.length || scoredFor.current === rec.alternatives) return;
    const alts = rec.alternatives;
    const best = alts.map((a) => ({ said: a, cmp: compareHanzi(line.zh, a) })).sort((a, b) => b.cmp.score - a.cmp.score)[0];
    const t = setTimeout(() => {
      scoredFor.current = alts;
      setResult(best);
      setReveal(true);
      onScoreRef.current(best.cmp.score);
      logPractice(1);
      if (best.cmp.score < 60) addMistake(`speak:d:${dialogueId}:${index}`, "sentence");
    }, 0);
    return () => clearTimeout(t);
  }, [rec.listening, rec.alternatives, line.zh, dialogueId, index]);

  const talk = () => { stopAll(); setResult(null); rec.reset(); rec.start(); };

  return (
    <Bubble line={line} active>
      <div className="space-y-3">
        <div className="eyebrow">Your turn — say this in Chinese</div>
        <p className="font-semibold">{line.en}</p>
        {reveal && (result ? <div><Marked result={result.cmp} size="text-xl" /></div> : <Annotated text={line.zh} size="text-lg" />)}
        {result && (
          <div className="space-y-1">
            <ScorePill score={result.cmp.score} />
            <div className="text-sm">I heard: <span className="han">{result.said || "—"}</span></div>
          </div>
        )}
        {!supported && (
          <p className="rounded-lg bg-gold-soft p-2 text-sm text-gold">
            Speech recognition isn&apos;t available in this browser, so there is no scoring. Say it aloud, reveal the Chinese and compare.
          </p>
        )}
        {rec.listening && <div className="han text-muted" aria-live="polite">{rec.interim || "Listening…"}</div>}
        {rec.error && <div className="text-sm text-accent">{rec.error}</div>}
        <div className="flex flex-wrap items-center gap-2">
          {supported && (rec.listening ? (
            <button className="btn btn-primary h-14 w-14 animate-pulse rounded-full p-0" onClick={rec.stop} aria-label="Stop listening"><Square size={22} /></button>
          ) : (
            <button className="btn btn-primary h-14 w-14 rounded-full p-0" onClick={talk} aria-label="Speak your line"><Mic size={26} /></button>
          ))}
          {!reveal && <button className="btn btn-sm" onClick={() => setReveal(true)}><Eye size={14} /> Show Chinese</button>}
          {reveal && <SpeakButton text={line.zh} rate={speed} label="Hear the model line" />}
          {result && <button className="btn btn-sm" onClick={talk}><RotateCcw size={14} /> Try again</button>}
          <button className="btn btn-sm ml-auto" onClick={() => { stopAll(); onNext(); }}>{result || !supported ? "Next" : "Skip"} <ArrowRight size={14} /></button>
        </div>
      </div>
    </Bubble>
  );
}

function Quiz({ d }: { d: Dialogue }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const qs = useMemo(() => d.questions.map((q, i) => ({ q: q.q, ...shuffleOptions(q.options, q.answer, d.id + i) })), [d]);
  const right = qs.filter((q, i) => answers[i] === q.answer).length;
  const pct = qs.length ? Math.round((right / qs.length) * 100) : 0;

  const check = () => {
    setChecked(true);
    saveDialogueScore(d.id, pct);
    logPractice(qs.length);
    qs.forEach((q, i) => { if (answers[i] !== q.answer) addMistake(`dlg:${d.id}:${i}`, "sentence"); });
  };

  return (
    <div className="card space-y-5 p-5">
      {qs.map((q, qi) => (
        <div key={qi}>
          <p className="han mb-2 font-semibold">{qi + 1}. {q.q}</p>
          <div className="grid gap-2">
            {q.options.map((o, oi) => {
              const state = checked ? (oi === q.answer ? "right" : answers[qi] === oi ? "wrong" : undefined) : answers[qi] === oi ? "picked" : undefined;
              return (
                <button key={oi} className="opt han text-left" data-state={state} disabled={checked} aria-pressed={answers[qi] === oi}
                  onClick={() => setAnswers((p) => ({ ...p, [qi]: oi }))}>
                  {o}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {checked ? (
        <div className="flex flex-wrap items-center gap-3">
          <ScorePill score={pct} />
          <button className="btn btn-sm" onClick={() => { setAnswers({}); setChecked(false); }}><RotateCcw size={14} /> Try again</button>
        </div>
      ) : (
        <button className="btn btn-primary" disabled={Object.keys(answers).length < qs.length} onClick={check}>Check answers</button>
      )}
    </div>
  );
}
