// Case engineering/T1031 (engineering/C17): the area and this Change register themselves
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { loadCheck, REPO } from "./helper.mjs";
export const id = "engineering/T1031";
export const tests = ["engineering/C17"];
export const title = "the area engineering/registration and the Change folder of engineering/C17 are places that pass the control, so the control is the first to hold itself to its rule";
export async function run() {
  const { verify } = await loadCheck();
  const area = "engineering/registration", change = `${area}/00-changes/C17-registration-control`;
  for (const p of [area, change]) assert.ok(existsSync(join(REPO, p, "kaal-guard.json")), `${p} does not register`);
  assert.deepEqual(verify(REPO, { changed: [`${change}/C17.md`, `${area}/check.mjs`] }), [], "the control rejects the place that holds it");
}
