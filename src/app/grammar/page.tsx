"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { ALL_GRAMMAR, GRAMMAR_CATEGORIES } from "@/data/grammar-all";
import type { GrammarPoint } from "@/data/types";
import { Annotated } from "@/components/Annotated";
import { SpeakButton } from "@/components/Speak";
import { PageHeader, Progress, Empty } from "@/components/ui";
import { shuffleOptions } from "@/lib/shuffle";
import { addMistake, clearMistake, logPractice, markGrammar, useAppState, useHydrated } from "@/lib/store";

const LEVELS = [1, 2, 3, 4, 5, 6] as const;

function Practice({ point }: { point: GrammarPoint }) {
  const [picked, setPicked] = useState<Record<number, number>>({});
  const shuffled = useMemo(
    () => point.exercises.map((ex, i) => shuffleOptions(ex.options, ex.answer, point.id + ":" + i)),
    [point],
  );

  const pick = (i: number, choice: number) => {
    if (picked[i] !== undefined) return;
    const next = { ...picked, [i]: choice };
    setPicked(next);
    logPractice(1);
    const key = `grammar:${point.id}:${i}`;
    if (choice === shuffled[i].answer) clearMistake(key);
    else addMistake(key, "grammar");
    if (point.exercises.every((_, k) => next[k] !== undefined)) markGrammar(point.id);
  };

  return (
    <div className="mt-5">
      <div className="eyebrow mb-2">Practice</div>
      <div className="space-y-4">
        {point.exercises.map((ex, i) => {
          const sh = shuffled[i];
          const p = picked[i];
          return (
            <div key={i} className="card-flat p-3">
              <div className="han mb-3 text-lg">{ex.prompt.replace(/___/g, "＿＿")}</div>
              <div className="flex flex-wrap gap-2">
                {sh.options.map((o, k) => {
                  const state = p === undefined ? undefined : k === sh.answer ? "right" : k === p ? "wrong" : undefined;
                  return (
                    <button key={k} type="button" disabled={p !== undefined} onClick={() => pick(i, k)} className="opt han" data-state={state}>
                      {o}
                    </button>
                  );
                })}
              </div>
              {p !== undefined && (
                <p className="mt-2 text-sm" role="status">
                  <span className={p === sh.answer ? "font-semibold text-good" : "font-semibold text-accent"}>
                    {p === sh.answer ? "✓ Correct. " : "✗ Not quite. "}
                  </span>
                  {ex.why}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function GrammarPage() {
  const hydrated = useHydrated();
  const s = useAppState();
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<number | null>(null);
  const [cat, setCat] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ALL_GRAMMAR.filter((g) => {
      if (level !== null && g.level !== level) return false;
      if (cat && g.category !== cat) return false;
      if (!needle) return true;
      const hay = [g.pattern, g.title, g.explain, ...g.examples.flatMap((e) => [e.zh, e.en])].join("\n").toLowerCase();
      return hay.includes(needle);
    });
  }, [q, level, cat]);

  if (!hydrated) return null;

  const total = ALL_GRAMMAR.length;
  const done = ALL_GRAMMAR.filter((g) => s.grammarDone[g.id]).length;

  return (
    <div>
      <PageHeader title="Grammar" subtitle={`${total} patterns from HSK 1 to 6 with examples and drills.`} />

      <div className="card mb-5 space-y-3 p-4">
        <input
          type="search"
          className="input w-full"
          placeholder="Search pattern, meaning or example"
          aria-label="Search grammar"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="noscroll -mx-1 flex gap-2 overflow-x-auto px-1" role="group" aria-label="Filter by level">
          <button type="button" className="chip shrink-0" data-active={level === null} onClick={() => setLevel(null)}>All</button>
          {LEVELS.map((l) => (
            <button key={l} type="button" className="chip shrink-0" data-active={level === l} onClick={() => setLevel(l)}>
              HSK {l}
            </button>
          ))}
        </div>
        <select className="input w-full" aria-label="Filter by category" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">All categories</option>
          {GRAMMAR_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <div>
          <div className="mb-1 text-sm text-muted">{done} studied of {total}</div>
          <Progress value={total ? (done / total) * 100 : 0} tone="good" />
        </div>
      </div>

      {filtered.length === 0 && <Empty title="No patterns match">Try a different search or filter.</Empty>}

      {LEVELS.map((l) => {
        const items = filtered.filter((g) => g.level === l);
        if (items.length === 0) return null;
        const lvDone = items.filter((g) => s.grammarDone[g.id]).length;
        return (
          <section key={l} className="mb-6">
            <h2 className="mb-2 flex items-baseline justify-between text-lg font-bold">
              <span>HSK {l}</span>
              <span className="text-sm font-normal text-muted">{lvDone}/{items.length} studied</span>
            </h2>
            <div className="space-y-3">
              {items.map((g) => {
                const isOpen = open === g.id;
                const studied = !!s.grammarDone[g.id];
                return (
                  <div key={g.id} className="card">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`panel-${g.id}`}
                      onClick={() => setOpen(isOpen ? null : g.id)}
                      className="flex w-full items-center gap-3 p-4 text-left"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="han break-words text-lg font-semibold">{g.pattern}</div>
                        <div className="text-sm text-muted">{g.title} · {g.category}</div>
                      </div>
                      {studied && <Check size={18} className="shrink-0 text-good" aria-label="Studied" />}
                      <ChevronDown size={18} className={`shrink-0 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden />
                    </button>
                    {isOpen && (
                      <div id={`panel-${g.id}`} className="border-t border-line p-4">
                        <p>{g.explain}</p>
                        {g.pitfalls && (
                          <div className="mt-3 rounded-xl bg-gold-soft p-3 text-sm">
                            <div className="eyebrow mb-1">Common mistake</div>
                            <p className="han">{g.pitfalls}</p>
                          </div>
                        )}
                        <div className="mt-4 space-y-3">
                          {g.examples.map((e, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <SpeakButton text={e.zh} />
                              <div className="min-w-0">
                                <Annotated text={e.zh} size="text-lg" />
                                <div className="text-sm text-muted">{e.en}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Practice point={g} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
