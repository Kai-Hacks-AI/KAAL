// Change identity, challenged from outside: expected IDs are built here from
// the written format and a pinned literal, never by calling the production
// hashing twice.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { TestContext } from "node:test";
import { changeId, workId } from "../helpers/change-id.js";

const tree = (t: TestContext, files: Record<string, string | Buffer>, order = Object.keys(files)): string => {
  const dir = mkdtempSync(join(tmpdir(), "change-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  for (const path of order) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), files[path]);
  }
  return dir;
};
const be = (n: number) => Buffer.from(n.toString(16).padStart(16, "0"), "hex");
/** The written format, spelled out for a list of [path, bytes] already in order. */
const expected = (files: [string, string][]) => {
  const h = createHash("sha256").update("KAAL Change v1\n").update(be(files.length));
  for (const [p, c] of files) h.update(be(Buffer.byteLength(p))).update(p).update(be(Buffer.byteLength(c))).update(c);
  return h.digest("hex");
};

test("the ID is the written format, and a pinned fixture keeps it from drifting", (t) => {
  const dir = tree(t, { "retro.md": "# Retro\n" });
  assert.equal(changeId(dir), expected([["retro.md", "# Retro\n"]]));
  assert.equal(changeId(dir), "98ac581a6d9a37547b5df936422b6c5dd7e7a55644443331c5b3858f564a892f");
});

test("the same tree gives the same ID however it was created", (t) => {
  const files = { "retro.md": "r", "a/b.md": "b", "a/c.md": "c", "z.md": "z" };
  const forward = changeId(tree(t, files));
  const backward = changeId(tree(t, files, ["z.md", "a/c.md", "a/b.md", "retro.md"]));
  assert.equal(forward, backward);
  assert.equal(forward, expected([["a/b.md", "b"], ["a/c.md", "c"], ["retro.md", "r"], ["z.md", "z"]]));
});

test("every identity-bearing part of the tree changes the ID", (t) => {
  const base = changeId(tree(t, { "retro.md": "bytes" }));
  const variants: Record<string, Record<string, string>> = {
    "bytes change": { "retro.md": "bytez" },
    "file renamed (same bytes)": { "foo.md": "bytes" },
    "file added": { "retro.md": "bytes", "foo.md": "x" },
    "file moved into a subdirectory": { "sub/retro.md": "bytes" },
    "path spelling changes (case)": { "Retro.md": "bytes" },
    "path spelling changes (extension)": { "retro.txt": "bytes" },
  };
  const ids = [base, ...Object.entries(variants).map(([, files]) => changeId(tree(t, files)))];
  assert.equal(new Set(ids).size, ids.length, "all distinct");
  const two = changeId(tree(t, { "retro.md": "bytes", "foo.md": "x" }));
  assert.notEqual(two, base);
  assert.equal(changeId(tree(t, { "retro.md": "bytes" })), base, "removing the file again restores the ID");
});

test("framing is unambiguous: moving bytes between path and content cannot collide", (t) => {
  assert.notEqual(changeId(tree(t, { "ab": "c" })), changeId(tree(t, { "a": "bc" })));
  assert.notEqual(changeId(tree(t, { "a": "", "b": "x" })), changeId(tree(t, { "a": "x", "b": "" })));
});

test("empty files count, and the empty tree has no identity", (t) => {
  assert.equal(changeId(tree(t, { "x": "" })), expected([["x", ""]]));
  assert.notEqual(changeId(tree(t, { "x": "" })), changeId(tree(t, { "x": "", "y": "" })));
  assert.throws(() => changeId(mkdtempSync(join(tmpdir(), "empty-"))), /empty directory/);
});

test("raw bytes: line endings and non-text bytes are hashed as they are", (t) => {
  assert.notEqual(changeId(tree(t, { "r": "a\nb" })), changeId(tree(t, { "r": "a\r\nb" })));
  const binary = Buffer.from([0, 255, 10, 13, 128]);
  const h = createHash("sha256").update("KAAL Change v1\n").update(be(1)).update(be(1)).update("r").update(be(5)).update(binary);
  assert.equal(changeId(tree(t, { r: binary })), h.digest("hex"));
});

test("paths are UTF-8 bytes in bytewise order, and must already be NFC", (t) => {
  const files = { "é.md": "1", "z.md": "2" };
  assert.equal(changeId(tree(t, files)), expected([["z.md", "2"], ["é.md", "1"]]));
  assert.throws(() => changeId(tree(t, { "é.md": "1" })), /NFC/);
});

test("unsupported objects and ambiguous names are refused, not hashed", (t) => {
  const withLink = tree(t, { "retro.md": "r" });
  symlinkSync("retro.md", join(withLink, "link.md"));
  assert.throws(() => changeId(withLink), /symlinks/);
  const withEmptyDir = tree(t, { "retro.md": "r" });
  mkdirSync(join(withEmptyDir, "hollow"));
  assert.throws(() => changeId(withEmptyDir), /empty directory/);
  assert.throws(() => changeId(tree(t, { "a.md": "1", "A.md": "2" })), /only by case/);
  assert.throws(() => changeId(tree(t, { "a\\b.md": "1" })), /backslash/);
  assert.throws(() => changeId(tree(t, { "a\nb.md": "1" })), /control/);
});

test("a Work's ID is the same stream under its own tag, over paths relative to the Work root", (t) => {
  const files = { "a": "a", "b/c": "c" };
  const h = createHash("sha256").update("KAAL Work v1\n").update(be(2));
  for (const [p, c] of [["a", "a"], ["b/c", "c"]]) h.update(be(Buffer.byteLength(p))).update(p).update(be(Buffer.byteLength(c))).update(c);
  const dir = tree(t, files);
  assert.equal(workId(dir), h.digest("hex"));
  assert.notEqual(workId(dir), changeId(dir), "a Work and a Change of the same bytes never share an ID");
});

test("a Work's location is not identity: the same tree anywhere, however built, has one ID", (t) => {
  const files = { "a": "a", "b/c": "c" };
  const here = tree(t, files);
  const there = tree(t, files, ["b/c", "a"]);
  assert.equal(workId(here), workId(there));
  assert.notEqual(workId(tree(t, { "a": "a", "b/d": "c" })), workId(here), "an inner rename is another Work");
  assert.notEqual(workId(tree(t, { "a": "a", "b/c": "c", "e": "e" })), workId(here), "an addition is another Work");
  assert.notEqual(workId(tree(t, { "a": "a" })), workId(here), "a deletion is another Work");
  assert.notEqual(workId(tree(t, { "a": "a", "b/c": "C" })), workId(here), "an edit is another Work");
});
