// core/C251 planned outer test: the claim's row for the fast lane's table (core/A69). Immutable to DO and CHECK.
// Core owns the claim contract and the consumer owns the placement: the row is built for the folder chosen, Core's default or another.
// The lane judge is Release's; this holds the row's own shape and enforces no package path.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** The module, or the reason the test is blocked before any behavioural assertion. */
async function claims() {
  let mod;
  try {
    mod = await import("kaal-core/id-claims");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-core exports no ./id-claims (${e.code ?? e.message})`);
  }
  assert.equal(typeof mod.idClaimLane, "function", "blocked before behavioural assertion: kaal-core/id-claims exports no idClaimLane");
  return mod;
}

function holds(row, folder) {
  assert.equal(row.kind, "id-claim");
  assert.deepEqual([...row.status], ["A"], "add only");
  assert.deepEqual([...row.roots], [folder], "the chosen folder is the one root");
  assert.ok(new RegExp(row.allow).test(folder), "allow admits the folder");
  assert.equal(new RegExp(row.allow).test(`${folder}x/`), false, "allow admits that folder alone");
  const name = new RegExp(row.name);
  for (const ok of ["change-251.json", "case-1800.json"]) assert.equal(name.exec(ok)?.[1], ok.replace(".json", ""), `${ok} is its own key`);
  for (const bad of ["change-0.json", "change-0251.json", "Change-251.json", "change-251.md", "change-251.json.json", "change-251a.json", "change.json", "x/change-251.json", "change-251-b.json"]) assert.equal(name.test(bad), false, bad);
}

describe("Id claim lane row (core/C251)", () => {
  it("core/T149 [core/A69, core/F133]: idClaimLane() gives a row for Core's default folder and idClaimLane(folder) a row for another folder, each add-only with that folder as its one root and a name pattern that admits exactly <kind>-<id>.json with the whole name as the uniqueness key, and a folder that is not a plain path ending in / gives null; Core enforces no package path", async () => {
    const { idClaimLane } = await claims();
    const standard = idClaimLane();
    assert.ok(standard, "the default folder gives a row");
    holds(standard, standard.roots[0]);
    for (const folder of ["claims/", "packages/kaal-x/ids/", "a/b/c/"]) {
      holds(idClaimLane(folder), folder);
      assert.deepEqual(idClaimLane(folder), idClaimLane(folder), "the same folder gives the same row");
    }
    for (const bad of ["", "claims", "/claims/", "../claims/", "a/../claims/", "a//claims/", "a\\claims/", "./claims/", 7, null]) assert.equal(idClaimLane(bad), null, JSON.stringify(bad));
  });
});
