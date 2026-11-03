"use client";

import { useState } from "react";
import { Check, Play, RotateCcw, X } from "lucide-react";
import { intToChinese, numberToChinese, percentToChinese, parseTyped } from "@/lib/numbers";
import { rng } from "@/lib/quiz";
import { speak } from "@/lib/audio";
import { logPractice } from "@/lib/store";
import { Progress } from "@/components/ui";

type Kind = "read" | "listen" | "wan";
type Q = { prompt: string; zh: string; answer: string; options?: string[]; value?: number; hint?: string };
const ROUND = 10;
const fmt = (n: number) => n.toLocaleString("en-US");

/** finance-flavoured random amounts: 3–4 significant digits at many magnitudes */
function amount(r: () => number): number {
  const mag = [3, 4, 5, 6, 7, 8, 9, 10][Math.floor(r() * 8)];
  const sig = Math.floor(10 + r() * 990);
  const n = sig * 10 ** Math.max(0, mag - String(sig).length);
  return r() < 0.25 ? n + Math.floor(r() * 9) + 1 : n; // sometimes a 零 inside
}

function makeRound(kind: Kind, seed: number): Q[] {
  const r = rng(seed);
  return Array.from({ length: ROUND }, (_, i) => {
    const style = i % 5; // 0-2 plain, 3 money, 4 percent
    if (kind === "wan") {
      const n = amount(r);
      const big = n >= 1e8;
      const unit = big ? "亿" : "万";
      const v = n / (big ? 1e8 : 1e4);
      const ans = Number.isInteger(v) ? String(v) : String(+v.toFixed(4));
      return { prompt: `${fmt(n)} = ? ${unit}`, zh: intToChinese(n), answer: ans, hint: `${unit} = ${big ? "100,000,000" : "10,000"}` };
    }
    if (style === 4) {
      const p = r() < 0.5 ? Math.floor(r() * 100) : +(r() * 30).toFixed(1);
      const zh = percentToChinese(p);
      return { prompt: `${p}%`, zh, answer: String(p), options: [zh, percentToChinese(+(p * 10).toFixed(1)), `${numberToChinese(p)}百分`, percentToChinese(p + 1)] };
    }
    const n = amount(r);
    const suffix = style === 3 ? "元" : "";
    const zh = intToChinese(n) + suffix;
    const wrong = [n * 10, Math.max(1, Math.floor(n / 10)), n * 100].filter((x) => x !== n).map((x) => intToChinese(x) + suffix);
    return { prompt: `${style === 3 ? "¥" : ""}${fmt(n)}`, zh, answer: String(n), value: n, options: [zh, ...wrong] };
  }).map((q, i) => {
    if (!q.options) return q;
    const rr = rng(seed + i);
    const opts = [...new Set(q.options)];
    for (let k = opts.length - 1; k > 0; k--) { const j = Math.floor(rr() * (k + 1)); [opts[k], opts[j]] = [opts[j], opts[k]]; }
    return { ...q, options: opts };
  });
}

export function NumbersTrainer() {
  const [kind, setKind] = useState<Kind>("read");
  const [qs, setQs] = useState<Q[] | null>(null);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [typed, setTyped] = useState("");

  const start = () => { setQs(makeRound(kind, Date.now())); setI(0); setScore(0); setPicked(null); setTyped(""); };
  const q = qs?.[i];

  if (!qs) {
    return (
      <div className="space-y-4">
        <div className="card-flat p-4 text-sm">
          <b>Why this matters:</b> Chinese groups digits by four — 万 (10,000) and 亿 (100,000,000) — so 23,500,000 is 两千三百五十万 (2,350 × 万). Even fluent speakers convert slowly; practise until it&apos;s automatic.
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {([["read", "Read it", "Pick the right Chinese for a figure"], ["listen", "Listen", "Hear an amount, type the number"], ["wan", "万 / 亿", "Convert figures into 万 and 亿"]] as const).map(([id, label, desc]) => (
            <button key={id} onClick={() => setKind(id)} className={`rounded-xl border p-4 text-left ${kind === id ? "border-accent bg-accent-soft" : "border-line hover:bg-card2"}`}>
              <div className="font-semibold">{label}</div><div className="text-sm text-muted">{desc}</div>
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={start}><Play size={16} /> Start {ROUND} questions</button>
      </div>
    );
  }

  if (!q) {
    return (
      <div className="card pop p-8 text-center">
        <div className="text-4xl font-bold">{score}/{qs.length}</div>
        <p className="text-muted">{score >= 8 ? "数字没问题！" : "Keep going — speed comes with repetition."}</p>
        <div className="mt-4 flex justify-center gap-2"><button className="btn btn-primary" onClick={start}><RotateCcw size={15} /> Again</button><button className="btn" onClick={() => setQs(null)}>Change drill</button></div>
      </div>
    );
  }

  const correct = picked !== null && (q.options ? picked === q.zh : parseTyped(picked) === parseTyped(q.answer));
  const submit = (val: string) => {
    if (picked !== null) return;
    setPicked(val);
    logPractice(1);
    if (q.options ? val === q.zh : parseTyped(val) === parseTyped(q.answer)) setScore((x) => x + 1);
    speak(q.zh, 0.85);
  };
  const next = () => { setI(i + 1); setPicked(null); setTyped(""); };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Progress value={(i / qs.length) * 100} />
      <div className="card flex flex-col items-center gap-3 p-6 text-center">
        {kind === "listen" ? (
          <button className="btn btn-primary h-16 w-16 rounded-full p-0" onClick={() => speak(q.zh, 0.85)} aria-label="Play the number"><Play size={26} /></button>
        ) : (
          <div className="text-3xl font-bold tracking-tight">{q.prompt}</div>
        )}
        {q.hint && <div className="text-xs text-muted">{q.hint}</div>}
        {picked !== null && <div className="pop han text-xl text-accent">{q.zh}</div>}
      </div>

      {kind === "read" && q.options && (
        <div className="grid gap-2">
          {q.options.map((o) => {
            const state = picked === null ? undefined : o === q.zh ? "right" : o === picked ? "wrong" : undefined;
            return <button key={o} className="opt han text-lg" data-state={state} disabled={picked !== null} onClick={() => submit(o)}>{o}</button>;
          })}
        </div>
      )}
      {(kind === "listen" || kind === "wan") && picked === null && (
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (typed.trim()) submit(typed); }}>
          <input className="input text-lg" inputMode="decimal" value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus
            placeholder={kind === "wan" ? "e.g. 2350" : kind === "listen" && q.prompt.endsWith("%") ? "e.g. 12.5" : "e.g. 23,500,000"} aria-label="Your answer" />
          <button className="btn btn-primary">Check</button>
        </form>
      )}
      {picked !== null && (
        <div className="pop flex items-center justify-between gap-3 rounded-xl bg-card2 p-3">
          <span className={`flex items-center gap-1 font-semibold ${correct ? "text-good" : "text-accent"}`}>
            {correct ? <Check size={18} /> : <X size={18} />}
            {correct ? "Correct" : kind === "read" ? "Watch the 万/亿 magnitude" : `Answer: ${kind === "wan" ? q.answer : q.prompt}`}
          </span>
          <button className="btn btn-primary btn-sm" onClick={next} autoFocus>{i + 1 >= qs.length ? "Finish" : "Next"}</button>
        </div>
      )}
    </div>
  );
}
