import type { AppState, StoredCard } from "./store";

const t = (s?: string) => (s ? new Date(s).getTime() : 0);

/** the more recently reviewed card wins; more reps breaks ties */
function pickCard(a: StoredCard, b: StoredCard): StoredCard {
  const la = t(a.last_review), lb = t(b.last_review);
  if (la !== lb) return la > lb ? a : b;
  return a.reps >= b.reps ? a : b;
}

/**
 * Commutative, associative, idempotent merge of two progress snapshots, so
 * devices converge regardless of sync order.
 */
export function mergeStates(a: AppState, b: AppState): AppState {
  const cards: Record<string, StoredCard> = { ...a.cards };
  for (const [id, c] of Object.entries(b.cards)) cards[id] = cards[id] ? pickCard(cards[id], c) : c;

  const log: AppState["log"] = { ...a.log };
  for (const [day, l] of Object.entries(b.log)) {
    const x = log[day];
    log[day] = x
      ? {
          reviews: Math.max(x.reviews, l.reviews),
          newCards: Math.max(x.newCards, l.newCards),
          correct: Math.max(x.correct, l.correct),
          practice: Math.max(x.practice ?? 0, l.practice ?? 0),
        }
      : l;
  }

  const dialoguesDone: AppState["dialoguesDone"] = { ...a.dialoguesDone };
  for (const [k, v] of Object.entries(b.dialoguesDone)) dialoguesDone[k] = Math.max(dialoguesDone[k] ?? 0, v);

  const readingsDone: AppState["readingsDone"] = { ...a.readingsDone };
  for (const [k, v] of Object.entries(b.readingsDone ?? {})) readingsDone[k] = Math.max(readingsDone[k] ?? 0, v);

  const tests = [...a.tests];
  for (const r of b.tests) if (!tests.some((x) => x.date === r.date)) tests.push(r);
  tests.sort((x, y) => t(x.date) - t(y.date));

  const mistakes: AppState["mistakes"] = { ...a.mistakes };
  for (const [k, m] of Object.entries(b.mistakes)) {
    const x = mistakes[k];
    mistakes[k] = x ? { ...(t(x.last) >= t(m.last) ? x : m), count: Math.max(x.count, m.count) } : m;
  }
  const writing: AppState["writing"] = { ...a.writing };
  for (const [k, v] of Object.entries(b.writing)) writing[k] = Math.max(writing[k] ?? 0, v);

  // settings: prefer a's (the local device's) values – they're per-device preferences
  return {
    cards,
    log,
    grammarDone: { ...b.grammarDone, ...a.grammarDone },
    known: { ...b.known, ...a.known },
    notes: { ...b.notes, ...a.notes },
    mistakes,
    bank: { ...b.bank, ...a.bank },
    writing,
    dialoguesDone,
    readingsDone,
    tests,
    settings: { ...b.settings, ...a.settings },
  };
}

/** stable JSON for equality checks */
export function fingerprint(s: AppState): string {
  const sortObj = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).sort(([x], [y]) => (x < y ? -1 : 1)));
  return JSON.stringify({
    cards: sortObj(s.cards),
    log: sortObj(Object.fromEntries(Object.entries(s.log).map(([k, l]) => [k, { ...l, practice: l.practice ?? 0 }]))),
    grammarDone: sortObj(s.grammarDone),
    known: sortObj(s.known),
    notes: sortObj(s.notes),
    mistakes: sortObj(s.mistakes),
    bank: sortObj(s.bank),
    writing: sortObj(s.writing),
    dialoguesDone: sortObj(s.dialoguesDone),
    readingsDone: sortObj(s.readingsDone ?? {}),
    tests: s.tests,
  });
}
