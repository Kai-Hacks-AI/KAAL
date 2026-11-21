// hosting/T297 [hosting/F92]: regression. With no options, with {} and with the defaults written out the listing is the same, in UTF-16 order, a directory before what it holds; a link to a directory is still refused.
import assert from "node:assert/strict";
import { it } from "node:test";
import { list } from "@kaihacksai/kaal-hosting";
import { paths, tree } from "./helper.mjs";

it("hosting/T297 [hosting/F92]: no options, {} and the defaults give today's listing; a link to a directory is still INVALID_PATH", async () => {
  const root = tree({ files: { "a/z": "x", "a.txt": "x", "a-b/k": "x", a0: "x" }, dirs: ["empty"] });
  const plain = await list(root);
  assert.deepEqual(paths(plain), ["a", "a-b", "a-b/k", "a.txt", "a/z", "a0", "empty"]);
  assert.deepEqual(await list(root, {}), plain);
  assert.deepEqual(await list(root, { skip: [], links: "refuse" }), plain);
  const linked = tree({ files: { "real/f": "x" }, links: [{ path: "alias", target: "real", dir: true }] });
  await assert.rejects(list(linked), (e) => e?.code === "INVALID_PATH");
  await assert.rejects(list(linked, { links: "refuse" }), (e) => e?.code === "INVALID_PATH");
});
