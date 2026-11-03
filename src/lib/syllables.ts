import { pinyin } from "pinyin-pro";
import type { CharInfo, Word } from "./data";
import { parsePinyin } from "./pinyin";

export const INITIALS = ["b", "p", "m", "f", "d", "t", "n", "l", "g", "k", "h", "j", "q", "x", "zh", "ch", "sh", "r", "z", "c", "s", "y", "w", ""] as const;
const TONE_MARKS = /[̄́̌̀]/g;

/** "lǜ" → "lü" (keeps ü), "zhōng" → "zhong" */
export const toneless = (py: string) => py.normalize("NFD").replace(TONE_MARKS, "").normalize("NFC").toLowerCase();
export const initialOf = (syl: string) => (/^(zh|ch|sh)/.test(syl) ? syl.slice(0, 2) : /^[bpmfdtnlgkhjqxrzcsyw]/.test(syl) ? syl[0] : "");
export const toneOf = (py: string) => parsePinyin(py).tones[0] ?? 0;

export type SylEntry = { syl: string; tones: Partial<Record<1 | 2 | 3 | 4, { ch: string; py: string; level: number }>> };

/** Single-reading characters only, so browser TTS can't pick the wrong pronunciation. */
export function isUnambiguous(ch: string) {
  return pinyin(ch, { multiple: true, type: "array" }).length === 1;
}

export function buildSyllables(chars: Record<string, CharInfo>): Map<string, SylEntry> {
  const map = new Map<string, SylEntry>();
  for (const [ch, [level, py]] of Object.entries(chars)) {
    if (!py || /\s/.test(py) || !isUnambiguous(ch)) continue;
    const tone = toneOf(py) as 1 | 2 | 3 | 4;
    if (!tone) continue;
    const syl = toneless(py);
    const e = map.get(syl) ?? { syl, tones: {} };
    const cur = e.tones[tone];
    if (!cur || level < cur.level) e.tones[tone] = { ch, py, level };
    map.set(syl, e);
  }
  return map;
}

/** two-syllable words with two full tones, for tone-pair drills */
export function tonePairWords(words: Word[]): (Word & { pattern: string })[] {
  return words
    .filter((w) => [...w.zh].length === 2 && !/\s/.test(w.zh))
    .map((w) => ({ ...w, pattern: parsePinyin(w.py).tones.join("-") }))
    .filter((w) => /^[1-4]-[1-4]$/.test(w.pattern));
}

const CONTRASTS: [RegExp, string, string][] = [
  [/^zh/, "zh", "z"], [/^ch/, "ch", "c"], [/^sh/, "sh", "s"], [/^n(?!g)/, "n", "l"],
  [/ang$/, "ang", "an"], [/eng$/, "eng", "en"], [/ing$/, "ing", "in"], [/iang$/, "iang", "ian"],
];
export const CONTRAST_LABELS = ["zh / z", "ch / c", "sh / s", "n / l", "an / ang", "en / eng", "in / ing", "ian / iang"];

/** pairs of real syllables (same tone) differing only in one classic contrast */
export function minimalPairs(map: Map<string, SylEntry>) {
  const out: { label: string; a: { ch: string; py: string }; b: { ch: string; py: string } }[] = [];
  for (const [syl, e] of map) {
    CONTRASTS.forEach(([re, from, to], ci) => {
      if (!re.test(syl)) return;
      const other = re.source.endsWith("$") ? syl.slice(0, -from.length) + to : to + syl.slice(from.length);
      const o = map.get(other);
      if (!o) return;
      for (const t of [1, 2, 3, 4] as const) {
        const x = e.tones[t], y = o.tones[t];
        if (x && y) { out.push({ label: CONTRAST_LABELS[ci], a: { ch: x.ch, py: x.py }, b: { ch: y.ch, py: y.py } }); break; }
      }
    });
  }
  return out;
}
