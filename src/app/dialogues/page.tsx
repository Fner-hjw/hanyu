"use client";

import Link from "next/link";
import { useState } from "react";
import { ALL_DIALOGUES, SCENARIO_LABEL } from "@/data/dialogues-all";
import { useAppState, useHydrated } from "@/lib/store";
import { Badge, PageHeader, plural } from "@/components/ui";

type Kind = "all" | "daily" | "work";

export default function DialoguesPage() {
  const hydrated = useHydrated();
  return hydrated ? <Dialogues /> : null;
}

const LEVELS = [...new Set(ALL_DIALOGUES.map((d) => d.level))].sort((a, b) => a - b);

function Dialogues() {
  const s = useAppState();
  const [kind, setKind] = useState<Kind>("all");
  const [level, setLevel] = useState<number | null>(null);

  const list = ALL_DIALOGUES.filter(
    (d) => (kind === "all" || (kind === "daily" ? d.scenario === "daily" : d.scenario !== "daily")) && (level === null || d.level === level),
  );

  return (
    <div>
      <PageHeader title="Dialogues" subtitle="Real-life and workplace conversations: listen, role-play your side out loud, then check comprehension." />
      <div className="mb-5 space-y-2">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by type">
          <button className="chip" data-active={kind === "all"} onClick={() => setKind("all")}>All</button>
          <button className="chip" data-active={kind === "daily"} onClick={() => setKind("daily")}>Daily life</button>
          <button className="chip" data-active={kind === "work"} onClick={() => setKind("work")}>Work</button>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by level">
          <button className="chip" data-active={level === null} onClick={() => setLevel(null)}>Any level</button>
          {LEVELS.map((l) => (
            <button key={l} className="chip" data-active={level === l} onClick={() => setLevel(l)}>HSK {l}</button>
          ))}
        </div>
      </div>
      {list.length === 0 ? (
        <p className="text-muted">No dialogues match these filters.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((d) => (
            <Link key={d.id} href={`/dialogues/${d.id}`} className="card flex min-w-0 flex-col gap-2 p-4 transition-colors hover:bg-accent-soft">
              <div>
                <div className="hanzi text-lg">{d.titleZh}</div>
                <div className="font-semibold">{d.title}</div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge>{SCENARIO_LABEL[d.scenario]}</Badge>
                <Badge>HSK {d.level}</Badge>
                <span className="text-xs text-muted">{plural(d.lines.length, "line")}</span>
              </div>
              <p className="line-clamp-2 text-sm text-muted">{d.intro}</p>
              {d.id in s.dialoguesDone && <div className="mt-auto text-sm font-semibold text-good">✓ best {s.dialoguesDone[d.id]}%</div>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
