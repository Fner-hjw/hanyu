// Usage: npx tsx scripts/check-vocab.mts   (or node --experimental-strip-types)
import { readFileSync } from "node:fs";
import { pinyin } from "pinyin-pro";
import { VOCAB } from "../src/data/vocab.ts";

const norm = (s: string) =>
  s.toLowerCase().normalize("NFC").replace(/[\s'’\-…·]/g, "").replace(/…/g, "");
const seen = new Map<string, string>();
let dup = 0, bad = 0;
const shardCache = new Map<number, Record<string, [string, string][]>>();
const cedict = (w: string) => {
  const n = w.codePointAt(0)! % 64;
  if (!shardCache.has(n)) shardCache.set(n, JSON.parse(readFileSync(`public/dict/${n}.json`, "utf8")));
  return shardCache.get(n)![w] ?? [];
};

for (const w of VOCAB) {
  if (seen.has(w.zh)) { console.log(`DUP ${w.zh} (${seen.get(w.zh)} & ${w.id})`); dup++; }
  seen.set(w.zh, w.id);
  if (!/[一-鿿]/.test(w.zh)) continue;
  const mine = norm(w.py);
  const auto = norm(pinyin(w.zh.replace(/…/g, ""), { toneType: "symbol" }));
  const ce = cedict(w.zh).map(([p]) => norm(p));
  if (mine !== auto && !ce.includes(mine)) {
    bad++;
    console.log(`PY? ${w.id} ${w.zh}: mine="${w.py}" pinyin-pro="${auto}" cedict=${JSON.stringify(ce)}`);
  }
}
console.log(`${VOCAB.length} words, ${dup} duplicates, ${bad} pinyin mismatches`);
