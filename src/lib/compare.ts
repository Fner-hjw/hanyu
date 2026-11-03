import { pinyin } from "pinyin-pro";
import { parsePinyin } from "./pinyin";

export type Mark = "ok" | "near" | "miss";
export type Compared = { chars: { ch: string; mark: Mark }[]; score: number; extra: number };

const HAN = /[一-鿿]/;
const PUNCT = /[\s，。？！、；：“”‘’（）《》…—,.?!;:'"()\-]/g;
const clean = (s: string) => s.replace(PUNCT, "");

/** toneless pinyin per character, computed in context so polyphones are right */
function syllables(s: string): string[] {
  return pinyin(s, { type: "array", toneType: "none", nonZh: "consecutive" }).map((x) => x.replace(/ü/g, "v").toLowerCase());
}

/**
 * Align the target sentence with what the learner produced (speech transcript or typed hanzi).
 * Identical characters are "ok"; homophones (same toneless syllable — typical speech-recognition
 * substitutions like 在/再) are "near"; anything else is "miss".
 */
export function compareHanzi(target: string, said: string): Compared {
  const t = [...clean(target)], s = [...clean(said)];
  const tp = syllables(t.join("")), sp = syllables(s.join(""));
  const n = t.length, m = s.length;
  const w = (i: number, j: number) => (t[i] === s[j] ? 2 : HAN.test(t[i]) && tp[i] && tp[i] === sp[j] ? 1.4 : 0);
  // weighted LCS
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--) {
      const k = w(i, j);
      dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1], k ? k + dp[i + 1][j + 1] : 0);
    }
  const marks: Mark[] = new Array(n).fill("miss");
  let used = 0;
  for (let i = 0, j = 0; i < n && j < m; ) {
    const k = w(i, j);
    if (k && dp[i][j] === k + dp[i + 1][j + 1]) { marks[i] = k === 2 ? "ok" : "near"; i++; j++; used++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  const ok = marks.filter((x) => x === "ok").length, near = marks.filter((x) => x === "near").length;
  return { chars: t.map((ch, i) => ({ ch, mark: marks[i] })), score: n ? Math.round(((ok + 0.75 * near) / n) * 100) : 0, extra: Math.max(0, m - used) };
}

/** Dictation typed in pinyin (tones optional): letter-level alignment, reported per target character. */
export function comparePinyin(target: string, typed: string): Compared {
  const t = [...clean(target)];
  const tp = syllables(t.join(""));
  const letters = parsePinyin(typed).letters;
  const flat: { c: string; idx: number }[] = [];
  tp.forEach((syl, idx) => { if (HAN.test(t[idx])) for (const c of syl) flat.push({ c, idx }); });
  const n = flat.length, m = letters.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = flat[i].c === letters[j] ? 1 + dp[i + 1][j + 1] : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const hit = new Array(n).fill(false);
  for (let i = 0, j = 0; i < n && j < m; ) {
    if (flat[i].c === letters[j] && dp[i][j] === 1 + dp[i + 1][j + 1]) { hit[i] = true; i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  const per = new Map<number, { got: number; all: number }>();
  flat.forEach((f, i) => { const p = per.get(f.idx) ?? { got: 0, all: 0 }; p.all++; if (hit[i]) p.got++; per.set(f.idx, p); });
  const chars = t.map((ch, i) => {
    const p = per.get(i);
    const mark: Mark = !p ? "ok" : p.got === p.all ? "ok" : p.got / p.all >= 0.5 ? "near" : "miss";
    return { ch, mark };
  });
  const han = chars.filter((_, i) => per.has(i));
  const ok = han.filter((c) => c.mark === "ok").length, near = han.filter((c) => c.mark === "near").length;
  return { chars, score: han.length ? Math.round(((ok + 0.5 * near) / han.length) * 100) : 0, extra: 0 };
}

export const isHanInput = (s: string) => HAN.test(s);
