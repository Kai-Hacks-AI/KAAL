// foundation/C9 publisher cases, from the review of #717 (issuecomment-6544821400): what npm
// publication needs from the package, and a verify command that reports instead of crashing.
// npm runs as its CLI script under this Node (npm_execpath), with no shell (foundation/N7). Not shipped.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { appendFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const REPOSITORY = join(PACKAGE, "..", "..");
const LINE = "kaal-foundation-verification ";
const manifest = () => JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
const npm = (args, cwd) => {
  const cli = process.env.npm_execpath;
  if (!cli || !/\.[cm]?js$/.test(cli)) return { status: null, stdout: "", out: "npm_execpath names no npm CLI script: run these tests through npm" };
  const env = { ...process.env, npm_config_audit: "false", npm_config_fund: "false", npm_config_offline: "true", NODE_TEST_CONTEXT: undefined };
  const r = spawnSync(process.execPath, [cli, ...args], { cwd, encoding: "utf8", env });
  return { status: r.status, stdout: r.stdout ?? "", out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
};

test("foundation/T33 [foundation/F14, foundation/N10]: installed, kaal-foundation verify on a changed or unloadable library reports cannot verify with exit 2 and ends on the verification line, never a crash", { timeout: 300_000 }, () => {
  const work = mkdtempSync(join(tmpdir(), "kaal-foundation-release-"));
  try {
    const pack = npm(["pack", "--json", "--ignore-scripts", "--pack-destination", work], PACKAGE);
    assert.equal(pack.status, 0, pack.out);
    const tarball = join(work, JSON.parse(pack.stdout.slice(pack.stdout.indexOf("[")))[0].filename);
    const consumer = join(work, "consumer");
    mkdirSync(consumer);
    writeFileSync(join(consumer, "package.json"), JSON.stringify({ name: "consumer", version: "1.0.0", private: true }));
    const install = npm(["install", tarball], consumer);
    assert.equal(install.status, 0, install.out);
    const lib = join(consumer, "node_modules", "@kaihacksai", "kaal-foundation", "lib", "sha256.mjs");
    const original = readFileSync(lib);
    for (const [why, change] of [
      ["a stray line appended to the library", () => appendFileSync(lib, "\nstray;\n")],
      ["a library that throws on import", () => writeFileSync(lib, 'throw new Error("broken");\n')],
    ]) {
      change();
      const r = npm(["exec", "--no", "--package=@kaihacksai/kaal-foundation", "--", "kaal-foundation", "verify"], consumer);
      writeFileSync(lib, original);
      assert.equal(r.status, 2, `${why}: verify exits 2, not a crash: ${r.out}`);
      const last = r.stdout.trim().split(/\r?\n/).at(-1) ?? "";
      assert.ok(last.startsWith(LINE), `${why}: the last line is the verification line: ${r.out}`);
      const s = JSON.parse(last.slice(LINE.length));
      assert.equal(s.result, "cannot verify", why);
      assert.ok(s.causes.some((c) => c.includes("lib/sha256.mjs")), `${why}: the cause names lib/sha256.mjs: ${JSON.stringify(s.causes)}`);
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
});

test("foundation/T34 [foundation/F19]: the package publishes publicly and names its source repository and directory, as provenance requires", () => {
  const m = manifest();
  assert.deepEqual(m.publishConfig, { access: "public" }, "a scoped package's first publish needs public access");
  assert.equal(m.repository?.type, "git");
  assert.equal(m.repository?.url, "git+https://github.com/Kai-Hacks-AI/KAAL.git");
  assert.equal(m.repository?.directory, relative(REPOSITORY, PACKAGE).replaceAll("\\", "/"), "repository.directory is the package's own path");
});
