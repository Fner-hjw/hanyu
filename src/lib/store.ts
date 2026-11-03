"use client";

import { useSyncExternalStore } from "react";
import { createEmptyCard, fsrs, Rating, State, type Card, type Grade } from "ts-fsrs";

const KEY = "hanyu:v1";
const scheduler = fsrs({ enable_fuzz: true });

export type StoredCard = Omit<Card, "due" | "last_review"> & { due: string; last_review?: string };

export type TestResult = {
  date: string;
  estimated: number;
  bySection: Record<string, { correct: number; total: number }>;
  byLevel: Record<string, { correct: number; total: number }>;
};

export type BankWord = { zh: string; py: string; en: string; added: string };
export type Mistake = { count: number; last: string; kind: "word" | "sentence" | "char" | "grammar" | "listen" };

export type AppState = {
  cards: Record<string, StoredCard>;
  log: Record<string, { reviews: number; newCards: number; correct: number; practice?: number }>;
  /** word ids the learner marked as already known (excluded from queues) */
  known: Record<string, true>;
  notes: Record<string, string>;
  mistakes: Record<string, Mistake>;
  bank: Record<string, BankWord>;
  writing: Record<string, number>; // char -> best accuracy %
  grammarDone: Record<string, boolean>;
  dialoguesDone: Record<string, number>; // best comprehension score %
  tests: TestResult[];
  settings: {
    newPerDay: number;
    direction: "zh-en" | "en-zh" | "listen" | "type" | "cloze";
    showPinyin: boolean;
    speed: number;
    dailyGoal: number; // reviews + practice items per day
    deck: string;
    targetLevel: number;
    examDate: string; // ISO date or ""
  };
};

export const DEFAULT_STATE: AppState = {
  cards: {},
  log: {},
  known: {},
  notes: {},
  mistakes: {},
  bank: {},
  writing: {},
  grammarDone: {},
  dialoguesDone: {},
  tests: [],
  settings: { newPerDay: 10, direction: "zh-en", showPinyin: true, speed: 0.9, dailyGoal: 30, deck: "hsk-4", targetLevel: 5, examDate: "" },
};

let state: AppState = DEFAULT_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function normalize(parsed: unknown): AppState {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Not a progress file");
  const p = parsed as Partial<AppState>;
  const obj = (v: unknown) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});
  return {
    ...DEFAULT_STATE,
    cards: obj(p.cards) as AppState["cards"],
    log: obj(p.log) as AppState["log"],
    known: obj(p.known) as AppState["known"],
    notes: obj(p.notes) as AppState["notes"],
    mistakes: obj(p.mistakes) as AppState["mistakes"],
    bank: obj(p.bank) as AppState["bank"],
    writing: obj(p.writing) as AppState["writing"],
    grammarDone: obj(p.grammarDone) as AppState["grammarDone"],
    dialoguesDone: obj(p.dialoguesDone) as AppState["dialoguesDone"],
    tests: Array.isArray(p.tests) ? p.tests : [],
    settings: { ...DEFAULT_STATE.settings, ...(obj(p.settings) as Partial<AppState["settings"]>) },
  };
}

function readStorage() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = normalize(JSON.parse(raw));
  } catch {
    /* ignore corrupt storage */
  }
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  readStorage();
  // another tab saved progress: adopt it instead of overwriting it later
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    readStorage();
    listeners.forEach((l) => l());
  });
}

function commit(next: AppState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full / blocked */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useAppState(): AppState {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return state;
    },
    () => DEFAULT_STATE,
  );
}

/** false on the server and during hydration, true afterwards */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// ---------- FSRS helpers ----------
export function toCard(s: StoredCard): Card {
  return { ...s, due: new Date(s.due), last_review: s.last_review ? new Date(s.last_review) : undefined } as Card;
}
function fromCard(c: Card): StoredCard {
  return { ...c, due: c.due.toISOString(), last_review: c.last_review?.toISOString() };
}

export function previewIntervals(id: string, s: AppState): Record<Grade, string> {
  const card = s.cards[id] ? toCard(s.cards[id]) : createEmptyCard();
  const rec = scheduler.repeat(card, new Date());
  const fmt = (c: Card) => {
    const mins = (c.due.getTime() - Date.now()) / 60000;
    if (mins < 60) return `${Math.max(1, Math.round(mins))}m`;
    if (mins < 60 * 24) return `${Math.round(mins / 60)}h`;
    const days = Math.round(mins / 1440);
    return days < 31 ? `${days}d` : `${Math.round(days / 30)}mo`;
  };
  return {
    [Rating.Again]: fmt(rec[Rating.Again].card),
    [Rating.Hard]: fmt(rec[Rating.Hard].card),
    [Rating.Good]: fmt(rec[Rating.Good].card),
    [Rating.Easy]: fmt(rec[Rating.Easy].card),
  } as Record<Grade, string>;
}

