import type { GrammarPoint } from "./types";
import { GRAMMAR } from "./grammar";
import { GRAMMAR_MORE } from "./grammar-more";

/** All grammar points, ordered by HSK level (stable within a level). */
export const ALL_GRAMMAR: GrammarPoint[] = [...GRAMMAR, ...GRAMMAR_MORE]
  .map((g, i) => ({ g, i }))
  .sort((a, b) => a.g.level - b.g.level || a.i - b.i)
  .map((x) => x.g);

export const GRAMMAR_CATEGORIES: GrammarPoint["category"][] = [...new Set(ALL_GRAMMAR.map((g) => g.category))];
