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
      ? { reviews: Math.max(x.reviews, l.reviews), newCards: Math.max(x.newCards, l.newCards), correct: Math.max(x.correct, l.correct) }
      : l;
  }

  const dialoguesDone: AppState["dialoguesDone"] = { ...a.dialoguesDone };
  for (const [k, v] of Object.entries(b.dialoguesDone)) dialoguesDone[k] = Math.max(dialoguesDone[k] ?? 0, v);

  const tests = [...a.tests];
  for (const r of b.tests) if (!tests.some((x) => x.date === r.date)) tests.push(r);
  tests.sort((x, y) => t(x.date) - t(y.date));

  // settings: prefer a's (the local device's) values – they're per-device preferences
  return {
    cards,
    log,
    grammarDone: { ...b.grammarDone, ...a.grammarDone },
    dialoguesDone,
    tests,
    settings: { ...b.settings, ...a.settings },
  };
}

/** stable JSON for equality checks */
export function fingerprint(s: AppState): string {
  const sortObj = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).sort(([x], [y]) => (x < y ? -1 : 1)));
  return JSON.stringify({
    cards: sortObj(s.cards),
    log: sortObj(s.log),
    grammarDone: sortObj(s.grammarDone),
    dialoguesDone: sortObj(s.dialoguesDone),
    tests: s.tests,
  });
}
