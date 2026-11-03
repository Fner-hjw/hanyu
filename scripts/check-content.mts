// Validates hand-written/delegated content. Usage: npx tsx scripts/check-content.mts <ccd.json>
import { readFileSync } from "node:fs";
import { GRAMMAR } from "../src/data/grammar.ts";
import { GRAMMAR_MORE } from "../src/data/grammar-more.ts";
import { DIALOGUES } from "../src/data/dialogues.ts";
import { DIALOGUES_MORE } from "../src/data/dialogues-more.ts";
import { READINGS } from "../src/data/readings.ts";
import { EMAILS, PHRASES, MEASURE_WORDS, ETIQUETTE } from "../src/data/toolkit.ts";
import { RADICALS } from "../src/data/radicals.ts";

const problems: string[] = [];
const warn = (m: string) => problems.push(m);
const HAN = /[一-鿿]/;
const asciiInZh = (s: string) => HAN.test(s) && /[一-鿿][,?!:;"]|[,?!:;"][一-鿿]/.test(s);
const zhOk = (where: string, s: string) => { if (asciiInZh(s)) warn(`${where}: ASCII punctuation next to Chinese: ${s.slice(0, 40)}`); };
const mcq = (where: string, options: string[], answer: number) => {
  if (options.length !== 4) warn(`${where}: ${options.length} options`);
  if (answer < 0 || answer >= options.length) warn(`${where}: answer index ${answer} out of range`);
  if (new Set(options).size !== options.length) warn(`${where}: duplicate options`);
  options.forEach((o) => zhOk(where, o));
};
const dist = (name: string, answers: number[]) => {
  const c = [0, 0, 0, 0];
  answers.forEach((a) => c[a]++);
  console.log(`${name}: answer positions ${c.join("/")}`);
  if (Math.max(...c) > answers.length * 0.45) warn(`${name}: answers clustered ${c.join("/")}`);
};

// ---- grammar
const gids = new Set(GRAMMAR.map((g) => g.id));
const ga: number[] = [];
for (const g of GRAMMAR_MORE) {
  if (gids.has(g.id)) warn(`grammar dup id ${g.id}`); gids.add(g.id);
  if (g.examples.length < 3) warn(`${g.id}: ${g.examples.length} examples`);
  if (g.exercises.length < 2) warn(`${g.id}: ${g.exercises.length} exercises`);
  g.examples.forEach((e) => zhOk(g.id, e.zh));
  g.exercises.forEach((x, i) => { mcq(`${g.id}#${i}`, x.options, x.answer); zhOk(g.id, x.prompt); ga.push(x.answer);
    if (!x.prompt.includes("___") && !/[？?]$/.test(x.prompt)) warn(`${g.id}#${i}: prompt has no blank`); });
}
dist(`grammar (${GRAMMAR_MORE.length})`, ga);

// ---- dialogues
const dids = new Set(DIALOGUES.map((d) => d.id));
const da: number[] = [];
for (const d of DIALOGUES_MORE) {
  if (dids.has(d.id)) warn(`dialogue dup id ${d.id}`); dids.add(d.id);
  if (d.lines.length < 8) warn(`${d.id}: only ${d.lines.length} lines`);
  if (d.questions.length !== 3) warn(`${d.id}: ${d.questions.length} questions`);
  d.lines.forEach((l, i) => { zhOk(`${d.id} L${i}`, l.zh); if (!l.en) warn(`${d.id} L${i}: no English`); });
  d.questions.forEach((q, i) => { mcq(`${d.id} Q${i}`, q.options, q.answer); da.push(q.answer); });
}
dist(`dialogues (${DIALOGUES_MORE.length})`, da);

