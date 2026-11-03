"use client";

import { useState } from "react";
import { VOCAB, TOPICS, type Topic } from "@/data/vocab";
import { SpeakButton } from "@/components/Speak";
import { isKnown, useAppState } from "@/lib/store";

export default function VocabPage() {
  const s = useAppState();
  const [topic, setTopic] = useState<Topic | "all">("all");
  const [qs, setQs] = useState("");
  const list = VOCAB.filter(
    (w) =>
      (topic === "all" || w.topic === topic) &&
      (!qs || w.zh.includes(qs) || w.py.toLowerCase().includes(qs.toLowerCase()) || w.en.toLowerCase().includes(qs.toLowerCase())),
  );
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Vocabulary <span className="text-base font-normal text-muted">({list.length})</span></h1>
      <input value={qs} onChange={(e) => setQs(e.target.value)} placeholder="Search hanzi, pinyin or English…" className="w-full rounded-lg border border-line bg-card px-3 py-2" />
      <div className="flex flex-wrap gap-2">
        {(["all", ...Object.keys(TOPICS)] as (Topic | "all")[]).map((t) => (
          <button key={t} onClick={() => setTopic(t)} className={`rounded-full border px-3 py-1 text-sm ${topic === t ? "border-accent bg-accent text-white" : "border-line hover:bg-accent-soft"}`}>
            {t === "all" ? "All" : TOPICS[t]}
          </button>
        ))}
      </div>
      <ul className="divide-y divide-line rounded-xl border border-line bg-card">
        {list.map((w) => (
          <li key={w.id} className="flex items-start gap-3 p-3">
            <SpeakButton text={w.zh} />
            <div className="flex-1">
              <div><span className="han text-xl">{w.zh}</span> <span className="text-accent">{w.py}</span> <span className="text-xs text-muted">≈HSK {w.level}</span></div>
              <div>{w.en}</div>
              <div className="han text-sm text-muted">{w.ex} — {w.exEn}</div>
            </div>
            <span className="text-xs text-muted">{isKnown(s.cards[w.id]) ? "✓ known" : s.cards[w.id] ? "learning" : "new"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
