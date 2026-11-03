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

export type AppState = {
  cards: Record<string, StoredCard>;
  log: Record<string, { reviews: number; newCards: number; correct: number }>;
  grammarDone: Record<string, boolean>;
  dialoguesDone: Record<string, number>; // best comprehension score %
  tests: TestResult[];
  settings: {
    newPerDay: number;
    direction: "zh-en" | "en-zh" | "listen";
    showPinyin: boolean;
    speed: number;
  };
};

export const DEFAULT_STATE: AppState = {
  cards: {},
  log: {},
  grammarDone: {},
  dialoguesDone: {},
  tests: [],
  settings: { newPerDay: 10, direction: "zh-en", showPinyin: true, speed: 0.9 },
};

let state: AppState = DEFAULT_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = { ...DEFAULT_STATE, ...parsed, settings: { ...DEFAULT_STATE.settings, ...parsed.settings } };
    }
  } catch {
    /* ignore corrupt storage */
  }
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
        reviews: prev.reviews + 1,
        newCards: prev.newCards + (isNew ? 1 : 0),
        correct: prev.correct + (rating >= Rating.Good ? 1 : 0),
      },
    },
  });
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
  const parsed = JSON.parse(json);
  commit({ ...DEFAULT_STATE, ...parsed, settings: { ...DEFAULT_STATE.settings, ...parsed.settings } });
}
export function getState(): AppState {
  load();
  return state;
}
/** replace the whole state (used by cloud sync) */
export function replaceState(next: AppState) {
  load();
  commit({ ...DEFAULT_STATE, ...next, settings: { ...DEFAULT_STATE.settings, ...next.settings } });
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
  const fresh = words.filter((w) => !s.cards[w.id]).slice(0, room).map((w) => w.id);
  return { due, fresh };
}

export function streak(s: AppState): number {
  let n = 0;
  const d = new Date();
  if (!s.log[todayKey(d)]?.reviews) d.setDate(d.getDate() - 1); // today doesn't break the streak yet
  while (s.log[todayKey(d)]?.reviews) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export const isKnown = (c?: StoredCard) => !!c && c.state === State.Review && c.stability >= 7;
