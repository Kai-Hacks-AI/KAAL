// Case engineering/T1024 (engineering/C17): a place without kaal-guard.json fails
import assert from "node:assert/strict";
import { loadCheck, fixture, rules } from "./helper.mjs";
export const id = "engineering/T1024";
export const tests = ["engineering/C17"];
export const title = "a capability, an Engineering area and a Change folder with no kaal-guard.json each fail as missing, naming the place and the file";
export async function run() {
  const { inventory } = await loadCheck();
  const root = fixture({ "packages/kaal-a/a.mjs": "", "engineering/x/f.md": "", "engineering/x/00-changes/C1-foo/c.md": "" });
  const found = inventory(root);
  for (const p of ["packages/kaal-a", "engineering/x", "engineering/x/00-changes/C1-foo"]) {
    assert.deepEqual(rules(found, p), ["missing"], `${p} is not reported as missing`);
    assert.equal(found.find((f) => f.place === p).file, `${p}/kaal-guard.json`, `${p}: the finding does not name the file`);
  }
}
