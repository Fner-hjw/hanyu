"use client";

import { useEffect, useState } from "react";
import { VOCAB, TOPICS, type Topic } from "@/data/vocab";

/* ---------- unified types ---------- */
export type Example = { id?: string; zh: string; py: string; en: string };
export type Word = {
  id: string;
  zh: string;
  py: string;
  en: string;
  pos: string[];
  /** 1-6 = HSK level, 7 = HSK 7-9, 0 = business pack (see `level` of the original list in topic decks) */
  level: number;
  topic?: Topic;
  ex: Example[];
};
export type Sentence = {
  id: string;
  l: number;
  tp: string;
  ty: string;
  z: string;
  p: string;
  e: string;
  k: [word: string, pinyin: string, gloss: string][];
  g: string[];
};
/** [level, pinyin, meaning, strokes, compositionType, left, right] */
export type CharInfo = [number, string, string, number, string, string, string];

export const HSK_LEVELS = [1, 2, 3, 4, 5, 6, 7] as const;
export const levelLabel = (l: number) => (l === 7 ? "HSK 7–9" : `HSK ${l}`);
export const LEVEL_SIZES: Record<number, number> = { 1: 300, 2: 198, 3: 497, 4: 997, 5: 1591, 6: 1792, 7: 5583 };

/** syllabus sequence number → level (ids look like "h936") */
export function levelOfId(id: string): number {
  if (!id.startsWith("h")) return 0;
  const n = parseInt(id.slice(1), 10);
  return n <= 300 ? 1 : n <= 500 ? 2 : n <= 1000 ? 3 : n <= 2000 ? 4 : n <= 3600 ? 5 : n <= 5400 ? 6 : 7;
}

/* ---------- fetch + cache ---------- */
const cache = new Map<string, Promise<unknown>>();
function getJson<T>(path: string): Promise<T> {
  let p = cache.get(path);
  if (!p) {
    p = fetch(path).then((r) => {
      if (!r.ok) throw new Error(`${path}: ${r.status}`);
      return r.json();
    });
    p.catch(() => cache.delete(path));
    cache.set(path, p);
  }
  return p as Promise<T>;
}

type RawWord = { i: string; l: number; z: string; p: string; t: string[]; e: string; x: [string, string, string, string][] };
const toWord = (r: RawWord): Word => ({
  id: r.i, zh: r.z, py: r.p, en: r.e, pos: r.t, level: r.l,
  ex: r.x.map(([id, zh, py, en]) => ({ id, zh, py, en })),
});

export async function loadLevel(level: number): Promise<Word[]> {
  return (await getJson<RawWord[]>(`/data/words-${level}.json`)).map(toWord);
}
export async function loadLevels(levels: number[]): Promise<Word[]> {
  return (await Promise.all(levels.map(loadLevel))).flat();
}
export function loadSentences(level: number): Promise<Sentence[]> {
  return getJson<Sentence[]>(`/data/sentences-${level}.json`);
}
export async function loadSentencesUpTo(level: number): Promise<Sentence[]> {
  return (await Promise.all(Array.from({ length: level }, (_, i) => loadSentences(i + 1)))).flat();
}
export function loadChars(): Promise<Record<string, CharInfo>> {
  return getJson<Record<string, CharInfo>>("/data/chars.json");
}

const AUDIO_BASE = "https://raw.githubusercontent.com/no7z/hsk-sentences-audio/main/dist/audio/";
export const sentenceAudio = (id: string, slow = false) => `${AUDIO_BASE}${id}${slow ? "_slow" : ""}.mp3`;

/* ---------- business pack (hand-written, finance-focused) ---------- */
export const BIZ_WORDS: Word[] = VOCAB.map((w) => ({
  id: w.id, zh: w.zh, py: w.py, en: w.en, pos: [], level: 0, topic: w.topic,
  ex: [{ zh: w.ex, py: "", en: w.exEn }],
}));
export { TOPICS };

/* ---------- decks ---------- */
export type Deck = { id: string; title: string; subtitle: string; kind: "hsk" | "biz"; level?: number; topic?: Topic };
export const DECKS: Deck[] = [
  ...HSK_LEVELS.map((l) => ({ id: `hsk-${l}`, title: levelLabel(l), subtitle: `${LEVEL_SIZES[l].toLocaleString()} words`, kind: "hsk" as const, level: l })),
  { id: "biz-all", title: "Business & finance", subtitle: `${BIZ_WORDS.length} words`, kind: "biz" as const },
  ...(Object.keys(TOPICS) as Topic[]).map((t) => ({
    id: `biz-${t}`, title: TOPICS[t], subtitle: `${BIZ_WORDS.filter((w) => w.topic === t).length} words`, kind: "biz" as const, topic: t,
  })),
];

export async function loadDeck(deckId: string): Promise<Word[]> {
  const d = DECKS.find((x) => x.id === deckId);
  if (!d) return [];
  if (d.kind === "hsk") return loadLevel(d.level!);
  return d.topic ? BIZ_WORDS.filter((w) => w.topic === d.topic) : BIZ_WORDS;
}

/* ---------- react helper ---------- */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): { data: T | null; loading: boolean; error: string | null } {
  const [state, setState] = useState<{ key: string; data: T | null; error: string | null }>({ key: "", data: null, error: null });
  const key = JSON.stringify(deps);
  useEffect(() => {
    let live = true;
    fn().then(
      (data) => live && setState({ key, data, error: null }),
      (e) => live && setState({ key, data: null, error: String(e) }),
    );
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const fresh = state.key === key;
  return { data: fresh ? state.data : null, loading: !fresh, error: fresh ? state.error : null };
}
