// hosting/T298 [hosting/F90]: skip leaves out a directory at the root and at depth, with everything under it.
import assert from "node:assert/strict";
import { it } from "node:test";
import { list } from "@kaihacksai/kaal-hosting";
import { paths, tree } from "./helper.mjs";

it("hosting/T298 [hosting/F90]: a skipped directory is neither listed nor entered, at the root and at depth", async () => {
  const root = tree({ files: { "node_modules/p/index.js": "x", "src/node_modules/q/i.js": "x", "src/a.js": "x", "T1.js": "x", ".git/HEAD": "x" } });
  assert.deepEqual(paths(await list(root, { skip: ["node_modules", ".git"] })), ["T1.js", "src", "src/a.js"].sort());
});
