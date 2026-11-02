import assert from "node:assert/strict";
import { it } from "node:test";
import { candidates, refactored } from "kaal-testing/redesign";

const V1 = "1".repeat(64), V2 = "2".repeat(64);
const run = (version) => ({ platform: "__proto__", cases: [
  ...Array.from({ length: 5 }, (_, i) => ({ name: `quick ${i}`, sha256: V1, ms: 100 })),
  { name: "constructor", sha256: version, ms: 9000 },
] });

it("an unprofiled latest file version cannot borrow an older version's redesign evidence", () => {
  const old = Array.from({ length: 3 }, () => run(V1));
  assert.equal(candidates(old).result, "challenged");
  const latest = { ...run(V2), cases: run(V2).cases.slice(-1) };
  const r = candidates([...old, latest]);
  assert.deepEqual(r.candidates, []);
  assert.deepEqual(r.refactors, [], "no timing comparison until both versions have profiled samples");
  assert.deepEqual(r.unprofiled.map((u) => [u.run, u.platform]), [[4, "__proto__"]]);
});

it("ordinary string identities do not acquire object-prototype meaning", () => {
  const r = candidates(Array.from({ length: 3 }, () => run(V1)));
  assert.deepEqual(r.candidates.map((c) => [c.case, c.platform]), [["constructor", "__proto__"]]);
  const before = { id: "constructor", version: V1, tests: ["F1"], verdicts: Object.fromEntries([["__proto__", "fail"], ["constructor", "pass"]]) };
  assert.equal(refactored(before, { ...before, version: V2 }).result, "kept");
  assert.equal(refactored(before, { ...before, version: V2, verdicts: { constructor: "pass" } }).result, "changed");
});

it("malformed target arrays stay unknown, and a large valid profiling minimum stays bounded", () => {
  const before = { id: "T1", version: V1, tests: ["F1"], verdicts: { candidate: "pass", mutant: "fail" } };
  assert.equal(refactored(before, { ...before, version: V2, tests: Array(1) }).result, "unknown");
  const r = candidates([run(V1)], { minimum: Number.MAX_SAFE_INTEGER });
  assert.equal(r.result, "unchallenged");
  assert.equal(r.unprofiled.length, 1);
  assert.equal(candidates([], { minimum: 0 }).result, "unknown");
});
