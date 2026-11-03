"use client";

import { loadSentences, type Sentence, type Word } from "./data";
import { resolveIds } from "./resolve";
import type { AppState } from "./store";
import { ALL_GRAMMAR } from "@/data/grammar-all";
import { ALL_DIALOGUES } from "@/data/dialogues-all";
import { READINGS } from "@/data/readings";
import { PHRASES } from "@/data/toolkit";

export type ResolvedMistake =
  | { key: string; type: "word"; count: number; last: string; word: Word }
  | { key: string; type: "sentence"; count: number; last: string; zh: string; en: string; audio?: string; source: string; href?: string }
  | { key: string; type: "question"; count: number; last: string; prompt: string; answer: string; source: string; href: string }
  | { key: string; type: "char"; count: number; last: string; ch: string };

const sentenceLevel = (id: string) => Number(/^hsk(\d)/.exec(id)?.[1] ?? 0);

async function sentenceById(id: string): Promise<Sentence | undefined> {
  const l = sentenceLevel(id);
  return l ? (await loadSentences(l)).find((s) => s.id === id) : undefined;
}

/** Turn mistake keys from every feature back into reviewable items. Unknown keys are skipped. */
export async function resolveMistakes(s: AppState): Promise<ResolvedMistake[]> {
  const entries = Object.entries(s.mistakes);
  const wordKeys = entries.filter(([k]) => !k.includes(":") || k.startsWith("bank:")).map(([k]) => k);
  const words = new Map((await resolveIds(wordKeys, s)).map((w) => [w.id, w]));
  const out: ResolvedMistake[] = [];
  for (const [key, m] of entries) {
    const base = { key, count: m.count, last: m.last };
    const [kind, a, b, c] = key.split(":");
    if (words.has(key)) { out.push({ ...base, type: "word", word: words.get(key)! }); continue; }
    if (kind === "listen" || kind === "build") {
      const x = await sentenceById(a);
      if (x) out.push({ ...base, type: "sentence", zh: x.z, en: x.e, audio: x.id, source: kind === "listen" ? "Listening" : "Sentence builder", href: kind === "listen" ? "/listen" : "/games" });
    } else if (kind === "speak") {
      if (a === "s") { const x = await sentenceById(b); if (x) out.push({ ...base, type: "sentence", zh: x.z, en: x.e, audio: x.id, source: "Speaking", href: "/speak" }); }
      else if (a === "p") { const p = PHRASES.find((g) => g.id === b)?.phrases[+c]; if (p) out.push({ ...base, type: "sentence", zh: p.zh, en: p.en, source: "Speaking · work phrase", href: "/speak" }); }
      else if (a === "d") { const l = ALL_DIALOGUES.find((d) => d.id === b)?.lines[+c]; if (l) out.push({ ...base, type: "sentence", zh: l.zh, en: l.en, source: "Dialogue role-play", href: `/dialogues/${b}` }); }
    } else if (kind === "grammar") {
      const g = ALL_GRAMMAR.find((x) => x.id === a); const x = g?.exercises[+b];
      if (g && x) out.push({ ...base, type: "question", prompt: x.prompt.replace(/___/g, "＿＿"), answer: `${x.options[x.answer]} — ${x.why}`, source: `Grammar · ${g.pattern}`, href: "/grammar" });
    } else if (kind === "read") {
      const r = READINGS.find((x) => x.id === a); const q = r?.questions[+b];
      if (r && q) out.push({ ...base, type: "question", prompt: q.q, answer: q.options[q.answer], source: `Reading · ${r.titleZh}`, href: "/reader" });
    } else if (kind === "dlg") {
      const d = ALL_DIALOGUES.find((x) => x.id === a); const q = d?.questions[+b];
      if (d && q) out.push({ ...base, type: "question", prompt: q.q, answer: q.options[q.answer], source: `Dialogue · ${d.titleZh}`, href: `/dialogues/${a}` });
    } else if (kind === "char" && a) {
      out.push({ ...base, type: "char", ch: a });
    }
  }
  return out.sort((x, y) => y.count - x.count || y.last.localeCompare(x.last));
}
