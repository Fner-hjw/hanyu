import { pinyin } from "pinyin-pro";
import { VOCAB_BY_ZH, type Word } from "@/data/vocab";

export type Token = { text: string; py: string; word?: Word; isZh: boolean };

const segmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter("zh", { granularity: "word" })
    : null;

const HAN = /[一-鿿]/;

/** Segment Chinese text into word tokens with pinyin and (if known) a vocab entry. */
export function tokenize(text: string): Token[] {
  const per = pinyin(text, { type: "all", toneType: "symbol" });
  // pinyin entries line up 1:1 with characters of `text`
  const chars = [...text];
  const pyAt = (i: number) => per[i]?.pinyin ?? "";

  const segs: string[] = segmenter
    ? [...segmenter.segment(text)].map((s) => s.segment)
    : chars;

  // merge neighbouring segments when the combination is a known vocab item
  const merged: string[] = [];
  for (let i = 0; i < segs.length; ) {
    let took = false;
    for (let n = Math.min(4, segs.length - i); n >= 2; n--) {
      const cand = segs.slice(i, i + n).join("");
      if (VOCAB_BY_ZH.has(cand)) {
        merged.push(cand);
        i += n;
        took = true;
        break;
      }
    }
    if (!took) merged.push(segs[i++]);
  }

  const out: Token[] = [];
  let pos = 0;
  for (const seg of merged) {
    const len = [...seg].length;
    const isZh = HAN.test(seg);
    const word = VOCAB_BY_ZH.get(seg);
    const py = isZh
      ? Array.from({ length: len }, (_, k) => pyAt(pos + k)).join(" ")
      : "";
    out.push({ text: seg, py: word ? word.py : py, word, isZh });
    pos += len;
  }
  return out;
}

export function toPinyin(text: string): string {
  return pinyin(text, { toneType: "symbol" });
}
