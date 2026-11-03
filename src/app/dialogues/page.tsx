"use client";

import Link from "next/link";
import { DIALOGUES } from "@/data/dialogues";
import { useAppState } from "@/lib/store";

const LABEL = { meetings: "Meeting", email: "Email", phone: "Phone", negotiation: "Negotiation", social: "Social", daily: "Daily life" } as const;

export default function Dialogues() {
  const s = useAppState();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dialogues</h1>
      <p className="text-muted">Workplace scenarios with audio, tap-a-word glosses, shadowing and comprehension questions.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {DIALOGUES.map((d) => (
          <Link key={d.id} href={`/dialogues/${d.id}`} className="rounded-xl border border-line bg-card p-4 hover:bg-accent-soft">
            <div className="text-xs text-muted">{LABEL[d.scenario]} · ≈HSK {d.level}</div>
            <div className="han mt-1 text-lg">{d.titleZh}</div>
            <div>{d.title}</div>
            {d.id in s.dialoguesDone && <div className="mt-2 text-sm text-good">✓ Quiz best: {s.dialoguesDone[d.id]}%</div>}
          </Link>
        ))}
      </div>
    </div>
  );
}
