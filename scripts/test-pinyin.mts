import assert from "node:assert/strict";
import { checkPinyin } from "../src/lib/pinyin.ts";
const cases: [string, string, string][] = [
  ["ni3hao3", "nǐ hǎo", "exact"], ["nǐhǎo", "nǐ hǎo", "exact"], ["nihao", "nǐ hǎo", "tones"], ["ni2hao3", "nǐ hǎo", "tones"],
  ["nihau", "nǐ hǎo", "wrong"], ["ba4ba", "bàba", "exact"], ["ba4ba5", "bàba", "exact"], ["lv4shi1", "lǜshī", "exact"],
  ["lu:4shi1", "lǜshī", "exact"], ["yin2hang2", "yínháng", "exact"], ["Yin2 Hang2", "yínháng", "exact"], ["xian1sheng", "xiānsheng", "exact"],
];
for (const [t, e, want] of cases) assert.equal(checkPinyin(t, e), want, `${t} vs ${e}`);
console.log("pinyin tests passed");
