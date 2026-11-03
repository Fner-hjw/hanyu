"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Layers, Trash2 } from "lucide-react";
import { resolveMistakes, type ResolvedMistake } from "@/lib/mistakes";
import { sentenceAudio, useAsync, type Word } from "@/lib/data";
import { clearMistake, useAppState, useHydrated } from "@/lib/store";
import { Badge, Empty, PageHeader, plural } from "@/components/ui";
import { SpeakButton } from "@/components/Speak";
import { WordSheet } from "@/components/WordSheet";

const GROUPS: { type: ResolvedMistake["type"]; title: string; desc: string }[] = [
  { type: "word", title: "Words", desc: "Missed in flashcards, quizzes, tests and games" },
  { type: "sentence", title: "Sentences", desc: "Listening, speaking and sentence building" },
  { type: "question", title: "Questions", desc: "Grammar drills, readings and dialogue quizzes" },
  { type: "char", title: "Characters", desc: "Written from memory below 60%" },
];

export default function MistakesPage() {
  const hydrated = useHydrated();
  return hydrated ? <Mistakes /> : null;
}

function Mistakes() {
  const s = useAppState();
  const keys = Object.keys(s.mistakes).sort().join("|");
  const data = useAsync(() => resolveMistakes(s), [keys]);
  const [open, setOpen] = useState<Word | null>(null);
  const items = (data.data ?? []).filter((m) => s.mistakes[m.key]).map((m) => ({ ...m, count: s.mistakes[m.key].count }));
  const words = items.filter((m) => m.type === "word");

  return (
    <div>
      <PageHeader title="Mistakes" subtitle="Everything you got wrong, in one place. Items leave the list automatically when you get them right later — or clear them yourself."
        actions={words.length > 0 ? <Link href="/flashcards?deck=mistakes" className="btn btn-primary"><Layers size={16} /> Review {plural(words.length, "word")}</Link> : undefined} />
      {data.loading && <p className="text-muted">Loading…</p>}
      {!data.loading && items.length === 0 && <Empty title="No open mistakes">Nice — keep practising and anything you miss will show up here.</Empty>}
      <div className="space-y-6">
        {GROUPS.map((g) => {
          const list = items.filter((m) => m.type === g.type);
          if (!list.length) return null;
          return (
            <section key={g.type}>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-semibold">{g.title} <span className="text-sm font-normal text-muted">· {list.length}</span></h2>
                <span className="hidden text-xs text-muted sm:inline">{g.desc}</span>
              </div>
              <ul className="card divide-y divide-line overflow-hidden">
                {list.map((m) => <Row key={m.key} m={m} onOpen={setOpen} />)}
              </ul>
            </section>
          );
        })}
      </div>
      <WordSheet word={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function Row({ m, onOpen }: { m: ResolvedMistake; onOpen: (w: Word) => void }) {
  const [reveal, setReveal] = useState(false);
  const times = <Badge tone={m.count >= 3 ? "accent" : "muted"}>{m.count}× missed</Badge>;
  const clear = <button className="rounded-full p-2 text-muted hover:bg-accent-soft hover:text-fg" aria-label="Clear this mistake" title="I've got it now" onClick={() => clearMistake(m.key)}><Trash2 size={16} /></button>;
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      {m.type === "word" && (
        <>
          <SpeakButton text={m.word.zh} size="sm" rate={0.8} />
          <button className="min-w-0 flex-1 text-left" onClick={() => onOpen(m.word)}>
            <span className="hanzi text-xl">{m.word.zh}</span> <span className="text-sm text-accent">{m.word.py}</span>
            <span className="block truncate text-sm text-muted">{m.word.en}</span>
          </button>
        </>
      )}
      {m.type === "sentence" && (
        <>
          <SpeakButton text={m.zh} src={m.audio ? sentenceAudio(m.audio) : undefined} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="han text-[1.05rem]">{m.zh}</div>
            <div className="text-sm text-muted">{m.en}</div>
            <div className="mt-1 text-xs text-muted">{m.source}{m.href && <> · <Link className="text-accent" href={m.href}>practise <ArrowRight size={11} className="inline" /></Link></>}</div>
          </div>
        </>
      )}
      {m.type === "question" && (
        <div className="min-w-0 flex-1">
          <div className="han text-[1.05rem]">{m.prompt}</div>
          {reveal ? <div className="pop mt-1 text-sm"><Check size={13} className="mr-1 inline text-good" /><span className="han">{m.answer}</span></div>
            : <button className="mt-1 text-sm text-accent underline" onClick={() => setReveal(true)}>Show answer</button>}
          <div className="mt-1 text-xs text-muted">{m.source} · <Link className="text-accent" href={m.href}>open <ArrowRight size={11} className="inline" /></Link></div>
        </div>
      )}
      {m.type === "char" && (
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="hanzi text-3xl">{m.ch}</span>
          <Link className="text-sm text-accent" href="/write">Practise writing <ArrowRight size={12} className="inline" /></Link>
        </div>
      )}
      <div className="flex shrink-0 items-center gap-1">{times}{clear}</div>
    </li>
  );
}
