"use client";

import { loadLevel, loadSentences, type Sentence, type Word } from "./data";
import { makeQuiz, rng } from "./quiz";
import { shuffleOptions } from "./shuffle";
import { ALL_GRAMMAR } from "@/data/grammar-all";
import { READINGS } from "@/data/readings";
import type { Mistake } from "./store";

export type Section = "listening" | "vocabulary" | "grammar" | "reading";
export type ExamQ = {
  id: string;
  section: Section;
  level: number;
  prompt: string;
  passage?: string;
  audio?: { sentence?: string; text: string };
  options: string[];
  optionsHan: boolean;
  answer: number;
  explain?: string;
  mistake?: { key: string; kind: Mistake["kind"] };
};

const shuffle = <T,>(a: T[], r: () => number) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
};
const shuffled = (q: Omit<ExamQ, "options" | "answer"> & { options: string[]; answer: number }): ExamQ => ({ ...q, ...shuffleOptions(q.options, q.answer, q.id) });

function vocabQs(words: Word[], level: number, n: number, seed: number): ExamQ[] {
  return makeQuiz(words, words, n, seed).filter((q) => q.kind !== "listen").map((q, i) => ({
    id: `v${level}-${seed}-${i}`, section: "vocabulary" as const, level,
    prompt: q.kind === "meaning" ? `“${q.word.zh}” means…` : `Which word means “${q.word.en}”?`,
    options: q.options, answer: q.answer, optionsHan: q.kind !== "meaning",
    explain: `${q.word.zh} ${q.word.py} — ${q.word.en}`,
    mistake: { key: q.word.id, kind: "word" as const },
  }));
}

function similar(pool: Sentence[], s: Sentence, r: () => number, k: number) {
  return shuffle(pool.filter((x) => x.id !== s.id && x.e !== s.e && x.z !== s.z)
    .map((x) => ({ x, d: Math.abs(x.z.length - s.z.length) + (x.tp === s.tp ? 0 : 2) + r() * 3 }))
    .sort((a, b) => a.d - b.d).slice(0, 10).map((y) => y.x), r).slice(0, k);
}

function listeningQs(sents: Sentence[], level: number, nMeaning: number, nText: number, seed: number): ExamQ[] {
  const r = rng(seed);
  const pick = shuffle(sents.filter((s) => s.z.length >= 6 && s.z.length <= 40), r).slice(0, nMeaning + nText);
  return pick.map((s, i) => {
    const others = similar(sents, s, r, 3);
    const meaning = i < nMeaning;
    return shuffled({
      id: `l${level}-${s.id}-${meaning ? "m" : "t"}`, section: "listening", level,
      prompt: meaning ? "Listen and choose the best translation." : "Listen and choose the sentence you heard.",
      audio: { sentence: s.id, text: s.z },
      options: meaning ? [s.e, ...others.map((o) => o.e)] : [s.z, ...others.map((o) => o.z)],
      answer: 0, optionsHan: !meaning, explain: `${s.z} — ${s.e}`,
      mistake: { key: `listen:${s.id}`, kind: "listen" },
    });
  });
}

function grammarQs(level: number, n: number, seed: number): ExamQ[] {
  const r = rng(seed);
  const pts = ALL_GRAMMAR.filter((g) => g.level === level || g.level === level - 1);
  const items = shuffle(pts.flatMap((g) => g.exercises.map((x, i) => ({ g, x, i }))), r).slice(0, n);
  return items.map(({ g, x, i }) => shuffled({
    id: `g-${g.id}-${i}`, section: "grammar", level,
    prompt: x.prompt.replace(/___/g, "＿＿"), options: x.options, answer: x.answer, optionsHan: true,
    explain: `${g.pattern} — ${x.why}`, mistake: { key: `grammar:${g.id}:${i}`, kind: "grammar" },
  }));
}

