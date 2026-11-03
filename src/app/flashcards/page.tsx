"use client";

import { useMemo, useState } from "react";
import { Rating, type Grade } from "ts-fsrs";
import { VOCAB, TOPICS, type Topic, type Word } from "@/data/vocab";
import { SpeakButton } from "@/components/Speak";
import { speak } from "@/lib/audio";
import { buildQueue, previewIntervals, reviewCard, updateSettings, useAppState, useHydrated } from "@/lib/store";

const WORDS = new Map(VOCAB.map((w) => [w.id, w]));

export default function FlashcardsPage() {
  const hydrated = useHydrated();
  return hydrated ? <Picker /> : null;
}

function Picker() {
  const [topic, setTopic] = useState<Topic | "all">("all");
  const [started, setStarted] = useState<string[] | null>(null);
  const s = useAppState();
  const pool = useMemo(() => (topic === "all" ? VOCAB : VOCAB.filter((w) => w.topic === topic)), [topic]);
  const q = buildQueue(s, pool, { newLimit: s.settings.newPerDay });

  if (started) return <Session initial={started} onDone={() => setStarted(null)} />;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Flashcards</h1>
      <div className="flex flex-wrap gap-2">
        {(["all", ...Object.keys(TOPICS)] as (Topic | "all")[]).map((t) => (
          <button key={t} onClick={() => setTopic(t)} className={`rounded-full border px-3 py-1 text-sm ${topic === t ? "border-accent bg-accent text-white" : "border-line hover:bg-accent-soft"}`}>
            {t === "all" ? "All topics" : TOPICS[t]}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-line bg-card p-5">
        <p><b>{q.due.length}</b> due · <b>{q.fresh.length}</b> new</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <label>Mode:{" "}
            <select className="rounded border border-line bg-bg px-2 py-1" value={s.settings.direction} onChange={(e) => updateSettings({ direction: e.target.value as "zh-en" | "en-zh" | "listen" })}>
              <option value="zh-en">Chinese → meaning</option>
              <option value="en-zh">Meaning → Chinese (recall)</option>
              <option value="listen">Listening → meaning</option>
            </select>
          </label>
          <label className="flex items-center gap-1"><input type="checkbox" checked={s.settings.showPinyin} onChange={(e) => updateSettings({ showPinyin: e.target.checked })} /> Show pinyin on front</label>
        </div>
        <button disabled={q.due.length + q.fresh.length === 0} onClick={() => setStarted([...q.due, ...q.fresh])} className="mt-4 rounded-full bg-accent px-6 py-2 text-white disabled:opacity-40">
          Start session
        </button>
        {q.due.length + q.fresh.length === 0 && <p className="mt-2 text-sm text-muted">All done for this selection. Come back later or raise the daily new-card limit on the home page.</p>}
      </div>
    </div>
  );
}

function Session({ initial, onDone }: { initial: string[]; onDone: () => void }) {
  const s = useAppState();
  const [queue, setQueue] = useState(initial);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);
  const id = queue[0];
  const w: Word | undefined = id ? WORDS.get(id) : undefined;
  const mode = s.settings.direction;

  if (!w) {
    return (
      <div className="rounded-xl border border-line bg-card p-8 text-center">
        <div className="han text-5xl">太棒了！</div>
        <p className="mt-2">Session complete – {done} reviews.</p>
        <button onClick={onDone} className="mt-4 rounded-full bg-accent px-6 py-2 text-white">Back</button>
      </div>
    );
  }

  const rate = (g: Grade) => {
    reviewCard(w.id, g);
    setDone((d) => d + 1);
    setFlipped(false);
    setQueue((q) => (g === Rating.Again ? [...q.slice(1), q[0]] : q.slice(1)));
  };
  const reveal = () => {
    setFlipped(true);
    if (mode !== "en-zh") speak(w.ex, s.settings.speed);
  };
  const preview = flipped ? previewIntervals(w.id, s) : null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-muted">
        <span>{queue.length} left</span>
        <button onClick={onDone} className="underline">End session</button>
      </div>
      <div className="min-h-72 rounded-2xl border border-line bg-card p-6 text-center" onClick={() => !flipped && reveal()}>
        {!flipped ? (
          <div className="flex min-h-60 flex-col items-center justify-center gap-3">
            {mode === "zh-en" && (<>
              <div className="han text-6xl">{w.zh}</div>
              {s.settings.showPinyin && <div className="text-xl text-accent">{w.py}</div>}
              <SpeakButton text={w.zh} rate={s.settings.speed} />
            </>)}
            {mode === "en-zh" && <div className="text-3xl">{w.en}</div>}
            {mode === "listen" && (<><div className="text-muted">Listen, then recall the meaning</div><SpeakButton text={w.zh} rate={s.settings.speed} className="!h-16 !w-16 !text-3xl" /></>)}
            <div className="mt-4 text-sm text-muted">Tap to reveal</div>
          </div>
        ) : (
          <div className="flex min-h-60 flex-col items-center justify-center gap-2">
            <div className="han text-5xl">{w.zh}</div>
            <div className="flex items-center gap-2 text-xl text-accent">{w.py} <SpeakButton text={w.zh} rate={s.settings.speed} /></div>
            <div className="text-2xl">{w.en}</div>
            <div className="mt-3 max-w-md rounded-lg bg-bg p-3 text-left">
              <div className="han text-lg">{w.ex}</div>
              <div className="text-sm text-muted">{w.exEn}</div>
              <SpeakButton text={w.ex} rate={s.settings.speed} className="mt-1" />
            </div>
            <div className="text-xs text-muted">{TOPICS[w.topic]} · ≈HSK {w.level}</div>
          </div>
        )}
      </div>
      {flipped ? (
        <div className="grid grid-cols-4 gap-2">
          {([[Rating.Again, "Again"], [Rating.Hard, "Hard"], [Rating.Good, "Good"], [Rating.Easy, "Easy"]] as [Grade, string][]).map(([g, label]) => (
            <button key={label} onClick={() => rate(g)} className="rounded-xl border border-line bg-card py-3 hover:bg-accent-soft">
              <div className="font-medium">{label}</div>
              <div className="text-xs text-muted">{preview?.[g]}</div>
            </button>
          ))}
        </div>
      ) : (
        <button onClick={reveal} className="w-full rounded-xl bg-accent py-3 text-white">Show answer</button>
      )}
    </div>
  );
}
