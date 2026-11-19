// Case hosting/T265 tests: hosting/F80 (under is literal: Git pathspec syntax cannot broaden or change a read)
import assert from "node:assert/strict";
import { load, repo } from "./fixtures.mjs";

export const id = "hosting/T265";
export const tests = ["hosting/F80"];
export const title = "under is read as literal repository-relative names: wildcards and Git pathspec magic match nothing, and a file whose name looks like pathspec syntax is read by exactly that name";
export async function run() {
  const h = await load();
  assert.equal(typeof h.readRevision, "function", "readRevision is not exported");
  const r = await repo();
  try {
    r.write("a.txt", "a");
    r.write("b.txt", "b");
    r.write("d/x.txt", "x");
    const plain = r.commit("plain");
    // Names that look like pathspec syntax are put in the index directly, so no host has to hold them as files.
    const blob = r.git("hash-object", "-w", "a.txt");
    for (const name of [":(glob)lit", "*.lit", "q?.lit", "[ab].lit"]) r.git("update-index", "--add", "--cacheinfo", `100644,${blob},${name}`);
    r.git("commit", "-q", "-m", "odd names");

    const keys = async (under) => Object.keys(await h.readRevision(r.dir, "HEAD", { under })).sort();
    for (const magic of ["*.txt", "**/*.txt", "?.txt", "[ab].txt", "d/*", ":(glob)**/*.txt", ":(exclude)a.txt", ":!a.txt", ":(top)d", ":/", ":(icase)A.TXT", ":(attr:foo)a.txt"]) {
      assert.deepEqual(await keys([magic]), [], `${magic} is a literal name, and no file has it: it must not match a.txt, b.txt or d/x.txt`);
    }
    assert.deepEqual(await keys([":(glob)lit"]), [":(glob)lit"], "a file named like pathspec magic is read by exactly that name");
    assert.deepEqual(await keys(["*.lit"]), ["*.lit"], "a file named with a star is that file alone, not every .lit file");
    assert.deepEqual(await keys(["q?.lit"]), ["q?.lit"]);
    assert.deepEqual(await keys(["[ab].lit"]), ["[ab].lit"]);
    assert.deepEqual(await keys(["d", "a.txt"]), ["a.txt", "d/x.txt"], "plain names still read as before");
    assert.deepEqual(Object.keys(await h.readRevision(r.dir, plain, { under: ["*.txt"] })), [], "the same on the earlier commit");
  } finally {
    r.cleanup();
  }
}
