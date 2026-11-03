"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Compass, Play, Volume2 } from "lucide-react";
import { buildBlock, buildExam, estimateFrom, nextStep, type ExamQ, type Section } from "@/lib/exam";
import { playUrl, speak, stopAll } from "@/lib/audio";
import { sentenceAudio } from "@/lib/data";
import { addMistake, clearMistake, logPractice, saveTest, useAppState, useHydrated, type TestResult } from "@/lib/store";
import { Badge, PageHeader, Progress } from "@/components/ui";

const SECTION_LABEL: Record<Section, string> = { listening: "Listening", vocabulary: "Vocabulary", grammar: "Grammar", reading: "Reading" };

export default function TestPage() {
  const hydrated = useHydrated();
  return hydrated ? <Tests /> : null;
}

type Phase =
  | { kind: "home" }
  | { kind: "loading" }
  | { kind: "exam"; level: number; qs: ExamQ[] }
  | { kind: "examDone"; level: number; qs: ExamQ[]; picks: number[] }
  | { kind: "place"; level: number; block: number; qs: ExamQ[]; passed: Set<number>; history: { level: number; correct: number }[]; seed: number }
  | { kind: "placeDone"; estimate: number; history: { level: number; correct: number }[] };

function Tests() {
  const s = useAppState();
  const [phase, setPhase] = useState<Phase>({ kind: "home" });
  const [examLevel, setExamLevel] = useState(4);
  const last = s.tests[s.tests.length - 1];

  const startExam = async () => {
    setPhase({ kind: "loading" });
    const qs = await buildExam(examLevel, Date.now());
    setPhase({ kind: "exam", level: examLevel, qs });
  };
  const startPlacement = async () => {
    setPhase({ kind: "loading" });
    const seed = Date.now();
    setPhase({ kind: "place", level: 3, block: 1, qs: await buildBlock(3, seed), passed: new Set(), history: [], seed });
  };

  if (phase.kind === "loading") return <p className="text-muted">Preparing questions…</p>;

  if (phase.kind === "exam") {
    return <Runner key={phase.qs[0]?.id} title={`HSK ${phase.level} mock exam`} qs={phase.qs} onFinish={(picks) => {
      record(phase.qs, picks);
      saveTest(summarise(phase.qs, picks, phase.level));
      setPhase({ kind: "examDone", level: phase.level, qs: phase.qs, picks });
    }} onQuit={() => setPhase({ kind: "home" })} />;
  }
  if (phase.kind === "examDone") return <ExamResult {...phase} onBack={() => setPhase({ kind: "home" })} />;

  if (phase.kind === "place") {
    return <Runner key={`${phase.seed}-${phase.block}`} title={`Placement · block ${phase.block}`} subtitle={`Questions at HSK ${phase.level}`} qs={phase.qs} onFinish={async (picks) => {
      record(phase.qs, picks);
      const correct = phase.qs.filter((q, i) => picks[i] === q.answer).length;
      const history = [...phase.history, { level: phase.level, correct }];
      const step = nextStep(phase.level, correct, phase.passed, phase.block);
      if (step.next === null) {
        const estimate = estimateFrom(step.passed);
        const byLevel: TestResult["byLevel"] = {};
        history.forEach((h) => { const b = (byLevel[h.level] ??= { correct: 0, total: 0 }); b.correct += h.correct; b.total += 6; });
        saveTest({ date: new Date().toISOString(), estimated: estimate, bySection: {}, byLevel });
        setPhase({ kind: "placeDone", estimate, history });
      } else {
        setPhase({ kind: "loading" });
        const qs = await buildBlock(step.next, phase.seed + phase.block * 97);
        setPhase({ kind: "place", level: step.next, block: phase.block + 1, qs, passed: step.passed, history, seed: phase.seed });
      }
    }} onQuit={() => setPhase({ kind: "home" })} />;
  }
  if (phase.kind === "placeDone") {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <div className="card pop p-8 text-center">
          <div className="eyebrow">Estimated level</div>
          <div className="mt-1 text-5xl font-bold text-accent">{phase.estimate ? `≈ HSK ${phase.estimate}` : "Below HSK 1"}</div>
          <p className="mt-3 text-sm text-muted">Indicative only — official HSK exams are longer and include writing{phase.estimate >= 3 ? " and, for HSKK, speaking" : ""}.</p>
        </div>
        <div className="card p-4">
          <div className="eyebrow mb-2">How you did</div>
          {phase.history.map((h, i) => (
            <div key={i} className="flex items-center gap-3 py-1 text-sm"><span className="w-16">HSK {h.level}</span><Progress className="flex-1" value={(h.correct / 6) * 100} tone={h.correct >= 4 ? "good" : "accent"} /><span className="w-10 text-right">{h.correct}/6</span></div>
          ))}
        </div>
        <div className="flex justify-center gap-2">
          {phase.estimate >= 1 && <button className="btn btn-primary" onClick={() => { setExamLevel(Math.min(6, phase.estimate + 1)); setPhase({ kind: "home" }); }}>Try the HSK {Math.min(6, phase.estimate + 1)} mock exam</button>}
          <button className="btn" onClick={() => setPhase({ kind: "home" })}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Tests" subtitle="Find your level, then practise full mock exams. Every test is generated fresh from thousands of real sentences, so retakes are never the same." />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card flex flex-col p-5">
          <Compass className="text-accent" />
          <h2 className="mt-2 text-lg font-semibold">Adaptive placement</h2>
          <p className="mt-1 flex-1 text-sm text-muted">Starts at HSK 3 and moves up or down in blocks of six questions — listening, vocabulary, grammar and reading — until it finds your level. About 5–10 minutes.</p>
          {last && <p className="mt-3 text-sm">Last result: <b className="text-accent">{last.estimated ? `≈ HSK ${last.estimated}` : "below HSK 1"}</b> · {new Date(last.date).toLocaleDateString()}</p>}
          <button className="btn btn-primary mt-4 self-start" onClick={() => void startPlacement()}><Play size={16} /> Start placement</button>
        </div>
        <div className="card flex flex-col p-5">
          <ClipboardCheck className="text-accent" />
          <h2 className="mt-2 text-lg font-semibold">Mock exam</h2>
          <p className="mt-1 flex-1 text-sm text-muted">About 30 questions in the HSK format: listening with real audio, vocabulary, grammar, cloze and a reading passage. Pass mark 60%. Allow ~25 minutes.</p>
          <div className="mt-3 flex flex-wrap gap-2">{[1, 2, 3, 4, 5, 6].map((l) => <button key={l} className="chip" data-active={examLevel === l} onClick={() => setExamLevel(l)}>HSK {l}</button>)}</div>
          <button className="btn btn-primary mt-4 self-start" onClick={() => void startExam()}><Play size={16} /> Start HSK {examLevel} exam</button>
        </div>
      </div>
      {s.tests.length > 0 && (
        <div className="card mt-4 p-4">
          <div className="eyebrow mb-2">History</div>
          <ul className="divide-y divide-line text-sm">
            {[...s.tests].reverse().slice(0, 8).map((t, i) => (
              <li key={i} className="flex justify-between py-1.5"><span>{new Date(t.date).toLocaleDateString()}</span><span>{Object.keys(t.bySection).length ? "Mock exam" : "Placement"}</span><b>{t.estimated ? `HSK ${t.estimated}` : "—"}</b></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function record(qs: ExamQ[], picks: number[]) {
  logPractice(qs.length);
  qs.forEach((q, i) => {
    if (!q.mistake) return;
    if (picks[i] === q.answer) clearMistake(q.mistake.key); else addMistake(q.mistake.key, q.mistake.kind);
  });
}

function summarise(qs: ExamQ[], picks: number[], level: number): TestResult {
  const bySection: TestResult["bySection"] = {};
  qs.forEach((q, i) => { const b = (bySection[q.section] ??= { correct: 0, total: 0 }); b.total++; if (picks[i] === q.answer) b.correct++; });
  const correct = qs.filter((q, i) => picks[i] === q.answer).length;
  return { date: new Date().toISOString(), estimated: correct / qs.length >= 0.6 ? level : Math.max(0, level - 1), bySection, byLevel: { [level]: { correct, total: qs.length } } };
}

function Runner({ title, subtitle, qs, onFinish, onQuit }: { title: string; subtitle?: string; qs: ExamQ[]; onFinish: (picks: number[]) => void; onQuit: () => void }) {
  const [i, setI] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const q = qs[i];
  useEffect(() => () => stopAll(), []);
  if (!q) return null;
  const sectionStart = i === 0 || qs[i - 1].section !== q.section;
  const choose = (k: number) => { const p = [...picks]; p[i] = k; setPicks(p); };
  const next = () => { stopAll(); if (i + 1 >= qs.length) onFinish(picks); else setI(i + 1); };
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-2 flex items-center gap-3 text-sm">
        <button onClick={() => { stopAll(); onQuit(); }} className="text-muted hover:text-fg">← Quit</button>
        <span className="font-semibold">{title}</span>
        <span className="ml-auto text-muted">{i + 1}/{qs.length}</span>
      </div>
      {subtitle && <div className="mb-2 text-xs text-muted">{subtitle}</div>}
      <Progress value={(i / qs.length) * 100} className="mb-4" />
      <div className="card space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Badge tone={sectionStart ? "accent" : "muted"}>{SECTION_LABEL[q.section]}</Badge>
          {q.section === "listening" && <span className="text-xs text-muted">You may replay the audio</span>}
        </div>
        {q.audio && <AudioPrompt key={q.id} audio={q.audio} />}
        {q.passage && <div className="han max-h-72 overflow-y-auto rounded-xl bg-card2 p-4 text-[1.05rem] leading-relaxed">{q.passage.split("\n").map((p, k) => <p key={k} className="mb-2">{p}</p>)}</div>}
        <p className={q.optionsHan || q.section !== "vocabulary" ? "han text-lg" : "text-lg"}>{q.prompt}</p>
        <div className="grid gap-2">
          {q.options.map((o, k) => (
            <button key={k} className={`opt ${q.optionsHan ? "han text-[1.05rem]" : ""}`} data-state={picks[i] === k ? "picked" : undefined} onClick={() => choose(k)}>{o}</button>
          ))}
        </div>
        <div className="flex justify-end"><button className="btn btn-primary" disabled={picks[i] === undefined} onClick={next}>{i + 1 >= qs.length ? "Finish" : "Next"}</button></div>
      </div>
    </div>
  );
}

function AudioPrompt({ audio }: { audio: { sentence?: string; text: string } }) {
  const play = () => (audio.sentence ? playUrl(sentenceAudio(audio.sentence), audio.text) : speak(audio.text, 0.9));
  useEffect(() => {
    const t = setTimeout(() => void (audio.sentence ? playUrl(sentenceAudio(audio.sentence), audio.text) : speak(audio.text, 0.9)), 300);
    return () => clearTimeout(t);
  }, [audio]);
  return <button className="btn" onClick={() => void play()}><Volume2 size={16} /> Play audio</button>;
}

function ExamResult({ level, qs, picks, onBack }: { level: number; qs: ExamQ[]; picks: number[]; onBack: () => void }) {
  const correct = qs.filter((q, i) => picks[i] === q.answer).length;
  const pct = Math.round((correct / qs.length) * 100);
  const sections = useMemo(() => {
    const m = new Map<Section, { c: number; t: number }>();
    qs.forEach((q, i) => { const x = m.get(q.section) ?? { c: 0, t: 0 }; x.t++; if (picks[i] === q.answer) x.c++; m.set(q.section, x); });
    return [...m];
  }, [qs, picks]);
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="card pop p-6 text-center">
        <div className="eyebrow">HSK {level} mock exam</div>
        <div className={`mt-1 text-5xl font-bold ${pct >= 60 ? "text-good" : "text-accent"}`}>{pct}%</div>
        <p className="mt-1 font-semibold">{pct >= 60 ? "Pass — 合格！" : "Not yet — 60% is the pass mark"}</p>
      </div>
      <div className="card space-y-2 p-4">
        {sections.map(([sec, x]) => (
          <div key={sec} className="flex items-center gap-3 text-sm"><span className="w-24">{SECTION_LABEL[sec]}</span><Progress className="flex-1" value={(x.c / x.t) * 100} tone={x.c / x.t >= 0.6 ? "good" : "accent"} /><span className="w-12 text-right">{x.c}/{x.t}</span></div>
        ))}
      </div>
      <details className="card p-4" open={pct < 60}>
        <summary className="cursor-pointer font-semibold">Review answers ({qs.length - correct} wrong — added to Mistakes)</summary>
        <ul className="mt-3 space-y-3">
          {qs.map((q, i) => {
            const ok = picks[i] === q.answer;
            return (
              <li key={q.id} className="border-b border-line pb-3 text-sm last:border-0">
                <div className={ok ? "text-good" : "text-accent"}>{ok ? "✓" : "✗"} <span className="han">{q.prompt}</span></div>
                {!ok && <div className="han mt-0.5">Your answer: {q.options[picks[i]] ?? "—"} · Correct: <b>{q.options[q.answer]}</b></div>}
                {q.explain && <div className="han mt-0.5 text-muted">{q.explain}</div>}
              </li>
            );
          })}
        </ul>
      </details>
      <div className="flex justify-center"><button className="btn btn-primary" onClick={onBack}>Back to tests</button></div>
    </div>
  );
}
