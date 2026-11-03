"use client";

import { useState } from "react";
import { Annotated } from "@/components/Annotated";
import { SpeakButton } from "@/components/Speak";
import { Badge, PageHeader } from "@/components/ui";
import { READINGS } from "@/data/readings";
import type { Reading } from "@/data/types";
import { useAppState, useHydrated } from "@/lib/store";
import { ReadingView } from "./ReadingView";

const SAMPLE = "王经理，您好！附件是本季度的预算方案，请查收。如有疑问，请随时联系我。";
const LEVELS = [2, 3, 4, 5, 6] as const;

const hanCount = (t: string) => (t.match(/[一-鿿]/g) ?? []).length;

function Paste() {
  const [text, setText] = useState(SAMPLE);
  const [py, setPy] = useState(true);
  return (
    <div className="space-y-4">
      <label htmlFor="paste-text" className="sr-only">Chinese text</label>
      <textarea id="paste-text" value={text} onChange={(e) => setText(e.target.value)} rows={5} className="han w-full rounded-xl border border-line bg-card p-3 text-lg" />
      <div className="flex items-center gap-3 text-sm">
        <SpeakButton text={text} label="Read aloud" />
        <label className="flex items-center gap-1"><input type="checkbox" checked={py} onChange={(e) => setPy(e.target.checked)} /> Show pinyin</label>
      </div>
      <div className="rounded-xl border border-line bg-card p-4">
        {text.split(/\n+/).map((para, i) => para.trim() && <Annotated key={i} text={para} showPinyin={py} />)}
      </div>
    </div>
  );
}

function Card({ r, best, onOpen }: { r: Reading; best: number | undefined; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="card w-full space-y-2 p-4 text-left transition-colors hover:bg-accent-soft">
      <div className="hanzi text-xl">{r.titleZh}</div>
      <div className="text-sm text-muted">{r.title}</div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge>HSK {r.level}</Badge>
        <Badge>{r.genre}</Badge>
        {r.work && <Badge>Work</Badge>}
        <span className="text-xs text-muted">≈{hanCount(r.text)} 字</span>
      </div>
      {best !== undefined && <div className="text-xs font-semibold text-good">Best: {best}%</div>}
    </button>
  );
}

function Library() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [level, setLevel] = useState<number | "all">("all");
  const [workOnly, setWorkOnly] = useState(false);
  const scores = useAppState().readingsDone;

  const open = READINGS.find((r) => r.id === openId);
  if (open) {
    return <ReadingView key={open.id} reading={open} onBack={() => setOpenId(null)} />;
  }

  const list = READINGS.filter((r) => (level === "all" || r.level === level) && (!workOnly || r.work));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filters">
        <button type="button" className="chip" data-active={level === "all"} onClick={() => setLevel("all")}>All</button>
        {LEVELS.map((l) => (
          <button key={l} type="button" className="chip" data-active={level === l} onClick={() => setLevel(l)}>HSK {l}</button>
        ))}
        <button type="button" className="chip" data-active={workOnly} aria-pressed={workOnly} onClick={() => setWorkOnly((w) => !w)}>Work &amp; finance</button>
      </div>
      {list.length === 0 ? (
        <p className="text-muted">No readings match these filters.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((r) => <Card key={r.id} r={r} best={scores[r.id]} onOpen={() => setOpenId(r.id)} />)}
        </div>
      )}
    </div>
  );
}

export default function Reader() {
  const hydrated = useHydrated();
  const [mode, setMode] = useState<"library" | "paste">("library");
  return (
    <div>
      <PageHeader title="Read" subtitle="Graded texts from HSK 2 to 6, plus workplace and finance readings. Tap any word for its pinyin and meaning." />
      <div className="mb-4 flex gap-2" role="group" aria-label="Reader mode">
        <button type="button" className="chip" data-active={mode === "library"} onClick={() => setMode("library")}>Library</button>
        <button type="button" className="chip" data-active={mode === "paste"} onClick={() => setMode("paste")}>Paste your own text</button>
      </div>
      {mode === "paste" ? <Paste /> : hydrated ? <Library /> : null}
    </div>
  );
}
