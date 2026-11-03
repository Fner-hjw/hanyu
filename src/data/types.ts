/* Content schemas. Chinese strings: simplified characters, full-width punctuation (，。？！“”：；、).
   Pinyin is generated automatically at runtime unless a field explicitly asks for it. */

export type Exercise = {
  /** sentence with ___ for the blank, or a question */
  prompt: string;
  options: string[];
  /** index into options */
  answer: number;
  /** one-sentence English explanation of why the answer is right */
  why: string;
};

export type GrammarCategory =
  | "sentence structure" | "aspect & time" | "complements" | "comparison" | "connectors"
  | "particles" | "prepositions" | "questions" | "modal verbs" | "emphasis" | "measure & numbers" | "formal & written";

export type GrammarPoint = {
  id: string; // "g-<slug>", unique
  pattern: string; // e.g. "A 比 B + adj."
  title: string; // short English name
  level: 1 | 2 | 3 | 4 | 5 | 6;
  category: GrammarCategory;
  explain: string; // 2–4 sentences, plain English
  pitfalls?: string; // common learner mistake, with a wrong ✗ and right ✓ example
  examples: { zh: string; en: string }[]; // 3–4
  exercises: Exercise[]; // 2–3
};

export type ReadingGenre = "email" | "notice" | "news" | "story" | "report" | "essay" | "chat" | "advert";
export type Reading = {
  id: string; // "r-<slug>"
  title: string;
  titleZh: string;
  level: 2 | 3 | 4 | 5 | 6;
  genre: ReadingGenre;
  work: boolean; // true for workplace/finance texts
  /** paragraphs separated by "\n" */
  text: string;
  glossary: { zh: string; en: string }[]; // 4–8 key words
  questions: { q: string; options: string[]; answer: number }[]; // 3–4, in Chinese
};

export type EmailTemplate = { id: string; title: string; when: string; zh: string; en: string; notes: string[] };
export type PhraseGroup = { id: string; situation: string; intro: string; phrases: { zh: string; en: string; note?: string }[] };
export type MeasureWord = { mw: string; py: string; usage: string; examples: { zh: string; en: string }[] };
export type EtiquetteTip = { title: string; body: string };

export type Radical = {
  r: string; // the radical as written alone
  forms?: string; // alternate/compressed forms, e.g. "氵" for 水
  py: string; // pinyin with tone marks
  meaning: string;
  strokes: number;
  examples: string; // 4–6 common characters containing it, no separators, e.g. "河湖海洗"
};
