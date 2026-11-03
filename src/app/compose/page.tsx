"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bot, CheckCircle2, RefreshCw, Sparkles } from "lucide-react";
import { Marked } from "@/components/Marked";
import { SpeakButton } from "@/components/Speak";
import { Badge, PageHeader } from "@/components/ui";
import { ALL_GRAMMAR } from "@/data/grammar-all";
import type { GrammarPoint } from "@/data/types";
import { AiError, chat, parseJson, useAiConfig } from "@/lib/ai";
import { compareHanzi, type Compared } from "@/lib/compare";
import { levelLabel, loadLevel, loadSentences, type Sentence, type Word } from "@/lib/data";
import { addMistake, logPractice, useAppState, useHydrated } from "@/lib/store";

type Mode = "word" | "pattern" | "translate";
type Task =
  | { mode: "word"; word: Word }
  | { mode: "pattern"; g: GrammarPoint }
  | { mode: "translate"; s: Sentence };
type AiFeedback = { verdict: "correct" | "almost" | "wrong"; corrected: string; explanation: string; alternative?: string };

const MODES: [Mode, string, string][] = [
  ["word", "Use a word", "Write your own sentence with a word from your level."],
  ["pattern", "Use a pattern", "Write a sentence with a grammar pattern."],
  ["translate", "Translate", "Put an English sentence into Chinese."],
];
const HAN = /[一-鿿]/g;
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export default function Compose() {
  return useHydrated() ? <Inner /> : null;
}

function Inner() {
  const s = useAppState();
  const deckLevel = /^hsk-(\d)$/.exec(s.settings.deck)?.[1];
  const [level, setLevel] = useState(Math.min(6, deckLevel ? +deckLevel : Math.max(1, s.settings.targetLevel - 1)));
  const [mode, setMode] = useState<Mode>("word");
  const [task, setTask] = useState<Task | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const cards = s.cards;

  // choose a task whenever the mode, level or round changes (random choice happens in the async callback, not in render)
  useEffect(() => {
    let live = true;
    (async () => {
      if (mode === "pattern") {
        const pool = ALL_GRAMMAR.filter((g) => g.level <= level && g.level >= Math.max(1, level - 2));
        return { mode, g: pick(pool.length ? pool : ALL_GRAMMAR) } as Task;
      }
      if (mode === "translate") {
        const ss = (await loadSentences(Math.min(6, level))).filter((x) => x.z.length >= 6 && x.z.length <= 24);
        return { mode, s: pick(ss) } as Task;
      }
      const words = (await loadLevel(level)).filter((w) => w.zh.length <= 4);
      const studied = words.filter((w) => cards[w.id]);
      return { mode, word: pick(studied.length >= 10 && Math.random() < 0.7 ? studied : words) } as Task;
    })().then(
      (t) => { if (live) { setTask(t); setLoadErr(null); } },
      (e) => { if (live) setLoadErr(e instanceof Error ? e.message : String(e)); },
    );
    return () => { live = false; };
    // cards are read once per round on purpose, so a review elsewhere doesn't swap the task
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, level, round]);

  return (
    <div className="max-w-3xl">
      <PageHeader title="Compose" subtitle="Write your own Chinese sentences and get them checked." />
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {MODES.map(([m, label]) => <button key={m} className="chip" data-active={mode === m} onClick={() => setMode(m)}>{label}</button>)}
        <select aria-label="Level" className="input ml-auto w-auto py-1 text-sm" value={level} onChange={(e) => setLevel(+e.target.value)}>
          {[1, 2, 3, 4, 5, 6].map((l) => <option key={l} value={l}>{levelLabel(l)}</option>)}
        </select>
      </div>
      {loadErr && <p className="text-accent">{loadErr}</p>}
      {task && task.mode === mode && <Exercise key={`${round}-${mode}-${level}`} task={task} level={level} onNext={() => setRound((r) => r + 1)} />}
    </div>
  );
}

