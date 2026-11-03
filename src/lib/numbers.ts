/** Arabic numerals → Mandarin readings, following everyday mainland usage. */
const D = "零一二三四五六七八九";
const U = ["", "十", "百", "千"];
const BIG = ["", "万", "亿", "万亿"];

/** 0–9999 → reading */
function group(n: number): string {
  let out = "", zero = false, first = true;
  for (let p = 3; p >= 0; p--) {
    const d = Math.floor(n / 10 ** p) % 10;
    if (d === 0) { if (out) zero = true; continue; }
    if (zero) { out += "零"; zero = false; }
    // 两 before 百/千 when it's the group's first digit (两百, 两千); 二 elsewhere (二十, 两千二百)
    const digit = d === 2 && first && (p === 2 || p === 3) ? "两" : D[d];
    out += digit + U[p];
    first = false;
  }
  return out;
}

export function intToChinese(n: number): string {
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) throw new Error("non-negative integer expected");
  if (n === 0) return "零";
  const groups: number[] = [];
  for (let x = n; x > 0; x = Math.floor(x / 10000)) groups.push(x % 10000);
  let out = "", pendingZero = false;
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (g === 0) { if (out) pendingZero = true; continue; }
    if (out && (pendingZero || g < 1000)) out += "零";
    let s = group(g);
    // a lone 2 directly before 万/亿 reads 两 (两万, 两亿)
    if (g === 2 && i > 0) s = "两";
    out += s + BIG[i];
    pendingZero = false;
  }
  // 10–19 at the start of a number: 十五, 十五万 (not 一十五)
  if (out.startsWith("一十")) out = out.slice(1);
  return out;
}

export function numberToChinese(x: number): string {
  const [i, f] = String(x).split(".");
  const head = intToChinese(Number(i));
  return f ? `${head}点${[...f].map((c) => D[+c]).join("")}` : head;
}

export const percentToChinese = (p: number) => `百分之${numberToChinese(p)}`;

/** 23500000 → "2,350万" style hint: value expressed in 万 or 亿 units */
export function inWanYi(n: number): { value: number; unit: "万" | "亿" } {
  return n >= 1e8 ? { value: +(n / 1e8).toFixed(4), unit: "亿" } : { value: +(n / 1e4).toFixed(4), unit: "万" };
}

export const parseTyped = (s: string) => Number(s.replace(/[,\s，_%¥￥元$]/g, ""));
