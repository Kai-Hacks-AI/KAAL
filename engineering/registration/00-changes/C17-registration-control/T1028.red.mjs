// Case engineering/T1028 (engineering/C17): a pull request judges the places it touches
import assert from "node:assert/strict";
import { loadCheck, fixture, reg, one } from "./helper.mjs";
export const id = "engineering/T1028";
export const tests = ["engineering/C17"];
export const title = "for a list of changed files only the places that hold one are judged, and a file inside a Change folder judges both the Change folder and the area or capability that holds it";
export async function run() {
  const { verify } = await loadCheck();
  const root = fixture({
    "packages/kaal-a/a.mjs": "", "packages/kaal-b/b.mjs": "", "packages/kaal-b/kaal-guard.json": reg(one),
    "engineering/x/f.md": "", "engineering/x/kaal-guard.json": reg(one), "engineering/x/00-changes/C1-foo/c.md": "",
  });
  const places = (files) => [...new Set(verify(root, { changed: files }).map((f) => f.place))].sort();
  assert.deepEqual(places(["packages/kaal-a/a.mjs"]), ["packages/kaal-a"], "the touched place is judged");
  assert.deepEqual(places(["packages/kaal-b/b.mjs"]), [], "a registered place passes");
  assert.deepEqual(places(["engineering/x/00-changes/C1-foo/c.md"]), ["engineering/x/00-changes/C1-foo"], "the Change folder is judged next to its registered area");
  assert.deepEqual(places(["packages/kaal-a/a.mjs", "engineering/x/f.md"]), ["packages/kaal-a"], "only the touched, unregistered place is reported");
  const two = fixture({ "engineering/y/00-changes/C2-bar/c.md": "" });
  assert.deepEqual([...new Set(verify(two, { changed: ["engineering/y/00-changes/C2-bar/c.md"] }).map((f) => f.place))].sort(), ["engineering/y", "engineering/y/00-changes/C2-bar"], "both the area and the Change folder are judged");
  assert.deepEqual(verify(root, { changed: ["packages/gone/x.mjs"] }), [], "a place that no longer exists is not judged");
}
