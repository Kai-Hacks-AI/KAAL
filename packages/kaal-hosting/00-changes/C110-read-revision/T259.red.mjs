// Case hosting/T259 tests: hosting/F81 (outcomes kept apart; a ref is data)
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { load, repo } from "./fixtures.mjs";

export const id = "hosting/T259";
export const tests = ["hosting/F81"];
export const title = "no such revision is REVISION_NOT_FOUND and an unreadable repository or Git is REVISION_UNREADABLE, never the same; a ref that starts with a dash is data, not an option";
export async function run() {
  const h = await load();
  assert.equal(typeof h.readRevision, "function", "readRevision is not exported");
  const code = (c) => (e) => {
    assert.equal(e?.name, "HostingError");
    assert.equal(e.code, c, `expected ${c}, got ${e?.code}: ${e?.message}`);
    return true;
  };
  const r = await repo();
  const plain = mkdtempSync(join(tmpdir(), "hosting-notrepo-"));
  const path = process.env.PATH;
  const ceiling = process.env.GIT_CEILING_DIRECTORIES;
  try {
    r.write("a.txt", "a");
    const head = r.commit("one");
    for (const ref of ["no-such-ref", "", "a\nb", "-x", "--output=pwned", `${head}~9`, r.git("rev-parse", "HEAD:a.txt"), r.git("rev-parse", "HEAD^{tree}")]) {
      await assert.rejects(h.readRevision(r.dir, ref), code("REVISION_NOT_FOUND"), `${JSON.stringify(ref)} names no commit`);
      await assert.rejects(h.revision(r.dir, ref), code("REVISION_NOT_FOUND"), `${JSON.stringify(ref)} names no commit (revision)`);
    }
    assert.equal(existsSync(join(r.dir, "pwned")), false, "a ref was taken for an option");

    process.env.GIT_CEILING_DIRECTORIES = tmpdir();
    await assert.rejects(h.readRevision(plain, "HEAD"), code("REVISION_UNREADABLE"), "a directory that is not a repository cannot be read");
    await assert.rejects(h.readRevision(join(plain, "missing"), "HEAD"), code("REVISION_UNREADABLE"), "a directory that does not exist cannot be read");
    process.env.PATH = "";
    await assert.rejects(h.readRevision(r.dir, "HEAD"), code("REVISION_UNREADABLE"), "Git that cannot be started cannot be read");
  } finally {
    process.env.PATH = path;
    if (ceiling === undefined) delete process.env.GIT_CEILING_DIRECTORIES;
    else process.env.GIT_CEILING_DIRECTORIES = ceiling;
    rmSync(plain, { recursive: true, force: true });
    r.cleanup();
  }
}
