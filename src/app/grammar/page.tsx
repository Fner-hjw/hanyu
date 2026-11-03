"use client";

import { useState } from "react";
import { GRAMMAR } from "@/data/grammar";
import { Annotated } from "@/components/Annotated";
import { SpeakButton } from "@/components/Speak";
import { markGrammar, useAppState } from "@/lib/store";

export default function GrammarPage() {
  const s = useAppState();
  const [open, setOpen] = useState<string | null>(null);
  const [picked, setPicked] = useState<Record<string, number>>({});
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Grammar</h1>
      <p className="text-muted">Patterns that matter in professional Chinese. Do the mini-exercise to mark a point as studied.</p>
      {GRAMMAR.map((g) => {
        const isOpen = open === g.id;
        const p = picked[g.id];
        return (
          <div key={g.id} className="rounded-xl border border-line bg-card">
            <button onClick={() => setOpen(isOpen ? null : g.id)} className="flex w-full items-center justify-between p-4 text-left">
              <div>
                <div className="han text-lg font-medium">{g.pattern}</div>
                <div className="text-sm text-muted">{g.title} · ≈HSK {g.level}</div>
              </div>
              <span>{s.grammarDone[g.id] ? "✓" : isOpen ? "–" : "+"}</span>
            </button>
            {isOpen && (
              <div className="space-y-4 border-t border-line p-4">
                <p>{g.explain}</p>
                <div className="space-y-2">
                  {g.examples.map((e, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <SpeakButton text={e.zh} />
                      <div><Annotated text={e.zh} size="text-lg" /><div className="text-sm text-muted">{e.en}</div></div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-bg p-3">
                  <div className="han mb-2 text-lg">{g.exercise.prompt}</div>
                  <div className="flex flex-wrap gap-2">
                    {g.exercise.options.map((o, i) => (
                      <button key={i} disabled={p !== undefined}
                        onClick={() => { setPicked({ ...picked, [g.id]: i }); if (i === g.exercise.answer) markGrammar(g.id); }}
                        className={`han rounded-full border px-4 py-1 ${p !== undefined && i === g.exercise.answer ? "border-good bg-good/10" : p === i ? "border-accent bg-accent-soft" : "border-line"}`}>{o}</button>
                    ))}
                  </div>
                  {p !== undefined && <p className="mt-2 text-sm">{p === g.exercise.answer ? "✓ Correct. " : "✗ Not quite. "}{g.exercise.why}</p>}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
