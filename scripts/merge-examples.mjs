// Adds hand-written example sentences (src/data/examples-extra.json, reviewed) to words that have none.
// Safe to re-run; also runs at the end of build-data.mjs. Usage: node scripts/merge-examples.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { pinyin } from "pinyin-pro";

const extra = JSON.parse(readFileSync("src/data/examples-extra.json", "utf8")); // { wordId: [zh, en] }
const py = (zh) => pinyin(zh, { nonZh: "removed" }).replace(/\s+/g, " ").trim();
let added = 0;
for (let l = 1; l <= 7; l++) {
  const file = `public/data/words-${l}.json`;
  const words = JSON.parse(readFileSync(file, "utf8"));
  let changed = false;
  for (const w of words) {
    const e = extra[w.i];
    if (!e || w.x.length) continue;
    // no sentence id: these have no recording, so the app reads them with text-to-speech
    w.x = [["", e[0], py(e[0]), e[1]]];
    added++;
    changed = true;
  }
  if (changed) writeFileSync(file, JSON.stringify(words));
}
console.log(`added ${added} example sentences (${Object.keys(extra).length} available)`);
