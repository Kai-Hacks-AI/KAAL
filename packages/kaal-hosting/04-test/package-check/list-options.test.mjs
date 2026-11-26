// hosting/C112 delivered cases: listing a directory tree without the names and directory links a caller leaves out
// (hosting/F90, hosting/F91, hosting/F92; hosting/T297 to hosting/T302). They reach Hosting by its name, as a consumer does,
// and write only to the operating system's temporary directory.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { it } from "node:test";
import { list } from "@kaihacksai/kaal-hosting";

/** A fresh directory holding `files` (path to text), `dirs` (empty directories) and `links` (a link to `target`, a directory link when `dir`). */
function tree({ files = {}, dirs = [], links = [] } = {}) {
  const root = mkdtempSync(join(tmpdir(), "hosting-c112-"));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  for (const d of dirs) mkdirSync(join(root, d), { recursive: true });
  for (const { path, target, dir } of links) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    // Absolute, so a Windows junction resolves it from anywhere; `target` is relative to the link's own directory.
    symlinkSync(join(dirname(join(root, path)), target), join(root, path), dir ? "junction" : "file");
  }
  return root;
}

const paths = (listing) => listing.map((e) => e.path);

it("hosting/T297: no options, {} and the defaults give today's listing; a link to a directory is still INVALID_PATH", async () => {
  const root = tree({ files: { "a/z": "x", "a.txt": "x", "a-b/k": "x", a0: "x" }, dirs: ["empty"] });
  const plain = await list(root);
  assert.deepEqual(paths(plain), ["a", "a-b", "a-b/k", "a.txt", "a/z", "a0", "empty"]);
  assert.deepEqual(await list(root, {}), plain);
  assert.deepEqual(await list(root, { skip: [], links: "refuse" }), plain);
  const linked = tree({ files: { "real/f": "x" }, links: [{ path: "alias", target: "real", dir: true }] });
  await assert.rejects(list(linked), (e) => e?.code === "INVALID_PATH");
  await assert.rejects(list(linked, { links: "refuse" }), (e) => e?.code === "INVALID_PATH");
});

it("hosting/T298: a skipped directory is neither listed nor entered, at the root and at depth", async () => {
  const root = tree({ files: { "node_modules/p/index.js": "x", "src/node_modules/q/i.js": "x", "src/a.js": "x", "T1.js": "x", ".git/HEAD": "x" } });
  assert.deepEqual(paths(await list(root, { skip: ["node_modules", ".git"] })), ["T1.js", "src", "src/a.js"].sort());
});

it("hosting/T299: a skipped file is not listed, and only a whole name matches", async () => {
  const root = tree({ files: { ".DS_Store": "x", "d/.DS_Store": "x", "d/keep": "x", "my_node_modules/f": "x", "node_modules_x": "x" } });
  assert.deepEqual(paths(await list(root, { skip: [".DS_Store", "node_modules"] })), ["d", "d/keep", "my_node_modules", "my_node_modules/f", "node_modules_x"]);
});

it("hosting/T300: a link to a directory is skipped without error under 'skip' and refused under 'refuse'; a link to a file is a file under both", async (t) => {
  const root = tree({ files: { "real/f": "x", "plain.txt": "x" }, links: [{ path: "alias", target: "real", dir: true }, { path: "sub/file-alias", target: "../plain.txt" }] });
  const skipped = await list(root, { links: "skip" });
  assert.deepEqual(paths(skipped), ["plain.txt", "real", "real/f", "sub", "sub/file-alias"]);
  assert.equal(skipped.find((e) => e.path === "sub/file-alias").kind, "file");
  await assert.rejects(list(root, { links: "refuse" }), (e) => e?.code === "INVALID_PATH");
  const onlyFileLinks = tree({ files: { "plain.txt": "x" }, links: [{ path: "fa", target: "plain.txt" }] });
  for (const links of ["refuse", "skip"]) assert.equal((await list(onlyFileLinks, { links })).find((e) => e.path === "fa").kind, "file");
});

it("hosting/T301: a link to a directory under a skipped directory does not fail the listing", async () => {
  const root = tree({ files: { "node_modules/real/f": "x", "keep": "x" }, links: [{ path: "node_modules/alias", target: "real", dir: true }] });
  await assert.rejects(list(root), (e) => e?.code === "INVALID_PATH");
  assert.deepEqual(paths(await list(root, { skip: ["node_modules"] })), ["keep"]);
});

it("hosting/T302: skip must be a list of strings and links one of 'refuse' and 'skip'; the result stays in UTF-16 order", async () => {
  const root = tree({ files: { "b/x": "x", "a.txt": "x", "a/z": "x", "drop/f": "x" } });
  for (const options of [{ skip: "node_modules" }, { skip: [1] }, { links: "follow" }, { links: true }]) {
    await assert.rejects(list(root, options), (e) => e instanceof TypeError, JSON.stringify(options));
  }
  assert.deepEqual(paths(await list(root, { skip: ["drop"], links: "skip" })), ["a", "a.txt", "a/z", "b", "b/x"]);
});
