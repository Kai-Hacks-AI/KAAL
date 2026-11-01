// foundation/T32, added by the Owner's review of foundation/C8 (#712) and revised by foundation/C10
// (Codex on #704): the documented way to run the command is the scoped package's own bin by its path,
// and no other package's kaal-foundation can stand in for it: not an unrelated unscoped package where
// Foundation is missing, and not one installed beside Foundation that owns .bin/kaal-foundation, which
// `npm exec --package=@kaihacksai/kaal-foundation -- kaal-foundation` would run. npm runs as its CLI script under this Node (npm_execpath), offline,
// with no shell and no platform decision (foundation/N7). Not shipped.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const REPOSITORY = join(PACKAGE, "..", "..");
const SCOPED = "@kaihacksai/kaal-foundation";
const DOCUMENTED = `node node_modules/${SCOPED}/bin/kaal-foundation.mjs`;

const run = (args, cwd, input) => {
  const cli = process.env.npm_execpath;
  if (!cli || !/\.[cm]?js$/.test(cli)) return { status: null, stdout: "", out: "npm_execpath names no npm CLI script: run these tests through npm" };
  const env = { ...process.env, npm_config_audit: "false", npm_config_fund: "false", npm_config_offline: "true", NODE_TEST_CONTEXT: undefined };
  const r = spawnSync(process.execPath, [cli, ...args], { cwd, input, encoding: "utf8", env });
  return { status: r.status, stdout: r.stdout ?? "", out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
};
const packed = (dir, into) => {
  const r = run(["pack", "--json", "--ignore-scripts", "--pack-destination", into], dir);
  assert.equal(r.status, 0, r.out);
  return join(into, JSON.parse(r.stdout.slice(r.stdout.indexOf("[")))[0].filename);
};
const consumer = (root, name, tarball) => {
  const dir = join(root, name);
  mkdirSync(dir);
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name, version: "1.0.0", private: true }));
  const r = run(["install", tarball], dir);
  assert.equal(r.status, 0, r.out);
  return dir;
};

let work, tarball, installed;
before(() => {
  work = mkdtempSync(join(tmpdir(), "kaal-foundation-acquisition-"));
  tarball = packed(PACKAGE, work);
  installed = join(consumer(work, "scoped", tarball), "node_modules", "@kaihacksai", "kaal-foundation");
});
after(() => rmSync(work, { recursive: true, force: true }));

test("foundation/T32 [foundation/F18]: every documented invocation runs the scoped package's own bin by its path and none goes through npx or npm exec; the documented command runs Foundation's bin where it is installed, also beside another package's kaal-foundation, and fails, never running the unscoped package, where only an unrelated kaal-foundation is installed", { timeout: 300_000 }, () => {
  const pkg = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
  assert.equal(`node node_modules/${SCOPED}/${pkg.bin["kaal-foundation"]}`, DOCUMENTED, "the documented path is the package's own bin");
  // What the installed copy and the repository's agent instructions tell a consumer to run.
  const texts = { "AGENTS.md": readFileSync(join(REPOSITORY, "AGENTS.md"), "utf8") };
  for (const p of ["README.md", "skills/kaal-foundation/SKILL.md", ...readdirSync(join(installed, "docs")).map((f) => `docs/${f}`)]) texts[p] = readFileSync(join(installed, p), "utf8");
  const offenders = [];
  for (const [path, text] of Object.entries(texts))
    for (const line of text.split("\n")) {
      const throughPath = /\b(npx|npm\s+(exec|x))\b[^\n]*\bkaal-foundation\b/.test(line);
      const warns = /\bnever\b/i.test(line);
      if (throughPath && !warns) offenders.push(`${path}: ${line.trim()}`);
    }
  assert.deepEqual(offenders, [], "no documented invocation runs kaal-foundation through npx or npm exec");
  for (const p of ["README.md", "docs/operations.md", "skills/kaal-foundation/SKILL.md", "AGENTS.md"]) assert.ok(texts[p].includes(DOCUMENTED), `${p} documents ${DOCUMENTED}`);

  const script = DOCUMENTED.split(" ")[1];
  const node = (cwd, ...args) => {
    const r = spawnSync(process.execPath, [script, ...args], { cwd, encoding: "utf8", env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
    return { status: r.status, stdout: r.stdout ?? "", out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
  };
  const digest = `${createHash("sha256").update("abc").digest("hex")}  abc.txt`;
  // Where the scoped package is installed, the documented command is its bin.
  const scoped = dirname(dirname(dirname(installed)));
  writeFileSync(join(scoped, "abc.txt"), "abc");
  const ok = node(scoped, "sha256", "abc.txt");
  assert.equal(ok.status, 0, ok.out);
  assert.equal(ok.stdout.trim().split("\n").at(-1), digest);

  // An unrelated unscoped package named kaal-foundation, with a bin of the same name.
  const fake = join(work, "fake");
  mkdirSync(fake);
  writeFileSync(join(fake, "package.json"), JSON.stringify({ name: "kaal-foundation", version: "9.9.9", bin: { "kaal-foundation": "bin.mjs" } }));
  writeFileSync(join(fake, "bin.mjs"), '#!/usr/bin/env node\nconsole.log("UNSCOPED kaal-foundation ran");\n');
  const impostor = packed(fake, work);

  // Both installed, the impostor last, so it owns node_modules/.bin/kaal-foundation.
  const both = consumer(work, "both", tarball);
  const last = run(["install", impostor], both);
  assert.equal(last.status, 0, last.out);
  writeFileSync(join(both, "abc.txt"), "abc");
  // Control: npm exec with the scoped --package still runs the impostor, which is why no document relies on it.
  const viaPath = run(["exec", "--no", `--package=${SCOPED}`, "--", "kaal-foundation", "sha256", "abc.txt"], both);
  assert.match(viaPath.out, /UNSCOPED kaal-foundation ran/, `npm exec --package does not bind the bin to the scoped package: ${viaPath.out}`);
  const beside = node(both, "sha256", "abc.txt");
  assert.equal(beside.status, 0, beside.out);
  assert.doesNotMatch(beside.out, /UNSCOPED/, "another package's kaal-foundation never stands in for Foundation's");
  assert.equal(beside.stdout.trim().split("\n").at(-1), digest);

  // Only the unscoped package installed.
  const unscoped = consumer(work, "unscoped", impostor);
  // Control: the bare bin name selects the unscoped package, so this fixture would catch that.
  const bare = run(["exec", "--no", "--", "kaal-foundation", "sha256", "package.json"], unscoped);
  assert.match(bare.out, /UNSCOPED kaal-foundation ran/, `the fixture's unscoped bin is reachable by its bare name: ${bare.out}`);
  // The documented command never runs it: without the scoped package it fails.
  const refused = node(unscoped, "sha256", "package.json");
  assert.doesNotMatch(refused.out, /UNSCOPED/, "the documented command never runs the unscoped package");
  assert.notEqual(refused.status, 0, `without the scoped package installed, the documented command fails: ${refused.out}`);
});
