// Case release/T484 (release/C35): the judge reads Developing, the .githooks stage that Wiring installs: dispatcher with old/ and new/
import assert from "node:assert/strict";
import { judge, GOOD } from "./helper.mjs";

export const id = "release/T484";
export const tests = ["release/C35"];
export const title = "the judge reads Developing, the .githooks stage that Wiring installs: dispatcher with old/ and new/";
export async function run() {
  const { judge: j } = await judge();
  assert.equal(j(GOOD()).kind, "pass");
  for (const missing of ["pre-push", "old/pre-push", "new/.gitkeep"]) {
    const g = GOOD(); g.githooks = g.githooks.filter((f) => f !== missing);
    const r = j(g);
    assert.equal(r.kind, "fail", `${missing} missing`);
    assert.deepEqual(r.checks, ["verify Stages (Wiring)"], "Developing is judged by the Wiring job only, so no other ruleset waits for .githooks");
  }
}
