// Case release/T484 (release/C35): level 1 judges only what exists before the .githooks migration
import assert from "node:assert/strict";
import { stages, judge, GOOD, NAMES, ctx } from "./helper.mjs";

export const id = "release/T484";
export const tests = ["release/C35"];
export const title = "Developing is declared but not judged at level 1, so no verify Stages job fails on a tree without the .githooks structure";
export async function run() {
  const { judge: j } = await judge();
  const dev = stages().stages.find((s) => s.name === "Developing");
  assert.equal(dev.kind, ".githooks");
  assert.equal(dev.judged, "later", "a later Change adds the .githooks judgement, after #1705");
  const out = j(GOOD());
  assert.equal(out.kind, "pass");
  assert.deepEqual(out.checks, [], "no job fails: verify Stages (Wiring) is green on main today");
  for (const n of NAMES) assert.ok(!j(GOOD()).findings.some((f) => f.check === ctx(n)), `${n} green`);
}
