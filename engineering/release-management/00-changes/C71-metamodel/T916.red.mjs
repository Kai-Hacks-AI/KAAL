// Case release/T916 (release/C71): every PR template names its view (turns GREEN with the .github DO, which travels alone)
import assert from "node:assert/strict";
import { join } from "node:path";
import { read, templates, REPO } from "./helper.mjs";

export const id = "release/T916";
export const tests = ["release/C71"];
export const title = "each PR template under .github names its view by the path engineering/metamodel/views/<TYPE>.md";
export async function run() {
  for (const t of templates()) {
    const want = `engineering/metamodel/views/${t.name}.md`;
    assert.ok(read(join(REPO, t.path)).includes(want), `${t.path} does not name ${want}`);
  }
}
