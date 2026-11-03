import assert from "node:assert/strict";
import { intToChinese as c, numberToChinese, percentToChinese, inWanYi, parseTyped } from "../src/lib/numbers.ts";
const cases: [number, string][] = [
  [0, "零"], [7, "七"], [10, "十"], [15, "十五"], [20, "二十"], [22, "二十二"], [100, "一百"], [101, "一百零一"],
  [110, "一百一十"], [115, "一百一十五"], [200, "两百"], [250, "两百五十"], [1000, "一千"], [1001, "一千零一"],
  [1010, "一千零一十"], [2000, "两千"], [2200, "两千二百"], [10000, "一万"], [10050, "一万零五十"], [12000, "一万两千"],
  [20000, "两万"], [150000, "十五万"], [1000000, "一百万"], [1500000, "一百五十万"], [23500000, "两千三百五十万"],
  [100000000, "一亿"], [100000005, "一亿零五"], [200000000, "两亿"], [320000000, "三亿两千万"], [1002003, "一百万两千零三"],
  [4200000000, "四十二亿"], [30060, "三万零六十"],
];
for (const [n, want] of cases) assert.equal(c(n), want, `${n}`);
assert.equal(numberToChinese(3.5), "三点五");
assert.equal(numberToChinese(0.25), "零点二五");
assert.equal(percentToChinese(12.5), "百分之十二点五");
assert.deepEqual(inWanYi(23500000), { value: 2350, unit: "万" });
assert.deepEqual(inWanYi(420000000), { value: 4.2, unit: "亿" });
console.log(`numbers tests passed (${cases.length} cases)`);
assert.equal(parseTyped("23,500,000"), 23500000); assert.equal(parseTyped("12.5%"), 12.5); assert.equal(parseTyped("¥1,250"), 1250); console.log("parse ok");
