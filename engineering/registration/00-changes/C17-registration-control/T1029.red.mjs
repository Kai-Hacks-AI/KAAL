// Case engineering/T1029 (engineering/C17): a Delivery-only change judges no place
import assert from "node:assert/strict";
import { loadCheck, fixture } from "./helper.mjs";
export const id = "engineering/T1029";
export const tests = ["engineering/C17"];
export const title = "a change that touches only .github, .githooks, .kaal, root files or loose files under engineering judges no place and passes, without the control knowing a list of Delivery locations";
export async function run() {
  const { verify } = await loadCheck();
  const root = fixture({ ".github/workflows/w.yml": "", ".githooks/pre-push": "", ".kaal/config/guard/a.md": "", "package.json": "{}", "engineering/README.md": "" });
  assert.deepEqual(verify(root, { changed: [".github/workflows/w.yml", ".githooks/pre-push", ".kaal/config/guard/a.md", "package.json", "engineering/README.md"] }), []);
  assert.deepEqual(verify(root, { changed: [] }), [], "an empty change judges no place");
}
