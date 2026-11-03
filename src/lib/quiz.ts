import type { Word } from "./data";

export type QuizQ = {
  kind: "meaning" | "word" | "listen";
  word: Word;
  options: string[];
  answer: number;
};

const shuffle = <T,>(a: T[], rnd: () => number): T[] => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

/** small seeded PRNG so a quiz can be regenerated deterministically */
export function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Multiple-choice questions over `words`; distractors come from `pool` (same level),
 * preferring the same part of speech and similar length so they're plausible.
 */
export function makeQuiz(words: Word[], pool: Word[], n: number, seed: number): QuizQ[] {
  const rnd = rng(seed);
  const usable = words.filter((w) => w.en);
  const kinds: QuizQ["kind"][] = ["meaning", "word", "listen"];
  return shuffle(usable, rnd).slice(0, n).map((w, i) => {
    const kind = kinds[i % 3];
    const others = pool.filter((p) => p.id !== w.id && p.en && p.zh !== w.zh && p.en !== w.en);
    const score = (p: Word) => (p.pos.some((x) => w.pos.includes(x)) ? 0 : 2) + Math.abs([...p.zh].length - [...w.zh].length) + rnd();
    const distract = [...others].sort((a, b) => score(a) - score(b)).slice(0, 12);
    const picks = shuffle(distract, rnd).slice(0, 3);
    const all = shuffle([w, ...picks], rnd);
    const label = (x: Word) => (kind === "meaning" ? x.en : x.zh);
    return { kind, word: w, options: all.map(label), answer: all.indexOf(w) };
  });
}
