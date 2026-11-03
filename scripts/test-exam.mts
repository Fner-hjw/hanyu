import assert from "node:assert/strict";
import { nextStep, estimateFrom } from "../src/lib/exam.ts";
// strong learner climbs to 6
let p = new Set<number>(), lvl: number | null = 3, blocks = 0;
for (const c of [6, 6, 5, 5]) { blocks++; const r = nextStep(lvl!, c, p, blocks); p = r.passed; lvl = r.next; if (lvl === null) break; }
assert.equal(estimateFrom(p), 6);
// HSK 4-ish learner: passes 3, passes 4 with 5/6, fails 5 → stops (4 already passed)
p = new Set(); lvl = 3; blocks = 0;
for (const c of [6, 5, 2]) { blocks++; const r = nextStep(lvl!, c, p, blocks); p = r.passed; lvl = r.next; if (lvl === null) break; }
assert.equal(lvl, null); assert.equal(estimateFrom(p), 4);
// beginner: fails 3, fails 2, fails 1 → 0
p = new Set(); lvl = 3; blocks = 0;
for (const c of [1, 2, 3]) { blocks++; const r = nextStep(lvl!, c, p, blocks); p = r.passed; lvl = r.next; if (lvl === null) break; }
assert.equal(estimateFrom(p), 0);
// borderline settles
assert.equal(nextStep(3, 4, new Set(), 1).next, null);
console.log("exam staircase tests passed");
