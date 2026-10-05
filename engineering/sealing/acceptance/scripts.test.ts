// The two scripts, through the commands as an agent runs them. Expected IDs are
// built here from the written format and pinned literals, never by calling the
// production hashing twice.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { TestContext } from "node:test";
import { REPO, SCRIPTS } from "../helpers/setup.js";

const run = (script: string, ...args: string[]) => {
  const r = spawnSync("node", [join(SCRIPTS, `${script}.mjs`), ...args], { encoding: "utf8" });
  return { code: r.status, out: r.stdout.trim(), err: r.stderr.trim() };
};
const CHANGE = "KAAL Change v1";
const TREE = "KAAL Tree v1";

/** A tree whose root directory is called `name`, under a fresh parent. */
const tree = (t: TestContext, name: string, files: Record<string, string | Buffer>, order = Object.keys(files)): string => {
  const parent = mkdtempSync(join(tmpdir(), "sealing-"));
  t.after(() => rmSync(parent, { recursive: true, force: true }));
  const dir = join(parent, name);
  mkdirSync(dir);
  for (const path of order) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), files[path]);
  }
  return dir;
};
const be = (n: number) => Buffer.from(n.toString(16).padStart(16, "0"), "hex");
/** The written format, spelled out for files already in canonical order. */
const expected = (domain: string, files: [string, string][], root?: string) => {
  const h = createHash("sha256").update(`${domain}\n`);
  if (root !== undefined) h.update(be(Buffer.byteLength(root))).update(root);
  h.update(be(files.length));
  for (const [p, c] of files) h.update(be(Buffer.byteLength(p))).update(p).update(be(Buffer.byteLength(c))).update(c);
  return h.digest("hex");
};
const id = (domain: string, dir: string, named = false) => run("tree-id", ...(named ? ["--named"] : []), domain, dir).out;

test("a tree's ID is the written format; a pinned literal keeps it from drifting", (t) => {
  const dir = tree(t, "01", { "retro.md": "# Retro\n" });
  assert.equal(id(CHANGE, dir), expected(CHANGE, [["retro.md", "# Retro\n"]]));
  assert.equal(id(CHANGE, dir), "98ac581a6d9a37547b5df936422b6c5dd7e7a55644443331c5b3858f564a892f");
});

test("a named tree adds its root name, and its parent and creation order are no part of it", (t) => {
  const files = { a: "a", "b/c": "c" };
  const expectedId = expected(TREE, [["a", "a"], ["b/c", "c"]], "work");
  assert.equal(id(TREE, tree(t, "work", files), true), expectedId);
  assert.equal(id(TREE, tree(t, "work", files, ["b/c", "a"]), true), expectedId, "another parent, another creation order");
  assert.notEqual(id(TREE, tree(t, "evidence", files), true), expectedId, "another root name");
  assert.equal(id(CHANGE, tree(t, "work", files)), id(CHANGE, tree(t, "evidence", files)), "unnamed: the root name is not identity");
  assert.notEqual(id(CHANGE, tree(t, "work", files)), id(TREE, tree(t, "work", files)), "domains never share an ID");
});

test("every identity-bearing part of a tree changes its ID", (t) => {
  const base = id(TREE, tree(t, "w", { f: "bytes" }), true);
  const variants: Record<string, Record<string, string>> = {
    "bytes change": { f: "bytez" },
    "file renamed": { g: "bytes" },
    "file added": { f: "bytes", g: "x" },
    "moved into a subdirectory": { "s/f": "bytes" },
    "case of the path": { F: "bytes" },
  };
  const ids = [base, ...Object.values(variants).map((files) => id(TREE, tree(t, "w", files), true))];
  assert.equal(new Set(ids).size, ids.length, "all distinct");
  assert.equal(id(TREE, tree(t, "w", { f: "bytes" }), true), base, "restoring restores the ID");
});

test("what it could not state the same everywhere is refused, not normalised", (t) => {
  const link = tree(t, "w", { f: "x" });
  symlinkSync("f", join(link, "l"));
  const hollow = tree(t, "w", { f: "x" });
  mkdirSync(join(hollow, "empty"));
  const empty = mkdtempSync(join(tmpdir(), "empty-"));
  t.after(() => rmSync(empty, { recursive: true, force: true }));
  for (const [what, dir, why] of [["symlink", link, /symlinks/], ["empty directory", hollow, /empty directory/], ["empty tree", empty, /empty directory/], ["case collision", tree(t, "w", { A: "1", a: "2" }), /differ only by case/], ["backslash", tree(t, "w", { "a\\b": "1" }), /backslash/], ["non-NFC", tree(t, "w", { "é": "1" }), /NFC/]] as [string, string, RegExp][]) {
    const r = run("tree-id", CHANGE, dir);
    assert.equal(r.code, 1, what);
    assert.match(r.err, why, what);
  }
  assert.equal(run("tree-id", "two\nlines", link).code, 1, "a domain is one line");
  assert.equal(run("tree-id", CHANGE).code, 2);
});

test("it reproduces the sealed identity of this repository's genesis Change 01, which it did not define", () => {
  const one = join(REPO, ".kaal", "changes", "genesis", "26", "10", "04", "01");
  assert.equal(id(CHANGE, one), "d758700edcf0cb3cd939eddfe418059c7ee0d07def9a519f9aa6a9041f06d662");
  assert.ok(existsSync(join(REPO, ".kaal", "seals", "changes", "d758700edcf0cb3cd939eddfe418059c7ee0d07def9a519f9aa6a9041f06d662")));
});

test("a seal is an empty marker named by the ID: written once, checked, listed, never removed or computed", (t) => {
  const dir = join(mkdtempSync(join(tmpdir(), "seals-")), "seals");
  t.after(() => rmSync(dirname(dir), { recursive: true, force: true }));
  const a = "a".repeat(64);
  const b = "b".repeat(64);
  assert.equal(run("seal", "check", dir, a).code, 1, "not sealed, and the directory need not exist");
  assert.equal(run("seal", "write", dir, a).out, a);
  assert.equal(run("seal", "write", dir, a).code, 0, "sealing again changes nothing");
  assert.equal(statSync(join(dir, a)).size, 0);
  assert.equal(run("seal", "check", dir, a).code, 0);
  assert.equal(run("seal", "check", dir, b).code, 1);
  writeFileSync(join(dir, b), "not empty");
  assert.equal(run("seal", "check", dir, b).code, 1, "only an empty marker is a seal");
  writeFileSync(join(dir, "README"), "x");
  assert.deepEqual(run("seal", "list", dir).out.split("\n"), [a], "a non-empty file is no seal, and anything else in the directory is not a seal");
  assert.equal(run("seal", "write", dir, "xyz").code, 1);
  assert.equal(run("seal", "write", dir, "A".repeat(64)).code, 1);
  assert.equal(run("seal", "remove", dir, a).code, 2, "there is no way to remove a seal");
  assert.deepEqual(readdirSync(dir).sort(), ["README", a, b]);
});