// ---- readings
const LEN: Record<number, [number, number]> = { 2: [55, 110], 3: [95, 180], 4: [150, 275], 5: [250, 440], 6: [370, 620] };
const ra: number[] = [];
const rids = new Set<string>();
for (const r of READINGS) {
  if (rids.has(r.id)) warn(`reading dup id ${r.id}`); rids.add(r.id);
  const n = [...r.text].filter((c) => HAN.test(c)).length;
  const [lo, hi] = LEN[r.level];
  if (n < lo || n > hi) warn(`${r.id}: ${n} hanzi outside L${r.level} range ${lo}-${hi}`);
  zhOk(r.id, r.text);
  r.questions.forEach((q, i) => { mcq(`${r.id} Q${i}`, q.options, q.answer); ra.push(q.answer); });
  r.glossary.forEach((g) => { if (!r.text.includes(g.zh)) warn(`${r.id}: glossary word ${g.zh} not in text`); });
}
dist(`readings (${READINGS.length}, ${READINGS.filter((r) => r.work).length} work)`, ra);

// ---- toolkit
console.log(`toolkit: ${EMAILS.length} emails, ${PHRASES.length} phrase groups (${PHRASES.reduce((a, p) => a + p.phrases.length, 0)} phrases), ${MEASURE_WORDS.length} measure words, ${ETIQUETTE.length} tips`);
EMAILS.forEach((e) => zhOk(e.id, e.zh));
PHRASES.forEach((g) => g.phrases.forEach((p) => zhOk(g.id, p.zh)));

// ---- pinyin checks against CC-CEDICT readings (from the dictionary shards)
const shard = new Map<number, Record<string, [string, string][]>>();
const ced = (w: string) => {
  const n = w.codePointAt(0)! % 64;
  if (!shard.has(n)) shard.set(n, JSON.parse(readFileSync(`public/dict/${n}.json`, "utf8")));
  return (shard.get(n)![w] ?? []).map(([p]) => p.replace(/\s/g, "").toLowerCase());
};
for (const m of MEASURE_WORDS) {
  const r = ced(m.mw);
  if (!r.includes(m.py.toLowerCase())) warn(`measure word ${m.mw}: py "${m.py}" not among CEDICT readings ${JSON.stringify(r)}`);
  m.examples.forEach((e) => { zhOk(`mw ${m.mw}`, e.zh); if (!e.zh.includes(m.mw)) warn(`mw ${m.mw}: example lacks it: ${e.zh}`); });
}

// ---- radicals: pinyin + examples really contain the radical (recursive decomposition)
const ccdPath = process.argv[2];
const ccd = JSON.parse(readFileSync(ccdPath, "utf8")) as { rows: (string | number)[][] };
const comp = new Map(ccd.rows.map((r) => [r[0] as string, [r[3] as string, r[5] as string].filter(Boolean)]));
const parts = (c: string, depth = 0, acc = new Set<string>()): Set<string> => {
  if (depth > 6) return acc;
  for (const p of comp.get(c) ?? []) for (const ch of p.replace(/\*/g, "")) { if (!acc.has(ch)) { acc.add(ch); parts(ch, depth + 1, acc); } }
  return acc;
};
const rset = new Set<string>();
let unverified = 0;
for (const r of RADICALS) {
  if (rset.has(r.r)) warn(`radical dup ${r.r}`); rset.add(r.r);
  const readings = ced(r.r);
  if (readings.length && !readings.includes(r.py.toLowerCase())) warn(`radical ${r.r}: py "${r.py}" vs CEDICT ${JSON.stringify(readings)}`);
  const forms = new Set([r.r, ...[...(r.forms ?? "")].filter((c) => c.trim() && c !== "、" && c !== ",")]);
  for (const ex of r.examples) {
    const ps = parts(ex);
    if (ex === r.r || [...forms].some((f) => ps.has(f))) continue;
    unverified++;
    console.log(`  ? radical ${r.r}${r.forms ? "(" + r.forms + ")" : ""}: ${ex} — decomposition ${[...ps].slice(0, 8).join("")}`);
  }
}
console.log(`radicals: ${RADICALS.length}, ${unverified} example chars not confirmed by decomposition (listed above, review manually)`);

console.log(problems.length ? `\n${problems.length} problems:\n- ` + problems.join("\n- ") : "\nno structural problems");
