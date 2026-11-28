// core/C251 planned outer test: the claim's row for the fast lane's table (core/A69). Immutable to DO and CHECK.
// The lane judge is Release's; this holds the row's own shape.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** The row, or the reason the test is blocked before any behavioural assertion. */
async function row() {
  let mod;
  try {
    mod = await import("kaal-core/id-claims");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-core exports no ./id-claims (${e.code ?? e.message})`);
  }
  assert.ok(mod.ID_CLAIM_LANE, "blocked before behavioural assertion: kaal-core/id-claims exports no ID_CLAIM_LANE");
  return mod.ID_CLAIM_LANE;
}

describe("Id claim lane row (core/C251)", () => {
  it("core/T149 [core/A69, core/F133]: the row is add-only, its one root is Core's claim folder, and its name pattern admits exactly <kind>-<id>.json with the whole name as the uniqueness key", async () => {
    const lane = await row();
    assert.equal(lane.kind, "id-claim");
    assert.deepEqual([...lane.status], ["A"]);
    assert.deepEqual([...lane.roots], ["packages/kaal-core/00-claims/"]);
    assert.ok(new RegExp(lane.allow).test(lane.roots[0]));
    const name = new RegExp(lane.name);
    for (const ok of ["change-251.json", "case-1800.json"]) assert.equal(name.exec(ok)?.[1], ok.replace(".json", ""), ok);
    for (const bad of ["change-0.json", "change-0251.json", "Change-251.json", "change-251.md", "change-251.json.json", "change-251a.json", "change.json", "x/change-251.json", "change-251-b.json"]) assert.equal(name.test(bad), false, bad);
  });
});
