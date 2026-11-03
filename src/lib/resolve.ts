"use client";

import { BIZ_WORDS, levelOfId, loadDeck, loadLevel, type Word } from "./data";
import { buildQueue, dueCount, type AppState } from "./store";

export const bankWord = (id: string, b: { zh: string; py: string; en: string }): Word => ({ id, zh: b.zh, py: b.py, en: b.en, pos: [], level: 0, ex: [] });

/** Look up words for arbitrary ids (HSK, business pack, personal bank). */
export async function resolveIds(ids: string[], s: AppState): Promise<Word[]> {
  const levels = [...new Set(ids.map(levelOfId).filter((l) => l > 0))];
  const pools = await Promise.all(levels.map(loadLevel));
  const map = new Map<string, Word>();
  for (const w of [...pools.flat(), ...BIZ_WORDS]) map.set(w.id, w);
  for (const [id, b] of Object.entries(s.bank)) map.set(id, bankWord(id, b));
  return ids.map((id) => map.get(id)).filter((w): w is Word => !!w);
}

export type SessionPlan = { words: Map<string, Word>; queue: string[]; due: number; fresh: number };

export async function planSession(deck: string, s: AppState): Promise<SessionPlan> {
  let pool: Word[];
  let newLimit = s.settings.newPerDay;
  if (deck === "due") {
    pool = await resolveIds(Object.keys(s.cards), s);
    newLimit = 0;
  } else if (deck === "mistakes") {
    pool = await resolveIds(Object.keys(s.mistakes), s);
    // mistakes are always studied, even if not due yet
    const words = new Map(pool.map((w) => [w.id, w]));
    return { words, queue: pool.map((w) => w.id), due: pool.length, fresh: 0 };
  } else if (deck === "bank") {
    pool = Object.entries(s.bank).map(([id, b]) => bankWord(id, b));
    newLimit = Math.max(newLimit, pool.length);
  } else {
    pool = await loadDeck(deck);
    if (deck.startsWith("unit-")) newLimit = Math.max(newLimit, pool.length); // finishing a unit is the point
  }
  const q = buildQueue(s, pool, { newLimit });
  // interleave: three reviews, then one new word
  const queue: string[] = [];
  const due = [...q.due], fresh = [...q.fresh];
  while (due.length || fresh.length) {
    queue.push(...due.splice(0, 3));
    if (fresh.length) queue.push(fresh.shift()!);
  }
  return { words: new Map(pool.map((w) => [w.id, w])), queue, due: q.due.length, fresh: q.fresh.length };
}

/** cheap per-deck counts for the picker, no data loading */
export function deckCounts(s: AppState, deck: string, size: number, ids?: string[]) {
  const inDeck = ids ?? Object.keys(s.cards).filter((id) => (deck.startsWith("hsk-") ? levelOfId(id) === +deck.slice(4) : false));
  const started = inDeck.filter((id) => s.cards[id] || s.known[id]).length;
  return { due: dueCount(s, inDeck), unseen: Math.max(0, size - started) };
}
