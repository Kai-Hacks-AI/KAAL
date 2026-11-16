// Case release/T485 (release/C35): the check names are unique and exactly verify Stages (<Name>), distinct from Guard and from the CI job Engineering
import assert from "node:assert/strict";
import { NAMES, source, contexts, ctx } from "./helper.mjs";

export const id = "release/T485";
export const tests = ["release/C35"];
export const title = "the check names are unique and exactly verify Stages (<Name>), distinct from Guard and from the CI job Engineering";
export async function run() {
  const all = NAMES.flatMap((n) => contexts(source(n)));
  assert.deepEqual(all.slice().sort(), NAMES.map(ctx).sort());
  assert.equal(new Set(all).size, all.length, "unique: no shared control is duplicated across rulesets");
  for (const c of all) assert.ok(c !== "Engineering" && !/^Guard/.test(c), `${c} is distinct from the CI job and from Guard`);
}