export function reviewCard(id: string, rating: Grade) {
  load();
  const existing = state.cards[id];
  const isNew = !existing;
  const card = existing ? toCard(existing) : createEmptyCard();
  const next = scheduler.repeat(card, new Date())[rating].card;
  const day = todayKey();
  const prev = state.log[day] ?? { reviews: 0, newCards: 0, correct: 0 };
  commit({
    ...state,
    cards: { ...state.cards, [id]: fromCard(next) },
    log: {
      ...state.log,
      [day]: {
        ...prev,
        reviews: prev.reviews + 1,
        newCards: prev.newCards + (isNew ? 1 : 0),
        correct: prev.correct + (rating >= Rating.Good ? 1 : 0),
      },
    },
  });
}

/** put words into the review queue right away (bypasses the daily new-card limit) */
export function addCards(ids: string[]) {
  load();
  const cards = { ...state.cards };
  let added = 0;
  for (const id of ids) if (!cards[id]) { cards[id] = fromCard(createEmptyCard()); added++; }
  if (added) commit({ ...state, cards });
  return added;
}

export function updateSettings(patch: Partial<AppState["settings"]>) {
  load();
  commit({ ...state, settings: { ...state.settings, ...patch } });
}
export function markGrammar(id: string) {
  load();
  commit({ ...state, grammarDone: { ...state.grammarDone, [id]: true } });
}
export function saveDialogueScore(id: string, pct: number) {
  load();
  commit({ ...state, dialoguesDone: { ...state.dialoguesDone, [id]: Math.max(pct, state.dialoguesDone[id] ?? 0) } });
}
export function saveTest(r: TestResult) {
  load();
  commit({ ...state, tests: [...state.tests, r] });
}
export function exportData(): string {
  load();
  return JSON.stringify(state, null, 2);
}
export function importData(json: string) {
  commit(normalize(JSON.parse(json)));
}
function bumpLog(patch: { practice?: number }) {
  const day = todayKey();
  const prev = state.log[day] ?? { reviews: 0, newCards: 0, correct: 0 };
  return { ...state.log, [day]: { ...prev, practice: (prev.practice ?? 0) + (patch.practice ?? 0) } };
}
/** credit n practice items (listening, speaking, writing, …) toward the daily goal & streak */
export function logPractice(n = 1) {
  load();
  commit({ ...state, log: bumpLog({ practice: n }) });
}
export function markKnown(ids: string[], known = true) {
  load();
  const next = { ...state.known };
  for (const id of ids) {
    if (known) next[id] = true;
    else delete next[id];
  }
  commit({ ...state, known: next });
}
export function setNote(id: string, note: string) {
  load();
  const notes = { ...state.notes };
  if (note.trim()) notes[id] = note; else delete notes[id];
  commit({ ...state, notes });
}
export function addMistake(key: string, kind: Mistake["kind"]) {
  load();
  const prev = state.mistakes[key];
  commit({ ...state, mistakes: { ...state.mistakes, [key]: { kind, count: (prev?.count ?? 0) + 1, last: new Date().toISOString() } } });
}
export function clearMistake(key: string) {
  load();
  const mistakes = { ...state.mistakes };
  delete mistakes[key];
  commit({ ...state, mistakes });
}
export function addToBank(id: string, w: Omit<BankWord, "added">) {
  load();
  commit({ ...state, bank: { ...state.bank, [id]: { ...w, added: new Date().toISOString() } } });
}
export function removeFromBank(id: string) {
  load();
  const bank = { ...state.bank };
  delete bank[id];
  commit({ ...state, bank });
}
export function saveWriting(ch: string, pct: number) {
  load();
  commit({ ...state, writing: { ...state.writing, [ch]: Math.max(pct, state.writing[ch] ?? 0) } });
}

export function getState(): AppState {
  load();
  return state;
}
/** replace the whole state (used by cloud sync) */
export function replaceState(next: AppState) {
  load();
  commit(normalize(next));
}
export function resetData() {
  commit(DEFAULT_STATE);
}

// ---------- queue / stats ----------
export function buildQueue(
  s: AppState,
  words: { id: string }[],
  opts: { newLimit: number },
): { due: string[]; fresh: string[] } {
  const now = Date.now();
  const due = words
    .filter((w) => s.cards[w.id] && new Date(s.cards[w.id].due).getTime() <= now)
    .sort((a, b) => +new Date(s.cards[a.id].due) - +new Date(s.cards[b.id].due))
    .map((w) => w.id);
  const newToday = s.log[todayKey()]?.newCards ?? 0;
  const room = Math.max(0, opts.newLimit - newToday);
  const fresh = words.filter((w) => !s.cards[w.id] && !s.known[w.id]).slice(0, room).map((w) => w.id);
  return { due, fresh };
}

export function streak(s: AppState): number {
  let n = 0;
  const d = new Date();
  const active = (k: string) => (s.log[k]?.reviews ?? 0) + (s.log[k]?.practice ?? 0) > 0;
  if (!active(todayKey(d))) d.setDate(d.getDate() - 1); // today doesn't break the streak yet
  while (active(todayKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export const isKnown = (c?: StoredCard) => !!c && c.state === State.Review && c.stability >= 7;

/** number of cards due now (optionally limited to a set of ids) */
export function dueCount(s: AppState, ids?: Iterable<string>): number {
  const now = Date.now();
  const list = ids ? [...ids].filter((id) => s.cards[id]) : Object.keys(s.cards);
  return list.filter((id) => new Date(s.cards[id].due).getTime() <= now).length;
}
