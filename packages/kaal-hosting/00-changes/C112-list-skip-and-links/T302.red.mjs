// hosting/T302 [hosting/F92]: a bad option is a TypeError before anything is read; the result with options is still sorted.
import assert from "node:assert/strict";
import { it } from "node:test";
import { list } from "@kaihacksai/kaal-hosting";
import { paths, tree } from "./helper.mjs";

it("hosting/T302 [hosting/F92]: skip must be a list of strings and links one of 'refuse' and 'skip'; the result stays in UTF-16 order", async () => {
  const root = tree({ files: { "b/x": "x", "a.txt": "x", "a/z": "x", "drop/f": "x" } });
  for (const options of [{ skip: "node_modules" }, { skip: [1] }, { links: "follow" }, { links: true }]) {
    await assert.rejects(list(root, options), (e) => e instanceof TypeError, JSON.stringify(options));
  }
  assert.deepEqual(paths(await list(root, { skip: ["drop"], links: "skip" })), ["a", "a.txt", "a/z", "b", "b/x"]);
});
