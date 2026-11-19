// Case hosting/T258 tests: hosting/F80
import assert from "node:assert/strict";
import { load, repo } from "./fixtures.mjs";

export const id = "hosting/T258";
export const tests = ["hosting/F80"];
export const title = "readRevision returns the committed bytes of a revision, exactly, whole or limited by `under`, never the working tree, and writes nothing; revision names the commit";
export async function run() {
  const h = await load();
  assert.equal(typeof h.readRevision, "function", "readRevision is not exported");
  assert.equal(typeof h.revision, "function", "revision is not exported");
  const r = await repo();
  try {
    const bin = Buffer.from([0xff, 0xfe, 0x00, 0x62, 0x69, 0x6e]);
    r.write("b.bin", bin);
    r.write("d/a.txt", "one");
    r.write("d/e/f.txt", "deep");
    r.write("top.txt", "top");
    const first = r.commit("one");
    r.write("d/a.txt", "two");
    r.write("new.txt", "new");
    r.commit("two");
    r.write("top.txt", "uncommitted");
    const before = r.git("status", "--porcelain");

    const files = await h.readRevision(r.dir, first);
    assert.deepEqual(Object.keys(files).sort(), ["b.bin", "d/a.txt", "d/e/f.txt", "top.txt"], "the commit's files, keyed by / paths, and not a later file");
    assert.ok(Buffer.isBuffer(files["b.bin"]) && files["b.bin"].equals(bin), "bytes that are not text stay exactly as committed");
    assert.equal(files["d/a.txt"].toString(), "one", "the commit's content, not a later commit's");
    assert.equal(files["top.txt"].toString(), "top", "the commit's content, not the working tree's");
    assert.deepEqual(await h.readRevision(r.dir, "HEAD~1"), files, "a ref by any name reads the same commit");
    assert.deepEqual(await h.readRevision(r.dir, "main"), await h.readRevision(r.dir, "HEAD"));

    assert.deepEqual(Object.keys(await h.readRevision(r.dir, first, { under: ["d"] })).sort(), ["d/a.txt", "d/e/f.txt"], "a folder");
    assert.deepEqual(Object.keys(await h.readRevision(r.dir, first, { under: ["d/"] })).sort(), ["d/a.txt", "d/e/f.txt"], "a trailing slash is the same folder");
    assert.deepEqual(Object.keys(await h.readRevision(r.dir, first, { under: ["d/a.txt", "top.txt"] })).sort(), ["d/a.txt", "top.txt"], "files");
    assert.deepEqual(await h.readRevision(r.dir, first, { under: ["nope"] }), {}, "a path the commit does not hold gives nothing, not an error");

    assert.deepEqual(await h.revision(r.dir, first), { commit: first });
    assert.equal(r.git("status", "--porcelain"), before, "reading changed nothing in the repository");
  } finally {
    r.cleanup();
  }
}
