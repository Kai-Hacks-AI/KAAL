// Case engineering/T1023 (engineering/C17): what a place is
import assert from "node:assert/strict";
import { loadCheck, fixture, reg, one } from "./helper.mjs";
export const id = "engineering/T1023";
export const tests = ["engineering/C17"];
export const title = "the places are the capability roots, the Engineering area roots and the Change folders of either, and nothing else: no Delivery location, no root file, no loose file";
export async function run() {
  const { inventory } = await loadCheck();
  const root = fixture({
    "packages/kaal-a/lib/x.mjs": "", "packages/kaal-b/kaal-guard.json": reg(one),
    "engineering/x/f.md": "", "engineering/x/00-changes/C1-foo/c.md": "", "packages/kaal-a/00-changes/C2-bar/c.md": "",
    "engineering/loose.md": "", ".github/workflows/w.yml": "", ".githooks/pre-push": "", ".kaal/config/guard/a.md": "", "package.json": "{}",
    "engineering/x/00-changes/notes/n.md": "",
  });
  const got = inventory(root).map((f) => f.place).sort();
  assert.deepEqual([...new Set(got)], ["engineering/x", "engineering/x/00-changes/C1-foo", "packages/kaal-a", "packages/kaal-a/00-changes/C2-bar"], "the places reported as unregistered");
}
