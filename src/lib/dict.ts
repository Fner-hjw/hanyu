"use client";

/** Lazy CC-CEDICT lookup. Data is sharded in /public/dict/N.json (see scripts/build-dict.mjs). */
export type DictEntry = [pinyin: string, meaning: string];
type Shard = Record<string, DictEntry[]>;

const SHARDS = 64;
const cache = new Map<number, Promise<Shard>>();

function shard(n: number): Promise<Shard> {
  let p = cache.get(n);
  if (!p) {
    p = fetch(`/dict/${n}.json`)
      .then((r) => (r.ok ? (r.json() as Promise<Shard>) : {}))
      .catch(() => ({}) as Shard);
    cache.set(n, p);
  }
  return p;
}

export async function lookup(word: string): Promise<DictEntry[]> {
  if (!word) return [];
  const s = await shard(word.codePointAt(0)! % SHARDS);
  return s[word] ?? [];
}

/** Look the word up; if missing, fall back to its individual characters. */
export async function lookupWithFallback(
  word: string,
): Promise<{ word: string; entries: DictEntry[] }[]> {
  const direct = await lookup(word);
  if (direct.length) return [{ word, entries: direct }];
  const chars = [...word];
  if (chars.length < 2) return [];
  const parts = await Promise.all(chars.map(async (c) => ({ word: c, entries: await lookup(c) })));
  return parts.filter((p) => p.entries.length);
}

import type { Token } from "./text";
import { VOCAB_BY_ZH } from "@/data/vocab";

/** Merge adjacent Chinese tokens into longer words when CC-CEDICT knows the combination. */
export async function refineTokens(tokens: Token[]): Promise<Token[]> {
  const out: Token[] = [];
  for (let i = 0; i < tokens.length; ) {
    let merged = false;
    if (tokens[i].isZh) {
      for (let n = Math.min(3, tokens.length - i); n >= 2; n--) {
        const slice = tokens.slice(i, i + n);
        if (!slice.every((t) => t.isZh)) continue;
        const text = slice.map((t) => t.text).join("");
        if ((await lookup(text)).length) {
          out.push({ text, py: slice.map((t) => t.py).join(" "), word: VOCAB_BY_ZH.get(text), isZh: true });
          i += n;
          merged = true;
          break;
        }
      }
    }
    if (!merged) out.push(tokens[i++]);
  }
  return out;
}
