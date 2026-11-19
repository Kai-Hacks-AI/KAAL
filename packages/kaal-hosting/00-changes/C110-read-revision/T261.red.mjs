// Case hosting/T261 tests: hosting/F82 (a fixed number of Git starts), hosting/N12 (no new dependency, no node:test)
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PACKAGE, SCRIPTS, load, repo } from "./fixtures.mjs";

export const id = "hosting/T261";
export const tests = ["hosting/F82", "hosting/N12"];
export const title = "reading five files and eighty files starts Git the same, small number of times; the package keeps exactly its five runtime dependencies and the new source loads no node:test";
export async function run() {
  const h = await load();
  assert.equal(typeof h.readRevision, "function", "readRevision is not exported");
  const trace = mkdtempSync(join(tmpdir(), "hosting-trace-"));
  const was = process.env.GIT_TRACE;
  const starts = async (root, ref) => {
    const file = join(trace, `t-${Math.random().toString(16).slice(2)}`);
    process.env.GIT_TRACE = file;
    try {
      await h.readRevision(root, ref);
    } finally {
      if (was === undefined) delete process.env.GIT_TRACE;
      else process.env.GIT_TRACE = was;
    }
    return readFileSync(file, "utf8").split("\n").filter((l) => /built-in: git /.test(l)).length;
  };
  const small = await repo();
  const large = await repo();
  try {
    for (let i = 0; i < 5; i++) small.write(`f${i}.txt`, `${i}`);
    small.commit("small");
    for (let i = 0; i < 80; i++) large.write(`d${i % 8}/f${i}.txt`, `${i}`);
    large.commit("large");
    const a = await starts(small.dir, "HEAD");
    const b = await starts(large.dir, "HEAD");
    assert.ok(a >= 1 && a <= 4, `five files took ${a} Git starts`);
    assert.equal(b, a, `eighty files took ${b} Git starts, five took ${a}`);
  } finally {
    rmSync(trace, { recursive: true, force: true });
    small.cleanup();
    large.cleanup();
  }
  const manifest = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
  assert.deepEqual(Object.keys(manifest.dependencies).sort(), ["cross-spawn", "es-module-lexer", "graceful-fs", "proper-lockfile", "typescript"], "no runtime dependency is added");
  assert.ok(!/node:test/.test(readFileSync(join(SCRIPTS, "revision.js"), "utf8")), "revision.js loads node:test");
}
