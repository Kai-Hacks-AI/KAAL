// Case hosting/T260 tests: hosting/F81 (entries that are not plain files; the paths of `under`)
import assert from "node:assert/strict";
import { load, repo } from "./fixtures.mjs";

export const id = "hosting/T260";
export const tests = ["hosting/F81"];
export const title = "a symbolic link or submodule entry inside what is asked for is refused as REVISION_ENTRY naming it, and a narrower under reads around it; a bad path in under is INVALID_PATH";
export async function run() {
  const h = await load();
  assert.equal(typeof h.readRevision, "function", "readRevision is not exported");
  const r = await repo();
  try {
    r.write("a.txt", "a");
    r.write("lib/x.txt", "x");
    const base = r.commit("base");
    // The entries are put in the index directly, so no filesystem link is needed on any host.
    r.write("target", "t");
    const blob = r.git("hash-object", "-w", "target");
    r.git("update-index", "--add", "--cacheinfo", `120000,${blob},ln`);
    r.git("update-index", "--add", "--cacheinfo", `160000,${base},sub`);
    r.git("commit", "-q", "-m", "entries");

    await assert.rejects(h.readRevision(r.dir, "HEAD"), (e) => e?.code === "REVISION_ENTRY" && /\b(ln|sub)\b/.test(e.message), "the whole revision holds a link and a submodule");
    await assert.rejects(h.readRevision(r.dir, "HEAD", { under: ["ln"] }), (e) => e?.code === "REVISION_ENTRY" && /\bln\b/.test(e.message), "the link, asked for by name");
    await assert.rejects(h.readRevision(r.dir, "HEAD", { under: ["sub"] }), (e) => e?.code === "REVISION_ENTRY" && /\bsub\b/.test(e.message), "the submodule, asked for by name");
    assert.deepEqual(Object.keys(await h.readRevision(r.dir, "HEAD", { under: ["a.txt", "lib"] })).sort(), ["a.txt", "lib/x.txt"], "a narrower under reads around them");

    for (const bad of ["", "..", "a/../b", "/abs", "C:/x", "a\\b", "./a", "a//b"]) {
      await assert.rejects(h.readRevision(r.dir, "HEAD", { under: [bad] }), (e) => e?.code === "INVALID_PATH", `${JSON.stringify(bad)} is not a repository-relative path`);
    }
  } finally {
    r.cleanup();
  }
}
