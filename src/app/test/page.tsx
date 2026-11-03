"use client";

import { useState } from "react";
import { TEST, type TestQ } from "@/data/test";
import { SpeakButton } from "@/components/Speak";
import { saveTest, useAppState, type TestResult } from "@/lib/store";

const SECTION: Record<TestQ["section"], string> = { vocab: "Vocabulary", grammar: "Grammar", reading: "Reading", listening: "Listening" };
const ORDER: TestQ["section"][] = ["vocab", "grammar", "reading", "listening"];
const QS = ORDER.flatMap((s) => TEST.filter((q) => q.section === s));

function estimate(answers: Record<string, number>): TestResult {
  const bySection: TestResult["bySection"] = {};
  const byLevel: TestResult["byLevel"] = {};
  for (const q of QS) {
    const ok = answers[q.id] === q.answer ? 1 : 0;
    (bySection[q.section] ??= { correct: 0, total: 0 }).correct += ok;
    bySection[q.section].total++;
    (byLevel[q.level] ??= { correct: 0, total: 0 }).correct += ok;
    byLevel[q.level].total++;
  }
  let est = 2;
  for (const l of [3, 4, 5, 6]) {
    const r = byLevel[l];
    if (r && r.correct / r.total >= 0.6) est = l;
    else break;
  }
  return { date: new Date().toISOString(), estimated: est, bySection, byLevel };
}

export default function TestPage() {
  const s = useAppState();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<"intro" | "run" | "result">("intro");
  const [result, setResult] = useState<TestResult | null>(null);

  if (phase === "intro") {
    const last = s.tests[s.tests.length - 1];
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Level check</h1>
        <p>{QS.length} questions across vocabulary, grammar, reading and listening, spanning HSK 3 to 6. No speaking part yet.</p>
        <p className="text-sm text-muted">This is an indicative practice test, not an official HSK result. Listening plays through your browser&apos;s Chinese voice – use headphones in a quiet place.</p>
        {last && <p>Last result: <b>≈ HSK {last.estimated}</b> ({new Date(last.date).toLocaleDateString()})</p>}
        <button className="rounded-full bg-accent px-6 py-2 text-white" onClick={() => { setAnswers({}); setI(0); setPhase("run"); }}>Start test</button>
      </div>
    );
  }

  if (phase === "result" && result) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Your result</h1>
        <div className="rounded-2xl border border-line bg-card p-6 text-center">
          <div className="text-sm text-muted">Estimated level</div>
          <div className="text-5xl font-semibold text-accent">{result.estimated < 3 ? "< HSK 3" : `≈ HSK ${result.estimated}`}</div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-card p-4">
            <h2 className="mb-2 font-medium">By section</h2>
            {Object.entries(result.bySection).map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm"><span>{SECTION[k as TestQ["section"]]}</span><span>{v.correct}/{v.total}</span></div>
            ))}
          </div>
          <div className="rounded-xl border border-line bg-card p-4">
            <h2 className="mb-2 font-medium">By level</h2>
            {Object.entries(result.byLevel).map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm"><span>HSK {k}</span><span>{v.correct}/{v.total}</span></div>
            ))}
          </div>
        </div>
        <details className="rounded-xl border border-line bg-card p-4">
          <summary className="cursor-pointer font-medium">Review answers</summary>
          {QS.map((q) => (
            <div key={q.id} className="han mt-3 text-sm">
              <div className={answers[q.id] === q.answer ? "text-good" : "text-accent"}>{answers[q.id] === q.answer ? "✓" : "✗"} {q.prompt}</div>
              {q.text && <div className="text-muted">{q.text}</div>}
              <div>Answer: {q.options[q.answer]}</div>
            </div>
          ))}
        </details>
        <button className="rounded-full border border-line px-5 py-2" onClick={() => setPhase("intro")}>Back</button>
      </div>
    );
  }

  const q = QS[i];
  const finish = () => { const r = estimate(answers); saveTest(r); setResult(r); setPhase("result"); };
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-muted">
        <span>{SECTION[q.section]}</span><span>{i + 1}/{QS.length}</span>
      </div>
      <div className="h-1.5 rounded bg-line"><div className="h-1.5 rounded bg-accent" style={{ width: `${((i + 1) / QS.length) * 100}%` }} /></div>
      <div className="rounded-2xl border border-line bg-card p-5">
        {q.section === "listening" && (
          <div className="mb-3 flex items-center gap-3">
            <SpeakButton text={q.text!.replace(/[男女]：/g, "")} rate={0.85} className="!h-12 !w-12 !text-2xl" />
            <span className="text-sm text-muted">Tap to listen (as often as you like)</span>
          </div>
        )}
        {q.section === "reading" && <p className="han mb-3 rounded-lg bg-bg p-3 text-lg leading-relaxed">{q.text}</p>}
        <p className="han mb-3 text-lg">{q.prompt}</p>
        <div className="space-y-2">
          {q.options.map((o, oi) => (
            <button key={oi} onClick={() => setAnswers({ ...answers, [q.id]: oi })}
              className={`han block w-full rounded-lg border px-4 py-2 text-left ${answers[q.id] === oi ? "border-accent bg-accent-soft" : "border-line hover:bg-accent-soft"}`}>{o}</button>
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        <button disabled={i === 0} onClick={() => setI(i - 1)} className="rounded-full border border-line px-5 py-2 disabled:opacity-30">Back</button>
        {i < QS.length - 1 ? (
          <button onClick={() => setI(i + 1)} className="rounded-full bg-accent px-6 py-2 text-white">Next</button>
        ) : (
          <button onClick={finish} className="rounded-full bg-accent px-6 py-2 text-white">Finish</button>
        )}
      </div>
    </div>
  );
}
