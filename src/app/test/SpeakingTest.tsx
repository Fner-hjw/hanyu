"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bot, Mic, Play, RotateCcw, Square, Timer } from "lucide-react";
import { Marked } from "@/components/Marked";
import { SpeakButton } from "@/components/Speak";
import { Badge, PageHeader, Progress } from "@/components/ui";
import { HSKK_ADV, HSKK_MID, type HskkQuestion } from "@/data/hskk";
import { READINGS } from "@/data/readings";
import { AiError, chat, parseJson, useAiConfig } from "@/lib/ai";
import { playUrl, stopAll } from "@/lib/audio";
import { compareHanzi } from "@/lib/compare";
import { loadSentences, sentenceAudio } from "@/lib/data";
import { recognitionSupported, useRecognizer } from "@/lib/speech";
import { logPractice, saveTest } from "@/lib/store";

type Tier = "mid" | "adv";
const TIERS: Record<Tier, { name: string; zh: string; levels: [number, number]; repeat: number; read: number; answerSecs: number; prepSecs: number }> = {
  mid: { name: "Intermediate", zh: "中级", levels: [3, 4], repeat: 6, read: 4, answerSecs: 90, prepSecs: 30 },
  adv: { name: "Advanced", zh: "高级", levels: [5, 6], repeat: 5, read: 5, answerSecs: 150, prepSecs: 45 },
};

type Repeat = { zh: string; en: string; audio: string };
type Paper = { tier: Tier; repeat: Repeat[]; read: string[]; questions: HskkQuestion[] };
type Answer = { q: HskkQuestion; text: string; secs: number };
type Step = { part: 1 | 2 | 3; i: number } | { part: "done" };

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const splitSentences = (t: string) => t.replace(/\n/g, "").match(/[^。！？]+[。！？]/g) ?? [t];

async function buildPaper(tier: Tier): Promise<Paper> {
  const t = TIERS[tier];
  const pool = (await Promise.all(t.levels.map(loadSentences))).flat();
  const [minLen, maxLen] = tier === "mid" ? [7, 16] : [12, 26];
  const fit = shuffle(pool.filter((s) => s.z.length >= minLen && s.z.length <= maxLen));
  const repeat = fit.slice(0, t.repeat).map((s) => ({ zh: s.z, en: s.e, audio: sentenceAudio(s.id) }));
  let read: string[];
  if (tier === "adv") {
    // a consecutive stretch of a workplace text, like the HSKK read-aloud passage
    const texts = shuffle(READINGS.filter((r) => r.level >= 5 && r.work));
    const sents = splitSentences(texts[0].text).filter((s) => s.length <= 40);
    const start = Math.floor(Math.random() * Math.max(1, sents.length - t.read));
    read = sents.slice(start, start + t.read);
  } else {
    read = fit.slice(t.repeat, t.repeat + t.read).map((s) => s.z);
  }
  return { tier, repeat, read, questions: shuffle(tier === "mid" ? HSKK_MID : HSKK_ADV).slice(0, 2) };
}

