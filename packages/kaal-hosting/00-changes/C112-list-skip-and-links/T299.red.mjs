// hosting/T299 [hosting/F90]: a skipped name that is a file is not listed, and the match is on the whole name.
import assert from "node:assert/strict";
import { it } from "node:test";
import { list } from "@kaihacksai/kaal-hosting";
import { paths, tree } from "./helper.mjs";

it("hosting/T299 [hosting/F90]: a skipped file is not listed, and only a whole name matches", async () => {
  const root = tree({ files: { ".DS_Store": "x", "d/.DS_Store": "x", "d/keep": "x", "my_node_modules/f": "x", "node_modules_x": "x" } });
  assert.deepEqual(paths(await list(root, { skip: [".DS_Store", "node_modules"] })), ["d", "d/keep", "my_node_modules", "my_node_modules/f", "node_modules_x"]);
});