function Exercise({ task, level, onNext }: { task: Task; level: number; onNext: () => void }) {
  const cfg = useAiConfig();
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [ai, setAi] = useState<AiFeedback | null>(null);
  const [aiRaw, setAiRaw] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiErr, setAiErr] = useState<string | null>(null);
  const [showEx, setShowEx] = useState(false);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);

  const a = answer.trim();
  const hanCount = (a.match(HAN) ?? []).length;
  const checks: { ok: boolean; text: string }[] = [];
  if (checked) {
    checks.push({ ok: hanCount >= 4, text: hanCount >= 4 ? "Written in Chinese characters" : "Write at least a short sentence in Chinese characters" });
    if (/[a-zA-Z]/.test(a)) checks.push({ ok: false, text: "Contains Latin letters: write it all in characters" });
    if (task.mode === "word") checks.push({ ok: a.includes(task.word.zh), text: a.includes(task.word.zh) ? `Uses ${task.word.zh}` : `Doesn't use ${task.word.zh} yet` });
  }
  const cmp: Compared | null = checked && task.mode === "translate" ? compareHanzi(task.s.z, a) : null;

  const instruction =
    task.mode === "word" ? `Write a sentence using the word ${task.word.zh} (${task.word.py}, "${task.word.en}").`
    : task.mode === "pattern" ? `Write a sentence using the grammar pattern "${task.g.pattern}" (${task.g.title}).`
    : `Translate into Chinese: "${task.s.e}"`;

  const askAi = async () => {
    if (!cfg) return;
    setAiBusy(true); setAiErr(null); setAi(null); setAiRaw("");
    abort.current = new AbortController();
    try {
      const out = await chat(cfg, {
        system: "You are a precise, encouraging Mandarin teacher. You check one sentence written by an English-speaking learner. Reply with JSON only.",
        messages: [{
          role: "user",
          content: `Learner level: about HSK ${level}.\nTask: ${instruction}${task.mode === "translate" ? `\nReference translation: ${task.s.z}` : ""}\nLearner's sentence: ${a}\n\n` +
            `Return one JSON object: {"verdict": "correct" | "almost" | "wrong", "corrected": the learner's sentence with the fewest changes that make it correct and natural (same as theirs if correct), ` +
            `"explanation": 1-3 short English sentences on what was wrong or what was good (mention the task requirement if they missed it), ` +
            `"alternative": another natural way a native speaker might say it}. Simplified characters only.`,
        }],
        effort: "medium",
        maxTokens: 3000,
        signal: abort.current.signal,
      });
      const j = parseJson<AiFeedback>(out);
      if (j) {
        setAi(j);
        if (j.verdict === "wrong" && task.mode === "word") addMistake(task.word.id, "word");
      } else setAiRaw(out);
    } catch (e) {
      setAiErr(e instanceof AiError ? e.message : String(e));
    }
    setAiBusy(false);
  };

  const check = () => {
    if (!a) return;
    setChecked(true);
    logPractice(1);
    if (cfg) void askAi();
  };

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="eyebrow mb-2">{MODES.find((m) => m[0] === task.mode)?.[2]}</div>
        {task.mode === "word" && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="han text-4xl">{task.word.zh}</span>
            <SpeakButton text={task.word.zh} />
            <span><span className="block text-muted">{task.word.py}</span><span className="block">{task.word.en}</span></span>
          </div>
        )}
        {task.mode === "pattern" && (
          <div>
            <div className="han text-2xl">{task.g.pattern}</div>
            <div className="mt-1 flex items-center gap-2"><span className="font-semibold">{task.g.title}</span><Badge tone="sky">HSK {task.g.level}</Badge></div>
            <p className="mt-2 text-sm text-muted">{task.g.explain}</p>
            <button className="mt-2 text-sm font-semibold text-accent" onClick={() => setShowEx(!showEx)}>{showEx ? "Hide example" : "Show an example"}</button>
            {showEx && task.g.examples[0] && <p className="mt-1 text-sm"><span className="han text-base">{task.g.examples[0].zh}</span> <span className="text-muted">{task.g.examples[0].en}</span></p>}
          </div>
        )}
        {task.mode === "translate" && <p className="text-xl font-medium">{task.s.e}</p>}
      </div>

      <div className="card p-3">
        <textarea value={answer} onChange={(e) => { setAnswer(e.target.value); if (checked) { setChecked(false); setAi(null); setAiRaw(""); } }}
          rows={2} lang="zh-CN" placeholder="写一个句子…" aria-label="Your sentence"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); check(); } }}
          className="han w-full resize-none bg-transparent px-2 py-2 text-2xl outline-none" />
        <div className="flex flex-wrap items-center gap-2 px-1">
          <button className="btn btn-primary btn-sm" disabled={!a || aiBusy} onClick={check}>Check</button>
          <button className="btn btn-sm" onClick={onNext}><RefreshCw size={14} /> Next</button>
          {!cfg && <span className="text-xs text-muted"><Bot size={13} className="mr-1 inline" /><Link href="/account" className="font-semibold text-accent">Connect your AI</Link> for detailed corrections.</span>}
        </div>
      </div>

      {checked && (
        <div className="card space-y-3 p-5">
          <ul className="space-y-1 text-sm">
            {checks.map((c) => <li key={c.text} className={c.ok ? "text-good" : "text-accent"}>{c.ok ? "✓" : "✗"} {c.text}</li>)}
          </ul>
          {task.mode === "translate" && cmp && (
            <div className="space-y-1">
              <div className="eyebrow">Reference translation, coloured by how much of it you matched ({cmp.score}%)</div>
              <div className="flex items-center gap-2"><Marked result={cmp} /><SpeakButton text={task.s.z} size="sm" /></div>
              <p className="text-xs text-muted">Other wordings can be just as correct{cfg ? "; see the AI's verdict below" : ""}.</p>
            </div>
          )}
          {aiBusy && <p className="flex items-center gap-2 text-sm text-muted"><Sparkles size={15} /> Checking with your AI…</p>}
          {aiErr && <p className="text-sm text-accent">{aiErr}</p>}
          {aiRaw && <p className="whitespace-pre-wrap text-sm">{aiRaw}</p>}
          {ai && (
            <div className="space-y-2 border-t border-line pt-3">
              <div className="flex items-center gap-2">
                <Badge tone={ai.verdict === "correct" ? "good" : ai.verdict === "almost" ? "gold" : "accent"}>
                  {ai.verdict === "correct" ? "Correct" : ai.verdict === "almost" ? "Almost" : "Needs work"}
                </Badge>
                {ai.verdict === "correct" && <CheckCircle2 size={16} className="text-good" />}
              </div>
              {ai.verdict !== "correct" && ai.corrected && (
                <div className="flex items-center gap-2"><span className="han text-xl">{ai.corrected}</span><SpeakButton text={ai.corrected} size="sm" /></div>
              )}
              <p className="text-sm">{ai.explanation}</p>
              {ai.alternative && ai.alternative !== ai.corrected && (
                <p className="text-sm text-muted">Also natural: <span className="han text-base text-fg">{ai.alternative}</span></p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