export function SpeakingTest({ onExit }: { onExit: () => void }) {
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>({ part: 1, i: 0 });
  const [scores, setScores] = useState<{ repeat: number[]; read: number[] }>({ repeat: [], read: [] });
  const [answers, setAnswers] = useState<Answer[]>([]);

  const start = async (tier: Tier) => {
    setLoading(true);
    setPaper(await buildPaper(tier));
    setStep({ part: 1, i: 0 });
    setScores({ repeat: [], read: [] });
    setAnswers([]);
    setLoading(false);
  };

  if (!recognitionSupported()) {
    return (
      <div className="card space-y-3 p-6">
        <p>The speaking test needs speech recognition, which this browser doesn&apos;t support. Try Chrome, Edge or Safari.</p>
        <button className="btn" onClick={onExit}>Back</button>
      </div>
    );
  }
  if (loading) return <p className="text-muted">Preparing your test…</p>;
  if (!paper) return <Intro onStart={start} onExit={onExit} />;

  const t = TIERS[paper.tier];
  const total = paper.repeat.length + paper.read.length + paper.questions.length;
  const done = step.part === "done" ? total : step.part === 1 ? step.i : step.part === 2 ? paper.repeat.length + step.i : paper.repeat.length + paper.read.length + step.i;

  if (step.part === "done") return <Results paper={paper} scores={scores} answers={answers} onAgain={() => setPaper(null)} onExit={onExit} />;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <button className="btn btn-sm" onClick={() => { stopAll(); onExit(); }}>Quit</button>
        <div className="flex-1"><Progress value={(done / total) * 100} /></div>
        <Badge>HSKK {t.name}</Badge>
      </div>
      {step.part === 1 && (
        <SpeakItem key={`r${step.i}`} heading={`Part 1 · Listen and repeat (${step.i + 1}/${paper.repeat.length})`}
          hint="Listen, then say the sentence exactly as you heard it. You can play it twice." target={paper.repeat[step.i].zh}
          audio={paper.repeat[step.i].audio} reveal={paper.repeat[step.i].en}
          onDone={(score) => {
            setScores((s) => ({ ...s, repeat: [...s.repeat, score] }));
            setStep(step.i + 1 < paper.repeat.length ? { part: 1, i: step.i + 1 } : { part: 2, i: 0 });
          }} />
      )}
      {step.part === 2 && (
        <SpeakItem key={`d${step.i}`} heading={`Part 2 · Read aloud (${step.i + 1}/${paper.read.length})`}
          hint="Read the sentence aloud clearly, at a natural speed." target={paper.read[step.i]} showText
          onDone={(score) => {
            setScores((s) => ({ ...s, read: [...s.read, score] }));
            setStep(step.i + 1 < paper.read.length ? { part: 2, i: step.i + 1 } : { part: 3, i: 0 });
          }} />
      )}
      {step.part === 3 && (
        <AnswerItem key={`q${step.i}`} heading={`Part 3 · Answer the question (${step.i + 1}/${paper.questions.length})`}
          q={paper.questions[step.i]} prepSecs={t.prepSecs} answerSecs={t.answerSecs}
          onDone={(a) => {
            setAnswers((x) => [...x, a]);
            setStep(step.i + 1 < paper.questions.length ? { part: 3, i: step.i + 1 } : { part: "done" });
          }} />
      )}
    </div>
  );
}

