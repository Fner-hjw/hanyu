"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Eye, Layers, Sparkles } from "lucide-react";
import { levelLabel, loadLevel, loadSentences, sentenceAudio, useAsync, type Word } from "@/lib/data";
import { UNIT_SIZE, unitCount, unitWords } from "@/lib/units";
import { makeQuiz, type QuizQ } from "@/lib/quiz";
import { isKnown, markKnown, useAppState, useHydrated } from "@/lib/store";
import { Badge, Progress } from "@/components/ui";
import { SpeakButton } from "@/components/Speak";
import { Quiz } from "@/components/Quiz";
import { StatusBadge, WordSheet, wordStatus } from "@/components/WordSheet";

export default function UnitClient({ level, unit }: { level: number; unit: number }) {
  const hydrated = useHydrated();
  return hydrated ? <Unit level={level} unit={unit} /> : null;
}

function Unit({ level, unit }: { level: number; unit: number }) {
  const s = useAppState();
  const all = useAsync(() => loadLevel(level), [level]);
  const sents = useAsync(() => loadSentences(Math.min(level, 6)), [level]);
  const words = useMemo(() => (all.data ? unitWords(all.data, unit) : []), [all.data, unit]);
  const [open, setOpen] = useState<Word | null>(null);
  const [quiz, setQuiz] = useState<QuizQ[] | null>(null);
  const [showEn, setShowEn] = useState(false);
  const total = unitCount(level);

  const context = useMemo(() => {
    if (!sents.data || !words.length) return [];
    const set = new Set(words.map((w) => w.zh));
    return sents.data
      .filter((x) => x.k.some(([w]) => set.has(w)))
      .sort((a, b) => b.k.filter(([w]) => set.has(w)).length - a.k.filter(([w]) => set.has(w)).length || a.z.length - b.z.length)
      .slice(0, 8);
  }, [sents.data, words]);

  const known = words.filter((w) => s.known[w.id] || isKnown(s.cards[w.id])).length;
  const startQuiz = () => all.data && setQuiz(makeQuiz(words, all.data, Math.min(10, words.length), Date.now()));
  const unitSet = new Set(words.map((w) => w.zh));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm">
        <Link href="/learn" className="flex items-center gap-1 text-muted hover:text-fg"><ArrowLeft size={15} /> Path</Link>
        <div className="flex gap-2">
          {unit > 1 && <Link className="btn btn-sm" href={`/learn/${level}/${unit - 1}`}><ArrowLeft size={14} /> Unit {unit - 1}</Link>}
          {unit < total && <Link className="btn btn-sm" href={`/learn/${level}/${unit + 1}`}>Unit {unit + 1} <ArrowRight size={14} /></Link>}
        </div>
      </div>

      <header className="card p-5">
        <div className="eyebrow">{levelLabel(level)} · Unit {unit} of {total} · words {(unit - 1) * UNIT_SIZE + 1}–{(unit - 1) * UNIT_SIZE + words.length}</div>
        <h1 className="hanzi mt-1 text-3xl">{words.slice(0, 5).map((w) => w.zh).join("　")}</h1>
        <Progress className="mt-4" value={words.length ? (known / words.length) * 100 : 0} tone="good" />
        <div className="mt-1 text-xs text-muted">{known}/{words.length} mastered</div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/flashcards?deck=unit-${level}-${unit}`} className="btn btn-primary"><Layers size={16} /> Study with flashcards</Link>
          <button className="btn" onClick={startQuiz} disabled={!all.data}><Sparkles size={16} /> Quick quiz</button>
          <button className="btn" onClick={() => markKnown(words.map((w) => w.id))}><Check size={16} /> I know all of these</button>
        </div>
      </header>

      {quiz && (
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Quick quiz</h2><button className="text-sm text-muted underline" onClick={() => setQuiz(null)}>Close</button></div>
          <Quiz key={quiz.map((q) => q.word.id + q.kind).join()} questions={quiz} onRestart={startQuiz} />
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">1 · Meet the words</h2>
        <ul className="card divide-y divide-line overflow-hidden">
          {all.loading && <li className="p-4 text-muted">Loading…</li>}
          {words.map((w) => (
            <li key={w.id} role="button" tabIndex={0} onClick={() => setOpen(w)} onKeyDown={(e) => e.key === "Enter" && setOpen(w)}
              className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-card2">
              <span className="hanzi w-24 shrink-0 text-2xl">{w.zh}</span>
              <span className="min-w-0 flex-1"><span className="block text-sm text-accent">{w.py}</span><span className="block truncate">{w.en}</span></span>
              {w.pos[0] && <span className="hidden sm:inline"><Badge>{w.pos[0]}</Badge></span>}
              {wordStatus(s, w.id) !== "new" && <StatusBadge status={wordStatus(s, w.id)} />}
              <SpeakButton text={w.zh} rate={0.8} size="sm" />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">2 · In context</h2>
          <button className="btn btn-sm" onClick={() => setShowEn(!showEn)}><Eye size={14} /> {showEn ? "Hide" : "Show"} English</button>
        </div>
        {sents.loading ? <p className="text-muted">Loading sentences…</p> : context.length === 0 ? (
          <p className="card-flat p-4 text-sm text-muted">No graded sentences for this unit yet — open a word to see dictionary examples.</p>
        ) : (
          <div className="space-y-2">
            {context.map((x) => (
              <div key={x.id} className="card-flat flex items-start gap-3 p-3">
                <SpeakButton text={x.z} src={sentenceAudio(x.id)} size="sm" className="mt-1" />
                <div className="min-w-0">
                  <div className="han text-lg leading-relaxed">
                    {x.k.map(([w], j) => <span key={j} className={unitSet.has(w) ? "rounded bg-accent-soft px-0.5 text-accent" : ""}>{w}</span>)}
                    {/[。？！]$/.test(x.z) && !/[。？！]$/.test(x.k.map(([w]) => w).join("")) ? x.z.slice(-1) : ""}
                  </div>
                  <div className="text-xs text-muted">{x.p}</div>
                  {showEn && <div className="text-sm text-muted">{x.e}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card-flat flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <h2 className="font-semibold">3 · Make it stick</h2>
          <p className="text-sm text-muted">Spaced repetition brings each word back right before you&apos;d forget it.</p>
        </div>
        <Link href={`/flashcards?deck=unit-${level}-${unit}`} className="btn btn-primary"><Layers size={16} /> Flashcards</Link>
      </section>

      <WordSheet word={open} onClose={() => setOpen(null)} />
    </div>
  );
}
