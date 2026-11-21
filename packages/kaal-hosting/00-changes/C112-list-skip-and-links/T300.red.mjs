// hosting/T300 [hosting/F91]: links 'skip' leaves a link to a directory alone; a link to a file lists as a file under both settings.
import assert from "node:assert/strict";
import { it } from "node:test";
import { list } from "@kaihacksai/kaal-hosting";
import { paths, tree } from "./helper.mjs";

it("hosting/T300 [hosting/F91]: a link to a directory is skipped without error under 'skip' and refused under 'refuse'; a link to a file is a file under both", async (t) => {
  const root = tree({ files: { "real/f": "x", "plain.txt": "x" }, links: [{ path: "alias", target: "real", dir: true }, { path: "sub/file-alias", target: "../plain.txt" }] });
  const skipped = await list(root, { links: "skip" });
  assert.deepEqual(paths(skipped), ["plain.txt", "real", "real/f", "sub", "sub/file-alias"]);
  assert.equal(skipped.find((e) => e.path === "sub/file-alias").kind, "file");
  await assert.rejects(list(root, { links: "refuse" }), (e) => e?.code === "INVALID_PATH");
  const onlyFileLinks = tree({ files: { "plain.txt": "x" }, links: [{ path: "fa", target: "plain.txt" }] });
  for (const links of ["refuse", "skip"]) assert.equal((await list(onlyFileLinks, { links })).find((e) => e.path === "fa").kind, "file");
});