function Intro({ onStart, onExit }: { onStart: (t: Tier) => void; onExit: () => void }) {
  const cfg = useAiConfig();
  return (
    <div>
      <PageHeader title="Speaking test" subtitle="Modelled on the HSKK oral exam: listen and repeat, read aloud, then answer open questions. Use a quiet room and a microphone." />
      <div className="grid gap-4 md:grid-cols-2">
        {(Object.keys(TIERS) as Tier[]).map((k) => {
          const t = TIERS[k];
          return (
            <div key={k} className="card flex flex-col p-5">
              <div className="flex items-center gap-2"><h2 className="text-lg font-semibold">{t.name}</h2><span className="han text-muted">HSKK {t.zh}</span><Badge>HSK {t.levels[0]}–{t.levels[1]}</Badge></div>
              <ul className="mt-2 flex-1 list-disc space-y-1 pl-5 text-sm text-muted">
                <li>{t.repeat} sentences to listen to and repeat</li>
                <li>{t.read} sentences to read aloud{k === "adv" ? " from a workplace text" : ""}</li>
                <li>2 open questions, {Math.round(t.answerSecs / 60 * 10) / 10} minutes each, with {t.prepSecs} seconds to prepare</li>
              </ul>
              <button className="btn btn-primary mt-4 self-start" onClick={() => onStart(k)}><Play size={16} /> Start {t.name.toLowerCase()} test</button>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-muted">
        {cfg
          ? "Your connected AI will score the open answers for content, grammar and vocabulary."
          : <>Parts 1 and 2 are scored automatically. To get the open answers scored too, <Link href="/account" className="font-semibold text-accent">connect your AI</Link>; otherwise you&apos;ll see your transcript and speaking speed.</>}
      </p>
      <button className="btn mt-4" onClick={onExit}>Back to tests</button>
    </div>
  );
}

/** One listen-and-repeat or read-aloud item, scored against the target sentence. */
function SpeakItem({ heading, hint, target, audio, showText, reveal, onDone }: {
  heading: string; hint: string; target: string; audio?: string; showText?: boolean; reveal?: string; onDone: (score: number) => void;
}) {
  const rec = useRecognizer();
  const [plays, setPlays] = useState(0);
  const said = !rec.listening && rec.alternatives.length ? rec.alternatives : null;
  const best = said ? said.map((a) => compareHanzi(target, a)).sort((a, b) => b.score - a.score)[0] : null;
  useEffect(() => () => stopAll(), []);

  return (
    <div className="card space-y-4 p-6">
      <div><div className="eyebrow">{heading}</div><p className="mt-1 text-sm text-muted">{hint}</p></div>
      {audio && (
        <button className="btn" disabled={plays >= 2 || rec.listening} onClick={() => { setPlays((n) => n + 1); void playUrl(audio, target); }}>
          <Play size={16} /> {plays === 0 ? "Play" : plays === 1 ? "Play again" : "Played twice"}
        </button>
      )}
      {showText && <p className="han text-3xl leading-relaxed">{target}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => (rec.listening ? rec.stop() : (stopAll(), rec.reset(), rec.start({ target })))} disabled={!!audio && plays === 0}
          className={`flex h-14 w-14 items-center justify-center rounded-full ${rec.listening ? "bg-accent text-accent-fg" : "bg-accent-soft text-accent"} disabled:opacity-40`}
          aria-label={rec.listening ? "Stop" : "Start speaking"}>
          {rec.listening ? <Square size={20} /> : <Mic size={24} />}
        </button>
        <span className="han text-lg text-muted">{rec.listening ? rec.interim || "Listening…" : ""}</span>
      </div>
      {rec.error && <p className="text-sm text-accent">{rec.error}</p>}
      {best && (
        <div className="space-y-1">
          <Marked result={best} />
          {reveal && <p className="text-sm text-muted">{reveal}</p>}
          <p className="text-sm"><b>{best.score}%</b> match</p>
        </div>
      )}
      <div className="flex gap-2">
        {best && <button className="btn btn-sm" onClick={() => { rec.reset(); rec.start({ target }); }}><RotateCcw size={14} /> Try once more</button>}
        <button className="btn btn-primary btn-sm ml-auto" disabled={rec.listening} onClick={() => { logPractice(1); onDone(best?.score ?? 0); }}>
          {best ? "Next" : "Skip"}
        </button>
      </div>
    </div>
  );
}

/** Part 3: prepare, then speak for up to `answerSecs`; the transcript is kept for scoring. */
function AnswerItem({ heading, q, prepSecs, answerSecs, onDone }: {
  heading: string; q: HskkQuestion; prepSecs: number; answerSecs: number; onDone: (a: Answer) => void;
}) {
  const rec = useRecognizer();
  const [phase, setPhase] = useState<"prep" | "speak" | "review">("prep");
  const [left, setLeft] = useState(prepSecs);
  const [kept, setKept] = useState<string[]>([]);
  const startedAt = useRef(0);
  const [secs, setSecs] = useState(0);
  const [showEn, setShowEn] = useState(false);

  const current = rec.listening ? rec.interim : rec.alternatives[0] ?? "";
  const transcript = [...kept, current].filter(Boolean).join("");

  const beginSpeaking = () => {
    stopAll();
    setPhase("speak");
    setLeft(answerSecs);
    startedAt.current = Date.now();
    rec.reset();
    rec.start({ continuous: true });
  };
  const finish = () => {
    rec.stop();
    setSecs(Math.round((Date.now() - startedAt.current) / 1000));
    setPhase("review");
  };
  // keep listening if the recogniser stops on a long pause while time remains
  const resume = () => { setKept((k) => [...k, rec.alternatives[0] ?? ""]); rec.reset(); rec.start({ continuous: true }); };

  // countdown for preparation and answering; state changes happen in the timer callback
  useEffect(() => {
    if (phase === "review") return;
    const id = setInterval(() => setLeft((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(id);
  }, [phase]);
  const timeUp = left === 0 && phase !== "review";

  return (
    <div className="card space-y-4 p-6">
      <div className="eyebrow">{heading}</div>
      <div className="flex items-start gap-2">
        <p className="han flex-1 text-2xl leading-relaxed">{q.zh}</p>
        <SpeakButton text={q.zh} />
      </div>
      <button className="text-xs font-semibold text-muted" onClick={() => setShowEn(!showEn)}>{showEn ? q.en : "Show English"}</button>

      {phase === "prep" && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 text-sm"><Timer size={16} /> Prepare: <b>{left}s</b></span>
          <button className="btn btn-primary" onClick={beginSpeaking}><Mic size={16} /> {timeUp ? "Start answering" : "I'm ready"}</button>
        </div>
      )}
      {phase === "speak" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 text-sm"><Timer size={16} /> <b>{left}s</b> left</span>
            {rec.listening
              ? <Badge tone="accent">Listening</Badge>
              : !timeUp && <button className="btn btn-sm" onClick={resume}><Mic size={14} /> Keep talking</button>}
            <button className="btn btn-primary btn-sm ml-auto" onClick={finish}>{timeUp ? "Time's up – continue" : "I've finished"}</button>
          </div>
          <p className="han min-h-16 rounded-xl bg-card2 p-3 text-lg">{transcript || <span className="text-sm text-muted">Start speaking. Your words appear here.</span>}</p>
          {rec.error && <p className="text-sm text-accent">{rec.error}</p>}
        </div>
      )}
      {phase === "review" && (
        <div className="space-y-3">
          <p className="han rounded-xl bg-card2 p-3 text-lg">{transcript || <span className="text-sm text-muted">Nothing was recognised.</span>}</p>
          <button className="btn btn-primary btn-sm" onClick={() => { logPractice(1); onDone({ q, text: transcript, secs }); }}>Next</button>
        </div>
      )}
    </div>
  );
}

/* ---------- results ---------- */

type AiScore = { score: number; content: string; language: string; better: string };

function Results({ paper, scores, answers, onAgain, onExit }: {
  paper: Paper; scores: { repeat: number[]; read: number[] }; answers: Answer[]; onAgain: () => void; onExit: () => void;
}) {
  const cfg = useAiConfig();
  const avg = (a: number[]) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0);
  const rep = avg(scores.repeat);
  const read = avg(scores.read);
  const [ai, setAi] = useState<AiScore[] | null>(null);
  const [aiErr, setAiErr] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState(!!cfg);
  const saved = useRef(false);
  const t = TIERS[paper.tier];

  useEffect(() => {
    if (!cfg) return;
    const ctrl = new AbortController();
    const body = answers.map((a, i) => `Q${i + 1}: ${a.q.zh}\nA${i + 1} (spoken for ${a.secs}s, speech-recognition transcript): ${a.text || "(nothing recognised)"}`).join("\n\n");
    chat(cfg, {
      system: "You are an HSKK oral examiner. Score spoken answers fairly; the transcript comes from speech recognition, so ignore punctuation and allow for obvious homophone errors. Reply with JSON only.",
      messages: [{
        role: "user",
        content: `HSKK ${t.name} (HSK ${t.levels[0]}–${t.levels[1]}). Expected answer length about ${t.answerSecs} seconds.\n\n${body}\n\n` +
          `Return {"answers": [{"score": 0-100 by HSKK standards (relevance and content, fluency and length, grammar, vocabulary range), "content": one English sentence on content and length, "language": one English sentence on the most important grammar or vocabulary issue, "better": one improved Chinese sentence based on what they said}]} with one entry per answer, in order.`,
      }],
      effort: "medium",
      maxTokens: 4000,
      signal: ctrl.signal,
    }).then(
      (out) => { const j = parseJson<{ answers: AiScore[] }>(out); if (j?.answers) setAi(j.answers); else setAiErr("The AI's reply couldn't be read. Try again later."); setAiBusy(false); },
      (e) => { if (!ctrl.signal.aborted) { setAiErr(e instanceof AiError ? e.message : String(e)); setAiBusy(false); } },
    );
    return () => ctrl.abort();
  }, [cfg, answers, t]);

  const answerScore = ai ? avg(ai.map((x) => Math.max(0, Math.min(100, Math.round(x.score))))) : null;
  const parts = [rep, read, ...(answerScore !== null ? [answerScore] : [])];
  const overall = avg(parts);
  const ready = !aiBusy;

  // save once the final score is known
  useEffect(() => {
    if (!ready || saved.current) return;
    saved.current = true;
    const bySection: Record<string, { correct: number; total: number }> = {
      "listen & repeat": { correct: rep, total: 100 },
      "read aloud": { correct: read, total: 100 },
    };
    if (answerScore !== null) bySection["answer questions"] = { correct: answerScore, total: 100 };
    saveTest({ date: new Date().toISOString(), kind: "speaking", estimated: overall >= 60 ? t.levels[1] : t.levels[0] - 1, bySection, byLevel: {} });
  }, [ready, rep, read, answerScore, overall, t]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="card p-8 text-center">
        <div className="eyebrow">HSKK {t.name} · speaking score</div>
        <div className="mt-1 text-5xl font-bold text-accent">{ready ? overall : "…"}</div>
        {ready && <p className="mt-2 text-sm text-muted">{overall >= 60 ? `A pass at this tier (60+). Well done!` : "Below the 60 pass mark at this tier. Keep practising: Speak and Talk are the best training."}{answerScore === null ? " Open answers weren't scored." : ""}</p>}
      </div>
      <div className="card space-y-2 p-5 text-sm">
        <Row label="Listen and repeat" value={rep} />
        <Row label="Read aloud" value={read} />
        <Row label="Answer questions" value={answerScore} pending={aiBusy} />
      </div>
      <div className="card space-y-4 p-5">
        <div className="eyebrow">Your answers</div>
        {aiErr && <p className="text-sm text-accent">{aiErr}</p>}
        {!cfg && <p className="text-sm text-muted"><Bot size={14} className="mr-1 inline" /><Link href="/account" className="font-semibold text-accent">Connect your AI</Link> to have these scored.</p>}
        {answers.map((a, i) => {
          const chars = (a.text.match(/[一-鿿]/g) ?? []).length;
          const s = ai?.[i];
          return (
            <div key={i} className="space-y-1.5 border-t border-line pt-3 first:border-0 first:pt-0">
              <p className="han font-medium">{a.q.zh}</p>
              <p className="han rounded-xl bg-card2 p-3">{a.text || <span className="text-muted">Nothing recognised.</span>}</p>
              <p className="text-xs text-muted">{chars} characters in {a.secs}s{a.secs >= 10 ? ` · ${Math.round((chars / a.secs) * 60)} characters per minute (natural speech is about 180–240)` : ""}</p>
              {s && (
                <div className="text-sm">
                  <Badge tone={s.score >= 60 ? "good" : "accent"}>{Math.round(s.score)}</Badge> {s.content} {s.language}
                  {s.better && <div className="mt-1 flex items-center gap-2"><span className="han text-base">{s.better}</span><SpeakButton text={s.better} size="sm" /></div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-center gap-2">
        <button className="btn btn-primary" onClick={onAgain}>Take another test</button>
        <button className="btn" onClick={onExit}>Back to tests</button>
      </div>
    </div>
  );
}

function Row({ label, value, pending }: { label: string; value: number | null; pending?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-36">{label}</span>
      <Progress className="flex-1" value={value ?? 0} tone={value !== null && value >= 60 ? "good" : "accent"} />
      <span className="w-14 text-right font-semibold">{pending ? "…" : value === null ? "—" : value}</span>
    </div>
  );
}
