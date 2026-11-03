/** Pinyin comparison for typing exercises – works without syllable segmentation. */
const TONE: Record<string, [string, number]> = {};
"āáǎàa ēéěèe īíǐìi ōóǒòo ūúǔùu ǖǘǚǜü".split(" ").forEach((group) => {
  const base = group[4];
  [...group.slice(0, 4)].forEach((ch, i) => (TONE[ch] = [base, i + 1]));
});

/** letters without tones (ü→v) + the sequence of tones in order (neutral tones omitted) */
export function parsePinyin(s: string): { letters: string; tones: number[] } {
  let letters = "";
  const tones: number[] = [];
  for (const ch of s.toLowerCase().normalize("NFC").replace(/u:/g, "ü")) {
    const t = TONE[ch];
    if (t) { letters += t[0] === "ü" ? "v" : t[0]; tones.push(t[1]); }
    else if (ch === "ü") letters += "v";
    else if (ch >= "1" && ch <= "4") tones.push(+ch);
    else if (ch >= "a" && ch <= "z") letters += ch;
  }
  return { letters, tones };
}

/**
 * Compare typed pinyin with the expected answer. Accepts tone marks ("nǐhǎo"), tone numbers ("ni3hao3")
 * or no tones ("nihao"). "exact" = letters and tones right; "tones" = letters right only.
 */
export function checkPinyin(typed: string, expected: string): "exact" | "tones" | "wrong" {
  const a = parsePinyin(typed), b = parsePinyin(expected);
  if (a.letters !== b.letters) return "wrong";
  return a.tones.join() === b.tones.join() ? "exact" : "tones";
}
