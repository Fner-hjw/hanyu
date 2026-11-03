// Usage: node scripts/build-dict.mjs /path/to/cedict.json
// Builds sharded lookup files in public/dict/ from the CC-CEDICT JSON (cedict-json package).
// CC-CEDICT © MDBG, licensed CC BY-SA 4.0 – https://cc-cedict.org
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { convert } from "pinyin-pro";

const SHARDS = 64;
const input = process.argv[2];
if (!input) throw new Error("pass path to cedict.json");
const entries = JSON.parse(readFileSync(input, "utf8"));

const skip = /^(surname |variant of|old variant|erhua variant|see |abbr\. for|CL:|used in|Taiwan pr\.|also pr\.)/i;
const clean = (d) => d.replace(/\s*CL:[^;]*/g, "").replace(/\[[^\]]*\]/g, "").trim();

/** @type {Map<string, [string, string][]>} */
const map = new Map();
for (const e of entries) {
  const defs = e.english.filter((d) => !skip.test(d)).map(clean).filter(Boolean).slice(0, 4);
  if (!defs.length) continue;
  let py;
  try {
    py = convert(e.pinyin.replace(/u:/g, "ü").replace(/5/g, "").replace(/\s+/g, " ").toLowerCase());
  } catch {
    py = e.pinyin;
  }
  const arr = map.get(e.simplified) ?? [];
  if (arr.length < 4) arr.push([py, defs.join("; ").slice(0, 140)]);
  map.set(e.simplified, arr);
}

rmSync("public/dict", { recursive: true, force: true });
mkdirSync("public/dict", { recursive: true });
const shards = Array.from({ length: SHARDS }, () => ({}));
for (const [k, v] of map) shards[k.codePointAt(0) % SHARDS][k] = v;
let total = 0;
shards.forEach((s, i) => {
  const json = JSON.stringify(s);
  total += json.length;
  writeFileSync(`public/dict/${i}.json`, json);
});
writeFileSync(
  "public/dict/LICENSE.txt",
  "Dictionary data derived from CC-CEDICT (https://cc-cedict.org), (c) MDBG and contributors,\nlicensed under CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/\nThis derived data is shared under the same license.\n",
);
console.log(`${map.size} headwords, ${SHARDS} shards, ${(total / 1e6).toFixed(1)} MB total`);
