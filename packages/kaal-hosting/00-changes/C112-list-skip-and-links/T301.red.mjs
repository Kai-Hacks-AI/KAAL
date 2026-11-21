// hosting/T301 [hosting/F90]: a skipped directory is not read, so what is inside it cannot fail the listing.
import assert from "node:assert/strict";
import { it } from "node:test";
import { list } from "@kaihacksai/kaal-hosting";
import { paths, tree } from "./helper.mjs";

it("hosting/T301 [hosting/F90]: a link to a directory under a skipped directory does not fail the listing", async () => {
  const root = tree({ files: { "node_modules/real/f": "x", "keep": "x" }, links: [{ path: "node_modules/alias", target: "real", dir: true }] });
  await assert.rejects(list(root), (e) => e?.code === "INVALID_PATH");
  assert.deepEqual(paths(await list(root, { skip: ["node_modules"] })), ["keep"]);
});
