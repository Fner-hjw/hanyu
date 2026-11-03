import assert from "node:assert/strict";
import { shuffleOptions } from "../src/lib/shuffle.ts";
const pos = [0, 0, 0, 0];
for (let k = 0; k < 400; k++) {
  const r = shuffleOptions(["a", "b", "c", "d"], 1, "q" + k);
  assert.equal(r.options[r.answer], "b");
  assert.deepEqual([...r.options].sort(), ["a", "b", "c", "d"]);
  pos[r.answer]++;
}
assert.deepEqual(shuffleOptions(["a", "b", "c", "d"], 2, "same"), shuffleOptions(["a", "b", "c", "d"], 2, "same"));
assert.ok(Math.min(...pos) > 60, "roughly uniform: " + pos.join("/"));
console.log("shuffle tests passed", pos.join("/"));
