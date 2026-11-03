// Builds the learning datasets in public/data/ from open sources.
// Usage: node scripts/build-data.mjs <hsk3.1 vocabulary.json> <hsk sentences.json> <ccd.json> <cedict.json>
// Sources: hsk3.1-syllabus (MIT) · no7z/hsk-sentences-audio (CC BY-SA 4.0) · Wikimedia CCD (MIT pkg) · CC-CEDICT (CC BY-SA 4.0)
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { convert } from "pinyin-pro";

const [hskPath, sentPath, ccdPath, cedPath] = process.argv.slice(2);
if (!cedPath) throw new Error("usage: build-data.mjs hsk sentences ccd cedict");
const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const vocab = read(hskPath), sentences = read(sentPath), ccd = read(ccdPath), cedict = read(cedPath);

const LV = { "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7-9": 7 };
const POS = { 名: "n.", 动: "v.", 形: "adj.", 副: "adv.", 数: "num.", 量: "mw.", 代: "pron.", 介: "prep.", 连: "conj.", 助: "part.", 叹: "interj.", 后缀: "suffix", 前缀: "prefix", 数量: "num-mw", 拟声: "onom." };

// ---------- CC-CEDICT index ----------
const skip = /^(surname |variant of|old variant|erhua variant|see |abbr\. for|CL:|used in|Taiwan pr\.|also pr\.)/i;
const clean = (d) => d.replace(/\s*CL:[^;]*/g, "").replace(/\[[^\]]*\]/g, "").trim();
const normPy = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/u:/g, "u").replace(/[^a-z]/g, "");
const ced = new Map(); // zh -> [{py, defs}]
for (const e of cedict) {
  const defs = e.english.filter((d) => !skip.test(d)).map(clean).filter(Boolean);
  if (!defs.length) continue;
  const arr = ced.get(e.simplified) ?? [];
  arr.push({ py: normPy(e.pinyin), raw: e.pinyin, defs });
  ced.set(e.simplified, arr);
}
const meaning = (zh, pinyin) => {
  const list = ced.get(zh);
  if (!list) return "";
  const want = normPy(pinyin);
  const hit = list.find((x) => x.py === want) ?? list[0];
  return hit.defs.slice(0, 3).join("; ").slice(0, 110);
};

// ---------- Sentences ----------
const sents = sentences.map((s) => ({
  id: s.id,
  l: s.hsk_level,
  tp: s.topic,
  ty: s.sentence_type,
  z: s.chinese,
  p: s.pinyin,
  e: s.translation.en,
  k: s.tokens.map((t) => [t.word, t.pinyin, (t.gloss_en ?? "").slice(0, 60)]),
  g: s.grammar_points ?? [],
}));
const byToken = new Map();
for (const s of sents) for (const [w] of s.k) (byToken.get(w) ?? byToken.set(w, []).get(w)).push(s);

// ---------- Words ----------
const words = new Map(); // key zh|py
for (const entry of vocab) {
  const rows = Array.isArray(entry[0]) ? entry : [entry];
  for (const [seq, lvl, zh, py, pos] of rows) {
    const key = `${zh}|${py}`;
    const level = LV[lvl];
    const w = words.get(key);
    if (!w) words.set(key, { seq, l: level, z: zh, p: py, t: new Set(pos.map((x) => POS[x] ?? x)) });
    else {
      w.l = Math.min(w.l, level);
      pos.forEach((x) => w.t.add(POS[x] ?? x));
    }
  }
}
const usedIds = new Set();
const out = [...words.values()].sort((a, b) => a.l - b.l || a.seq - b.seq);
let noMeaning = 0, withEx = 0;
for (const w of out) {
  let id = `h${w.seq}`;
  while (usedIds.has(id)) id += "b";
  usedIds.add(id);
  w.i = id;
  w.e = meaning(w.z, w.p);
  if (!w.e) noMeaning++;
  w.t = [...w.t];
  const cands = (byToken.get(w.z) ?? [])
    .filter((s) => s.z.length >= 4 && s.z.length <= 34)
    .sort((a, b) => Math.abs(a.l - w.l) - Math.abs(b.l - w.l) || a.z.length - b.z.length);
  w.x = cands.slice(0, 2).map((s) => [s.id, s.z, s.p, s.e]);
  if (w.x.length) withEx++;
  delete w.seq;
}

// ---------- Characters ----------
const ccdMap = new Map(ccd.rows.map((r) => [r[0], r]));
const chars = {};
for (const w of out) {
  for (const c of w.z) {
    if (!/[\u4e00-\u9fff]/.test(c)) continue;
    const cur = chars[c];
    if (cur) { cur[0] = Math.min(cur[0], w.l); continue; }
    const single = ced.get(c);
    const r = ccdMap.get(c);
    // [level, pinyin, meaning, strokes, composition, left, right]
    chars[c] = [
      w.l,
      single ? "" : "",
      single ? single[0].defs.slice(0, 2).join("; ").slice(0, 70) : "",
      r?.[1] ?? 0,
      r?.[2] ?? "",
      r?.[3] ?? "",
      r?.[5] ?? "",
    ];
  }
}
// pinyin for characters: use the pinyin of the lowest-level single-character word, else first CEDICT reading
const singlePy = new Map();
for (const w of out) if ([...w.z].length === 1 && !singlePy.has(w.z)) singlePy.set(w.z, w.p);
for (const [c, row] of Object.entries(chars)) {
  row[1] = singlePy.get(c) ?? "";
  if (!row[1] && ced.get(c)) {
    try { row[1] = convert(ced.get(c)[0].raw.replace(/u:/g, "ü").replace(/5/g, "").toLowerCase()); } catch { /* keep empty */ }
  }
  if (row[1]) row[2] = meaning(c, row[1]).slice(0, 70) || row[2];
}

// ---------- Write ----------
rmSync("public/data", { recursive: true, force: true });
mkdirSync("public/data", { recursive: true });
const write = (name, data) => { const j = JSON.stringify(data); writeFileSync(`public/data/${name}`, j); return j.length; };
let size = 0;
for (let l = 1; l <= 7; l++) size += write(`words-${l}.json`, out.filter((w) => w.l === l).map(({ i, l: lv, z, p, t, e, x }) => ({ i, l: lv, z, p, t, e, x })));
for (let l = 1; l <= 6; l++) size += write(`sentences-${l}.json`, sents.filter((s) => s.l === l));
size += write("chars.json", chars);
writeFileSync("public/data/ATTRIBUTION.txt",
`Vocabulary list: HSK 3.1 syllabus (hsk3.1-syllabus, MIT).
Meanings: CC-CEDICT (c) MDBG & contributors, CC BY-SA 4.0.
Sentences & audio: no7z/hsk-sentences-audio, CC BY-SA 4.0 (https://github.com/no7z/hsk-sentences-audio/blob/main/ATTRIBUTION.md).
Character decomposition: Wikimedia Commons CCD table.
Derived data in this folder is shared under CC BY-SA 4.0.
`);
console.log(`${out.length} words (${noMeaning} without meaning, ${withEx} with examples), ${sents.length} sentences, ${Object.keys(chars).length} chars, ${(size / 1e6).toFixed(1)} MB`);
