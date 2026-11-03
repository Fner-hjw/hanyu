"use client";

import { useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import type { QuizQ } from "@/lib/quiz";
import { addMistake, clearMistake, logPractice } from "@/lib/store";
import { speak } from "@/lib/audio";
import { SpeakButton } from "./Speak";
import { Progress } from "./ui";

const PROMPT: Record<QuizQ["kind"], string> = {
  meaning: "What does this mean?",
  word: "Which word means…",
  listen: "Listen — which word did you hear?",
};

export function Quiz({ questions, onRestart, onDone }: { questions: QuizQ[]; onRestart?: () => void; onDone?: (score: number) => void }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<QuizQ[]>([]);
  const q = questions[i];

  if (!q) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="pop text-center">
        <div className="hanzi text-5xl text-accent">{pct >= 80 ? "很好！" : pct >= 50 ? "不错" : "加油！"}</div>
        <p className="mt-2 text-lg font-semibold">{score} / {questions.length} correct</p>
        {wrong.length > 0 && (
          <div className="mx-auto mt-4 max-w-sm text-left">
            <div className="eyebrow mb-1">Review these (added to Mistakes)</div>
            {wrong.map((w) => (
              <div key={w.word.id} className="flex items-center justify-between border-b border-line py-1.5 text-sm">
                <span className="hanzi text-lg">{w.word.zh}</span><span className="text-accent">{w.word.py}</span><span className="max-w-[45%] truncate text-muted">{w.word.en}</span>
              </div>
            ))}
          </div>
        )}
        {onRestart && <button className="btn mt-5" onClick={onRestart}><RotateCcw size={15} /> New quiz</button>}
      </div>
    );
  }

  const choose = (k: number) => {
    if (picked !== null) return;
    setPicked(k);
    logPractice(1);
    const ok = k === q.answer;
    if (ok) { setScore((x) => x + 1); clearMistake(q.word.id); }
    else { setWrong((w) => [...w, q]); addMistake(q.word.id, "word"); }
    if (q.kind !== "listen") speak(q.word.zh, 0.85);
  };
  const next = () => {
    const last = i + 1 >= questions.length;
    setI(i + 1);
    setPicked(null);
    if (last) onDone?.(score);
  };

  return (
    <div>
      <div className="mb-3 flex items-center gap-3 text-xs text-muted">
        <span>{i + 1}/{questions.length}</span>
        <Progress className="flex-1" value={(i / questions.length) * 100} />
      </div>
      <div className="eyebrow mb-2">{PROMPT[q.kind]}</div>
      <div className="mb-4 flex min-h-20 items-center justify-center gap-3 rounded-2xl bg-card2 p-4 text-center">
        {q.kind === "meaning" && <span className="hanzi text-5xl">{q.word.zh}</span>}
        {q.kind === "word" && <span className="text-xl font-semibold">{q.word.en}</span>}
        {q.kind === "listen" && <SpeakButton key={q.word.id} text={q.word.zh} rate={0.8} size="lg" />}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {q.options.map((o, k) => {
          const state = picked === null ? undefined : k === q.answer ? "right" : k === picked ? "wrong" : undefined;
          return (
            <button key={k} className={`opt ${q.kind === "meaning" ? "" : "hanzi text-xl"}`} data-state={state} disabled={picked !== null} onClick={() => choose(k)}>
              <span className="flex items-center justify-between gap-2">
                <span className="line-clamp-2">{o}</span>
                {state === "right" && <Check size={18} className="shrink-0 text-good" />}
                {state === "wrong" && <X size={18} className="shrink-0 text-accent" />}
              </span>
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="pop mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card2 p-3">
          <div><span className="hanzi text-2xl">{q.word.zh}</span> <span className="text-accent">{q.word.py}</span> <span className="text-sm text-muted">— {q.word.en}</span></div>
          <button className="btn btn-primary btn-sm" onClick={next} autoFocus>{i + 1 >= questions.length ? "See results" : "Next"}</button>
        </div>
      )}
    </div>
  );
}
