import { rng } from "./quiz";

/** string → 32-bit seed (stable per question) */
export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Shuffle multiple-choice options so the correct answer's position isn't predictable.
 * Deterministic for a given `key` (so re-renders don't reshuffle).
 */
export function shuffleOptions(options: string[], answer: number, key: string): { options: string[]; answer: number } {
  const rnd = rng(hashSeed(key));
  const idx = options.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return { options: idx.map((i) => options[i]), answer: idx.indexOf(answer) };
}
