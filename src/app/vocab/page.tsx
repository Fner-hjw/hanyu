"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { BIZ_WORDS, HSK_LEVELS, levelLabel, loadLevel, loadLevels, OFFLINE_MISSING, useAsync, type Word } from "@/lib/data";
import { parsePinyin } from "@/lib/pinyin";
import { bankWord } from "@/lib/resolve";
import { addCards, useAppState, useHydrated } from "@/lib/store";
import { PageHeader } from "@/components/ui";
import { SpeakButton } from "@/components/Speak";
import { StatusBadge, WordSheet, wordStatus } from "@/components/WordSheet";

type Source = number | "biz" | "all" | "bank";
const PAGE = 60;

function matcher(q: string) {
  const query = q.trim().toLowerCase();
  if (!query) return () => true;
  if (/[一-鿿]/.test(query)) return (w: Word) => w.zh.includes(query);
  const letters = parsePinyin(query).letters;
  return (w: Word) => w.en.toLowerCase().includes(query) || (letters.length > 1 && parsePinyin(w.py).letters.includes(letters));
}

export default function VocabPage() {
  const hydrated = useHydrated();
  return hydrated ? <Browser /> : null;
}

function Browser() {
  const s = useAppState();
  const [source, setSource] = useState<Source>(() => {
    const m = /^hsk-(\d)$/.exec(s.settings.deck);
    return m ? +m[1] : 4;
  });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "new" | "learning" | "known">("all");
  const [pos, setPos] = useState("all");
  const [limit, setLimit] = useState(PAGE);
  const [open, setOpen] = useState<Word | null>(null);

  const data = useAsync<Word[]>(
    () => (source === "biz" ? Promise.resolve(BIZ_WORDS)
      : source === "bank" ? Promise.resolve(Object.entries(s.bank).map(([id, b]) => bankWord(id, b)))
      : source === "all" ? loadLevels([...HSK_LEVELS]) : loadLevel(source)),
    [source, source === "bank" ? Object.keys(s.bank).length : 0],
  );
  const posList = useMemo(() => [...new Set((data.data ?? []).flatMap((w) => w.pos))].sort(), [data.data]);
  const filtered = useMemo(() => {
    const m = matcher(q);
    return (data.data ?? []).filter((w) => m(w) && (pos === "all" || w.pos.includes(pos)) && (status === "all" || wordStatus(s, w.id) === status));
  }, [data.data, q, pos, status, s]);
  const freshInView = filtered.filter((w) => wordStatus(s, w.id) === "new").slice(0, 20);

  const chip = (v: Source, label: string) => (
    <button key={String(v)} className="chip" data-active={source === v} onClick={() => { setSource(v); setLimit(PAGE); setPos("all"); }}>{label}</button>
  );

  return (
    <div>
      <PageHeader title="Vocabulary" subtitle="Every word of the revised HSK syllabus (November 2025, levels 1–9) plus a hand-written business & finance pack. Tap a word for examples, characters and notes." />

      <div className="card mb-4 space-y-3 p-4">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input pl-10" value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }}
            placeholder="Search 汉字, pinyin (no tones needed) or English…" aria-label="Search vocabulary" />
        </div>
        <div className="noscroll -mx-1 flex gap-2 overflow-x-auto px-1">
          {HSK_LEVELS.map((l) => chip(l, levelLabel(l)))}
          {chip("biz", "Business")}
          {chip("all", "All HSK")}
          {chip("bank", `My words (${Object.keys(s.bank).length})`)}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <select className="input w-auto py-1.5" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Status filter">
            <option value="all">All statuses</option><option value="new">New</option><option value="learning">Learning</option><option value="known">Known</option>
          </select>
          {posList.length > 0 && (
            <select className="input w-auto py-1.5" value={pos} onChange={(e) => setPos(e.target.value)} aria-label="Part of speech filter">
              <option value="all">All parts of speech</option>
              {posList.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          )}
          <span className="ml-auto text-muted">{data.loading ? "Loading…" : `${filtered.length.toLocaleString()} words`}</span>
          {freshInView.length > 0 && (
            <button className="btn btn-sm" onClick={() => addCards(freshInView.map((w) => w.id))}>
              <Plus size={14} /> Add next {freshInView.length} new to review
            </button>
          )}
        </div>
      </div>

      {data.error && <p className="text-accent">{data.error === OFFLINE_MISSING ? data.error : `Couldn’t load words: ${data.error}`}</p>}
      <ul className="card divide-y divide-line overflow-hidden">
        {filtered.slice(0, limit).map((w) => (
          <li key={w.id}>
            <div role="button" tabIndex={0} onClick={() => setOpen(w)} onKeyDown={(e) => e.key === "Enter" && setOpen(w)}
              className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-card2">
              <span className="hanzi w-24 shrink-0 text-2xl sm:w-32">{w.zh}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-accent">{w.py}</span>
                <span className="block truncate text-[0.92rem]">{w.en}</span>
              </span>
              <span className="hidden sm:block">{wordStatus(s, w.id) !== "new" && <StatusBadge status={wordStatus(s, w.id)} />}</span>
              <SpeakButton text={w.zh} rate={0.8} size="sm" />
            </div>
          </li>
        ))}
        {!data.loading && filtered.length === 0 && <li className="p-6 text-center text-muted">No words match.</li>}
      </ul>
      {filtered.length > limit && (
        <div className="mt-4 text-center"><button className="btn" onClick={() => setLimit(limit + PAGE * 2)}>Show more ({(filtered.length - limit).toLocaleString()} left)</button></div>
      )}
      <WordSheet word={open} onClose={() => setOpen(null)} />
    </div>
  );
}
