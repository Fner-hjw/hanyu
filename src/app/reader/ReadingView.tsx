"use client";

import { useMemo, useState } from "react";
import { Annotated } from "@/components/Annotated";
import { SpeakButton } from "@/components/Speak";
import { Badge } from "@/components/ui";
import { shuffleOptions } from "@/lib/shuffle";
import { addMistake, logPractice, saveReadingScore } from "@/lib/store";
import type { Reading } from "@/data/types";

const SIZES = ["text-lg", "text-xl", "text-2xl"] as const;

function Questions({ reading }: { reading: Reading }) {
  const items = useMemo(
    () => reading.questions.map((q, i) => ({ q: q.q, ...shuffleOptions(q.options, q.answer, reading.id + i) })),
    [reading],
  );
  const [picks, setPicks] = useState<(number | null)[]>(() => items.map(() => null));
  const [checked, setChecked] = useState(false);

  const allAnswered = picks.every((p) => p !== null);
  const correct = items.filter((it, i) => picks[i] === it.answer).length;
  const pct = Math.round((correct / items.length) * 100);

  function check() {
    if (checked || !allAnswered) return;
    setChecked(true);
    logPractice(items.length);
    items.forEach((it, i) => {
      if (picks[i] !== it.answer) addMistake("read:" + reading.id + ":" + i, "sentence");
    });
    saveReadingScore(reading.id, pct);
  }

  return (
    <section aria-labelledby="qs-h" className="space-y-4">
      <h2 id="qs-h" className="text-lg font-semibold">Comprehension</h2>
      {items.map((it, i) => (
        <div key={i} className="card space-y-2 p-4">
          <p className="han text-lg">{i + 1}. {it.q}</p>
          <div className="space-y-2" role="group" aria-label={`Question ${i + 1} options`}>
            {it.options.map((o, j) => {
              const state = checked
                ? j === it.answer ? "right" : picks[i] === j ? "wrong" : undefined
                : picks[i] === j ? "picked" : undefined;
              return (
                <button
                  key={j}
                  type="button"
                  className="opt han"
                  data-state={state}
                  disabled={checked}
                  aria-pressed={picks[i] === j}
                  onClick={() => setPicks((p) => p.map((v, k) => (k === i ? j : v)))}
                >
                  {o}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-primary" disabled={!allAnswered || checked} onClick={check}>Check answers</button>
        {checked && (
          <p className="font-semibold" role="status">
            Score: {correct} / {items.length} ({pct}%)
          </p>
        )}
      </div>
    </section>
  );
}

export function ReadingView({ reading, onBack }: { reading: Reading; onBack: () => void }) {
  const [showPy, setShowPy] = useState(reading.level <= 3);
  const [sizeIdx, setSizeIdx] = useState(1);
  const size = SIZES[sizeIdx];
  const paragraphs = reading.text.split("\n").filter((p) => p.trim());

  return (
    <div className="space-y-5">
      <button type="button" className="btn btn-sm" onClick={onBack}>← Library</button>
      <header className="space-y-1">
        <h2 className="hanzi text-2xl">{reading.titleZh}</h2>
        <p className="text-muted">{reading.title}</p>
        <div className="flex flex-wrap gap-1.5">
          <Badge>HSK {reading.level}</Badge>
          <Badge>{reading.genre}</Badge>
          {reading.work && <Badge>Work</Badge>}
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <SpeakButton text={paragraphs.join("。")} label="Read aloud" />
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={showPy} onChange={(e) => setShowPy(e.target.checked)} /> Show pinyin
        </label>
        <div className="flex items-center gap-1.5" role="group" aria-label="Font size">
          <button type="button" className="chip" aria-label="Smaller text" disabled={sizeIdx === 0} onClick={() => setSizeIdx((i) => Math.max(0, i - 1))}>A−</button>
          <button type="button" className="chip" aria-label="Larger text" disabled={sizeIdx === SIZES.length - 1} onClick={() => setSizeIdx((i) => Math.min(SIZES.length - 1, i + 1))}>A+</button>
        </div>
      </div>

      <article className="card space-y-3 p-4 sm:p-6" aria-label="Reading text">
        {paragraphs.map((p, i) => (
          <Annotated key={i} text={p} showPinyin={showPy} size={size} />
        ))}
      </article>

      {reading.glossary.length > 0 && (
        <section className="card-flat p-4" aria-labelledby="gl-h">
          <h2 id="gl-h" className="eyebrow mb-2">Glossary</h2>
          <ul className="grid gap-1 text-sm sm:grid-cols-2">
            {reading.glossary.map((g) => (
              <li key={g.zh}><span className="han text-base">{g.zh}</span> – <span className="text-muted">{g.en}</span></li>
            ))}
          </ul>
        </section>
      )}

      <Questions reading={reading} />
    </div>
  );
}
