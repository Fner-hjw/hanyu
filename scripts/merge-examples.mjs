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
    // fill words with no example, and refresh ones this script added before (they have no sentence id)
    const ours = w.x.length === 1 && w.x[0][0] === "";
    if (!e || (w.x.length && !ours)) continue;
    if (ours && w.x[0][1] === e[0] && w.x[0][3] === e[1]) continue;
    // no sentence id: these have no recording, so the app reads them with text-to-speech
    w.x = [["", e[0], py(e[0]), e[1]]];
    added++;
    changed = true;
  }
  if (changed) writeFileSync(file, JSON.stringify(words));
}
console.log(`added or updated ${added} example sentences (${Object.keys(extra).length} available)`);
