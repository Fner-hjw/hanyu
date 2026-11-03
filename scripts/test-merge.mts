import assert from "node:assert/strict";
import { mergeStates, fingerprint } from "../src/lib/merge.ts";
import { DEFAULT_STATE, type AppState, type StoredCard } from "../src/lib/store.ts";

const card = (last: string, reps: number, due = "2026-12-01T00:00:00.000Z"): StoredCard =>
  ({ due, stability: 5, difficulty: 5, elapsed_days: 0, scheduled_days: 1, reps, lapses: 0, learning_steps: 0, state: 2, last_review: last }) as StoredCard;
const S = (p: Partial<AppState>): AppState => ({ ...DEFAULT_STATE, ...p });

const phone = S({ cards: { w1: card("2026-11-02T10:00:00Z", 3), w2: card("2026-11-01T10:00:00Z", 1) }, log: { "2026-11-02": { reviews: 10, newCards: 5, correct: 8 } }, grammarDone: { g1: true }, dialoguesDone: { d1: 50 } });
const laptop = S({ cards: { w1: card("2026-11-03T09:00:00Z", 4), w3: card("2026-11-03T09:00:00Z", 1) }, log: { "2026-11-02": { reviews: 12, newCards: 5, correct: 6 }, "2026-11-03": { reviews: 4, newCards: 0, correct: 4 } }, grammarDone: { g2: true }, dialoguesDone: { d1: 80, d2: 60 } });

const m = mergeStates(phone, laptop);
assert.equal(m.cards.w1.reps, 4, "newer review wins");
assert.ok(m.cards.w2 && m.cards.w3, "union of cards");
assert.equal(m.log["2026-11-02"].reviews, 12, "max log per day");
assert.deepEqual(Object.keys(m.grammarDone).sort(), ["g1", "g2"]);
assert.equal(m.dialoguesDone.d1, 80);
assert.equal(fingerprint(mergeStates(phone, laptop)), fingerprint(mergeStates(laptop, phone)), "commutative");
assert.equal(fingerprint(mergeStates(m, laptop)), fingerprint(m), "idempotent");
assert.equal(fingerprint(mergeStates(DEFAULT_STATE, phone)), fingerprint(phone), "empty local adopts remote");
const t1 = { date: "2026-11-01T00:00:00Z", estimated: 4, bySection: {}, byLevel: {} };
assert.equal(mergeStates(S({ tests: [t1] }), S({ tests: [t1] })).tests.length, 1, "tests deduped");
const k1 = mergeStates(S({ known: { h1: true } }), S({ known: { h2: true } }));
assert.deepEqual(Object.keys(k1.known).sort(), ["h1", "h2"], "known union");
const mm = mergeStates(S({ mistakes: { h1: { kind: "word", count: 2, last: "2026-11-01T00:00:00Z" } } }), S({ mistakes: { h1: { kind: "word", count: 1, last: "2026-11-02T00:00:00Z" } } }));
assert.equal(mm.mistakes.h1.count, 2); assert.equal(mm.mistakes.h1.last, "2026-11-02T00:00:00Z");
assert.equal(mergeStates(S({ writing: { 好: 70 } }), S({ writing: { 好: 90 } })).writing["好"], 90);
assert.equal(mergeStates(S({ readingsDone: { r1: 50 } }), S({ readingsDone: { r1: 75, r2: 100 } })).readingsDone.r1, 75);
console.log("merge tests passed");