/** blank a level word inside a real sentence; distractors share the part of speech */
function clozeQs(sents: Sentence[], words: Word[], level: number, n: number, seed: number): ExamQ[] {
  const r = rng(seed);
  const byZh = new Map(words.filter((w) => [...w.zh].length >= 2 && w.en).map((w) => [w.zh, w]));
  const cands = shuffle(sents, r).flatMap((s) => {
    const hit = s.k.find(([w]) => byZh.has(w) && s.z.split(w).length === 2);
    return hit ? [{ s, w: byZh.get(hit[0])! }] : [];
  });
  const out: ExamQ[] = [];
  const used = new Set<string>();
  for (const { s, w } of cands) {
    if (out.length >= n || used.has(w.zh)) continue;
    const same = words.filter((x) => x.zh !== w.zh && [...x.zh].length === [...w.zh].length && x.pos.some((p) => w.pos.includes(p)) && !s.z.includes(x.zh));
    if (same.length < 3) continue;
    used.add(w.zh);
    out.push(shuffled({
      id: `c${level}-${s.id}-${w.id}`, section: "reading", level,
      prompt: s.z.replace(w.zh, "＿＿"), options: [w.zh, ...shuffle(same, r).slice(0, 3).map((x) => x.zh)], answer: 0, optionsHan: true,
      explain: `${s.z} — ${s.e}`, mistake: { key: w.id, kind: "word" },
    }));
  }
  return out;
}

function passageQs(level: number, seed: number): ExamQ[] {
  const r = rng(seed);
  const pool = READINGS.filter((x) => x.level === level);
  const pick = pool.length ? pool[Math.floor(r() * pool.length)] : READINGS.filter((x) => x.level === Math.max(2, Math.min(6, level)))[0];
  if (!pick || level < 2) return [];
  return pick.questions.map((q, i) => shuffled({
    id: `p-${pick.id}-${i}`, section: "reading", level, passage: pick.text,
    prompt: q.q, options: q.options, answer: q.answer, optionsHan: true,
    mistake: { key: `read:${pick.id}:${i}`, kind: "sentence" },
  }));
}

/** a full mock exam for one level (~30 questions) */
export async function buildExam(level: number, seed: number): Promise<ExamQ[]> {
  const [words, sents] = await Promise.all([loadLevel(level), loadSentences(Math.min(level, 6))]);
  return [
    ...listeningQs(sents, level, 5, 3, seed),
    ...vocabQs(words, level, 14, seed + 1).slice(0, 10),
    ...grammarQs(level, 6, seed + 2),
    ...clozeQs(sents, words, level, 5, seed + 3),
    ...passageQs(level, seed + 4),
  ];
}

/** six mixed questions at one level, for the adaptive placement test */
export async function buildBlock(level: number, seed: number): Promise<ExamQ[]> {
  const [words, sents] = await Promise.all([loadLevel(level), loadSentences(Math.min(level, 6))]);
  const r = rng(seed);
  const qs = [
    ...listeningQs(sents, level, 1, 1, seed),
    ...vocabQs(words, level, 4, seed + 1).slice(0, 2),
    ...grammarQs(level, 1, seed + 2),
    ...clozeQs(sents, words, level, 1, seed + 3),
  ];
  return shuffle(qs, r);
}

/** staircase: ≥5/6 → up a level, 4/6 → settle here, ≤3/6 → down (stop if the lower level already passed) */
export function nextStep(level: number, correct: number, passed: Set<number>, blocks: number): { next: number | null; passed: Set<number> } {
  const p = new Set(passed);
  if (correct >= 5) { p.add(level); return { next: level < 6 && blocks < 7 ? level + 1 : null, passed: p }; }
  if (correct === 4) { p.add(level); return { next: null, passed: p }; }
  if (level === 1 || p.has(level - 1) || blocks >= 7) return { next: null, passed: p };
  return { next: level - 1, passed: p };
}
export const estimateFrom = (passed: Set<number>) => (passed.size ? Math.max(...passed) : 0);
