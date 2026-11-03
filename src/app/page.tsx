"use client";

import Link from "next/link";
import { useRef } from "react";
import { VOCAB } from "@/data/vocab";
import { DIALOGUES } from "@/data/dialogues";
import { GRAMMAR } from "@/data/grammar";
import {
  buildQueue, exportData, importData, isKnown, resetData, streak, todayKey, updateSettings, useAppState, useHydrated,
} from "@/lib/store";

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-line bg-card p-4">
      <div className="text-3xl font-semibold">{value}</div>
      <div className="text-sm text-muted">{label}</div>
      {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
    </div>
  );
}

export default function Home() {
  const hydrated = useHydrated();
  return hydrated ? <Dashboard /> : null;
}

function Dashboard() {
  const s = useAppState();
  const hydrated = true;
  const fileRef = useRef<HTMLInputElement>(null);
  const q = buildQueue(s, VOCAB, { newLimit: s.settings.newPerDay });
  const known = VOCAB.filter((w) => isKnown(s.cards[w.id])).length;
  const learning = Object.keys(s.cards).length;
  const today = s.log[todayKey()];
  const last = s.tests[s.tests.length - 1];
  const todo = q.due.length + q.fresh.length;

  const byLevel = [3, 4, 5, 6].map((l) => {
    const ws = VOCAB.filter((w) => w.level === l);
    return { l, total: ws.length, seen: ws.filter((w) => s.cards[w.id]).length };
  });

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-line bg-card p-6">
        <h1 className="text-2xl font-semibold">
          <span className="han">你好！</span> Ready to practise?
        </h1>
        <p className="mt-1 text-muted">
          {hydrated && todo > 0
            ? `${q.due.length} cards due and ${q.fresh.length} new today.`
            : "Nothing due right now – nice work."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/flashcards" className="rounded-full bg-accent px-5 py-2 text-white">
            Start flashcards
          </Link>
          <Link href="/dialogues" className="rounded-full border border-line px-5 py-2 hover:bg-accent-soft">
            Practise a dialogue
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Day streak" value={hydrated ? streak(s) : 0} />
        <Stat label="Reviewed today" value={hydrated ? (today?.reviews ?? 0) : 0} />
        <Stat label="Words started" value={learning} sub={`of ${VOCAB.length}`} />
        <Stat label="Words known" value={known} sub="stable memory" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-card p-4">
          <h2 className="mb-3 font-medium">Vocabulary by level (approx. HSK)</h2>
          {byLevel.map(({ l, total, seen }) => (
            <div key={l} className="mb-2 text-sm">
              <div className="flex justify-between"><span>HSK {l}</span><span className="text-muted">{seen}/{total}</span></div>
              <div className="h-2 rounded bg-line"><div className="h-2 rounded bg-accent" style={{ width: `${total ? (seen / total) * 100 : 0}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-line bg-card p-4 text-sm">
          <h2 className="mb-3 font-medium">Progress</h2>
          <p>Dialogues completed: {Object.keys(s.dialoguesDone).length}/{DIALOGUES.length}</p>
          <p>Grammar points studied: {Object.keys(s.grammarDone).length}/{GRAMMAR.length}</p>
          <p className="mt-2">
            Last level check:{" "}
            {last ? <b>≈ HSK {last.estimated}</b> : <Link className="text-accent underline" href="/test">not taken yet</Link>}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-card p-4 text-sm">
        <h2 className="mb-2 font-medium">Settings & backup</h2>
        <label className="flex items-center gap-2">
          New cards per day:
          <select
            className="rounded border border-line bg-bg px-2 py-1"
            value={s.settings.newPerDay}
            onChange={(e) => updateSettings({ newPerDay: +e.target.value })}
          >
            {[5, 10, 15, 20, 30].map((n) => <option key={n}>{n}</option>)}
          </select>
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="rounded border border-line px-3 py-1 hover:bg-accent-soft" onClick={() => {
            const blob = new Blob([exportData()], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `hanyu-backup-${todayKey()}.json`;
            a.click();
          }}>Export progress</button>
          <button className="rounded border border-line px-3 py-1 hover:bg-accent-soft" onClick={() => fileRef.current?.click()}>Import progress</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) { try { importData(await f.text()); } catch { alert("Invalid backup file"); } }
          }} />
          <button className="rounded border border-line px-3 py-1 text-accent hover:bg-accent-soft" onClick={() => confirm("Delete all progress?") && resetData()}>Reset</button>
        </div>
        <p className="mt-2 text-xs text-muted">Progress is stored in this browser. Export regularly until account sync is added.</p>
      </section>
    </div>
  );
}
