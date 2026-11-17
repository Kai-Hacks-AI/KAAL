// Case release/T516 (release/C37): the new check name is unique and follows the naming guidance
import assert from "node:assert/strict";
import { NAMES, source, contexts, ctx } from "./helper.mjs";

export const id = "release/T516";
export const tests = ["release/C37"];
export const title = "the check names are exactly verify Stages (<Name>) for the five rulesets plus Developing and analyze Vulnerabilities (Promoting), each name appears as a required check, and none equals Guard or the CI job Engineering";
export async function run() {
  const all = NAMES.flatMap((n) => contexts(source(n)));
  assert.deepEqual([...new Set(all)].sort(), [...[...NAMES, "Developing"].map(ctx), "analyze Vulnerabilities (Promoting)"].sort());
  assert.equal(all.length, NAMES.length + 2, "only Integrating and Promoting carry a second check");
  for (const c of all) assert.ok(c !== "Engineering" && !/^Guard/.test(c), `${c} is distinct from the CI job and from Guard`);
}
