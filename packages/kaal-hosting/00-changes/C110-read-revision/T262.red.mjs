// Case hosting/T262 tests: hosting/F83 (the command is the library's one implementation, printing facts)
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { SCRIPTS, load, repo } from "./fixtures.mjs";

export const id = "hosting/T262";
export const tests = ["hosting/F83"];
export const title = "kaal-hosting-revision prints one line of facts that agrees with readRevision, exits 0 when read (also when under matches nothing) and 2 when not, never 1, and never prints the bytes";
export async function run() {
  const h = await load();
  const cli = join(SCRIPTS, "revision-cli.mjs");
  assert.ok(existsSync(cli), "the command revision-cli.mjs is not built into dist");
  const r = await repo();
  try {
    r.write("d/a.txt", "SECRET-CONTENT");
    r.write("b.bin", Buffer.from([0xff, 0x00, 0x01]));
    const head = r.commit("one");
    const run = (...args) => {
      const out = h.executeSync(process.execPath, [cli, ...args], { cwd: r.dir });
      const lines = out.stdout.trim().split("\n");
      assert.equal(lines.length, 1, `one line, got: ${out.stdout}`);
      assert.ok(lines[0].startsWith("kaal-hosting-revision "), lines[0]);
      return { status: out.status, out: out.stdout, fact: JSON.parse(lines[0].slice("kaal-hosting-revision ".length)) };
    };

    const all = run("--root", r.dir, "--ref", "HEAD");
    assert.equal(all.status, 0);
    assert.equal(all.fact.result, "read");
    assert.equal(all.fact.commit, head);
    const files = await h.readRevision(r.dir, "HEAD");
    assert.deepEqual(all.fact.files, Object.keys(files).sort().map((path) => ({ path, bytes: files[path].length, sha256: h.digest(files[path]) })), "the command and the library agree");
    assert.ok(!all.out.includes("SECRET-CONTENT"), "the bytes are not printed");

    const some = run("--root", r.dir, "--ref", "HEAD", "--under", "d");
    assert.deepEqual(some.fact.files.map((f) => f.path), ["d/a.txt"]);
    const none = run("--root", r.dir, "--ref", "HEAD", "--under", "nope");
    assert.equal(none.status, 0, "under matching nothing is a read, not an error");
    assert.deepEqual(none.fact.files, []);

    const missing = run("--root", r.dir, "--ref", "no-such-ref");
    assert.equal(missing.status, 2);
    assert.equal(missing.fact.result, "cannot-determine");
    assert.equal(missing.fact.code, "REVISION_NOT_FOUND");
    const dash = run("--root", r.dir, "--ref", "-x");
    assert.equal(dash.status, 2);
    assert.equal(dash.fact.code, "REVISION_NOT_FOUND");
    const bad = run("--root", r.dir, "--ref", "HEAD", "--under", "..");
    assert.equal(bad.status, 2);
    assert.equal(bad.fact.code, "INVALID_PATH");
    const usage = run("--root", r.dir);
    assert.equal(usage.status, 2);
    assert.equal(usage.fact.code, "USAGE");
  } finally {
    r.cleanup();
  }
}
