"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { HSK_LEVELS, LEVEL_SIZES, levelLabel, loadLevel, useAsync } from "@/lib/data";
import { UNIT_SIZE, unitCount, unitWords } from "@/lib/units";
import { isKnown, updateSettings, useAppState, useHydrated } from "@/lib/store";
import { PageHeader, Progress } from "@/components/ui";

export default function LearnPage() {
  const hydrated = useHydrated();
  return hydrated ? <Path /> : null;
}

const BLURB: Record<number, string> = {
  1: "Survival basics: greetings, numbers, people, daily verbs.",
  2: "Everyday situations: shopping, time, transport, simple opinions.",
  3: "Talk about routines, plans and experiences in connected sentences.",
  4: "Discuss work, study and society; understand most daily conversations.",
  5: "Read news and reports, give presentations, negotiate.",
  6: "Fluent professional Chinese: abstract topics, formal writing.",
  7: "Advanced (HSK 7–9): academic, literary and specialised vocabulary.",
};

function Path() {
  const s = useAppState();
  const [level, setLevel] = useState<number>(() => {
    const m = /^hsk-(\d)$/.exec(s.settings.deck);
    return m ? +m[1] : 4;
  });
  const words = useAsync(() => loadLevel(level), [level]);
  const n = unitCount(level);
  const mastered = (id: string) => !!s.known[id] || isKnown(s.cards[id]);
  const units = Array.from({ length: n }, (_, i) => {
    const ws = words.data ? unitWords(words.data, i + 1) : [];
    const known = ws.filter((w) => mastered(w.id)).length;
    const started = ws.filter((w) => s.cards[w.id] || s.known[w.id]).length;
    return { unit: i + 1, ws, known, started, size: ws.length || UNIT_SIZE };
  });
  const next = units.find((u) => u.ws.length && u.known / u.size < 0.8);
  const levelKnown = units.reduce((a, u) => a + u.known, 0);

  return (
    <div>
      <PageHeader title="Learning path" subtitle="Each HSK level is split into units of 20 words. Learn the words, see them in real sentences, quiz yourself, then let spaced repetition keep them fresh." />
      <div className="noscroll -mx-1 mb-5 flex gap-2 overflow-x-auto px-1">
        {HSK_LEVELS.map((l) => (
          <button key={l} className="chip" data-active={level === l} onClick={() => { setLevel(l); updateSettings({ deck: `hsk-${l}` }); }}>{levelLabel(l)}</button>
        ))}
      </div>

      <section className="card mb-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="eyebrow">{levelLabel(level)} · {LEVEL_SIZES[level].toLocaleString()} words · {n} units</div>
            <p className="mt-1 text-lg font-semibold">{BLURB[level]}</p>
          </div>
          {next && <Link href={`/learn/${level}/${next.unit}`} className="btn btn-primary">Continue: Unit {next.unit} <ChevronRight size={16} /></Link>}
        </div>
        <Progress className="mt-4" value={(levelKnown / LEVEL_SIZES[level]) * 100} tone="good" />
        <div className="mt-1 text-xs text-muted">{levelKnown} of {LEVEL_SIZES[level].toLocaleString()} words mastered</div>
      </section>

      {words.loading ? <p className="text-muted">Loading units…</p> : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {units.map((u) => {
            const done = u.known / u.size >= 0.8;
            const isNext = next?.unit === u.unit;
            return (
              <Link key={u.unit} href={`/learn/${level}/${u.unit}`}
                className={`card group p-4 transition-transform hover:-translate-y-0.5 ${isNext ? "ring-2 ring-accent" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="eyebrow">Unit {u.unit}</span>
                  {done ? <CheckCircle2 size={18} className="text-good" /> : isNext ? <span className="text-xs font-semibold text-accent">Next</span> : null}
                </div>
                <div className="hanzi mt-2 truncate text-xl">{u.ws.slice(0, 4).map((w) => w.zh).join("·")}</div>
                <Progress className="mt-3" value={(u.known / u.size) * 100} tone={done ? "good" : "accent"} />
                <div className="mt-1 text-[0.7rem] text-muted">{u.known}/{u.size} mastered{u.started > u.known ? ` · ${u.started - u.known} learning` : ""}</div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
