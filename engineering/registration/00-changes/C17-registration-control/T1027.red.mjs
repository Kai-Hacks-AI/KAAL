// Case engineering/T1027 (engineering/C17): a valid registration passes and its check is never run
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { loadCheck, fixture, reg, tree } from "./helper.mjs";
export const id = "engineering/T1027";
export const tests = ["engineering/C17"];
export const title = "a place with a valid registration passes, a check that is RED by design is accepted, and the control runs nothing and writes nothing";
export async function run() {
  const { inventory } = await loadCheck();
  const root = fixture({
    "packages/kaal-a/kaal-guard.json": reg({ id: "red-by-design", run: "node -e \"process.exit(1)\"" }),
    "packages/kaal-b/kaal-guard.json": reg({ id: "marker", run: "node -e \"require('fs').writeFileSync('ran.txt','x')\"" }, { id: "second", run: "node --test" }),
  });
  const before = tree(root);
  assert.deepEqual(inventory(root), [], "a valid registration is reported");
  assert.deepEqual(tree(root), before, "the control changed the tree");
  assert.ok(!existsSync(join(root, "ran.txt")) && !existsSync(join(root, "packages/kaal-b/ran.txt")), "the control ran a registered check");
}
