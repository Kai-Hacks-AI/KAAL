// foundation/T32, added by the Owner's review of foundation/C8 (#712): the documented way to run the
// command names the scoped package explicitly, and it cannot silently select an unrelated unscoped
// package called kaal-foundation. npm runs as its CLI script under this Node (npm_execpath), offline,
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
const DOCUMENTED = `npm exec --no --package=${SCOPED} -- kaal-foundation`;

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

let work, installed;
before(() => {
  work = mkdtempSync(join(tmpdir(), "kaal-foundation-acquisition-"));
  installed = join(consumer(work, "scoped", packed(PACKAGE, work)), "node_modules", "@kaihacksai", "kaal-foundation");
});
after(() => rmSync(work, { recursive: true, force: true }));

test("foundation/T32 [foundation/F18]: every documented invocation names the scoped package, and the documented command runs the scoped bin where it is installed and fails, never running the unscoped package, where only an unrelated kaal-foundation is installed", { timeout: 300_000 }, () => {
  // What the installed copy and the repository's agent instructions tell a consumer to run.
  const texts = { "AGENTS.md": readFileSync(join(REPOSITORY, "AGENTS.md"), "utf8") };
  for (const p of ["README.md", "skills/kaal-foundation/SKILL.md", ...readdirSync(join(installed, "docs")).map((f) => `docs/${f}`)]) texts[p] = readFileSync(join(installed, p), "utf8");
  const offenders = [];
  for (const [path, text] of Object.entries(texts))
    for (const line of text.split("\n")) {
      const invokes = /\b(npx|npm\s+(exec|x))\b[^\n]*\bkaal-foundation\b/.test(line);
      const warns = /\b(never|not)\b[^\n]*`npx kaal-foundation`/i.test(line);
      if (invokes && !warns && !line.includes(`--package=${SCOPED}`)) offenders.push(`${path}: ${line.trim()}`);
    }
  assert.deepEqual(offenders, [], "every documented invocation names the scoped package");
  for (const p of ["README.md", "docs/operations.md", "skills/kaal-foundation/SKILL.md", "AGENTS.md"]) assert.ok(texts[p].includes(DOCUMENTED), `${p} documents ${DOCUMENTED}`);

  const args = (...rest) => [...DOCUMENTED.split(" ").slice(1), ...rest];
  // Where the scoped package is installed, the documented command is its bin.
  const scoped = dirname(dirname(dirname(installed)));
  writeFileSync(join(scoped, "abc.txt"), "abc");
  const ok = run(args("sha256", "abc.txt"), scoped);
  assert.equal(ok.status, 0, ok.out);
  assert.equal(ok.stdout.trim().split("\n").at(-1), `${createHash("sha256").update("abc").digest("hex")}  abc.txt`);

  // An unrelated unscoped package named kaal-foundation, with a bin of the same name.
  const fake = join(work, "fake");
  mkdirSync(fake);
  writeFileSync(join(fake, "package.json"), JSON.stringify({ name: "kaal-foundation", version: "9.9.9", bin: { "kaal-foundation": "bin.mjs" } }));
  writeFileSync(join(fake, "bin.mjs"), '#!/usr/bin/env node\nconsole.log("UNSCOPED kaal-foundation ran");\n');
  const unscoped = consumer(work, "unscoped", packed(fake, work));
  // Control: the bare bin name selects the unscoped package, so this fixture would catch that.
  const bare = run(["exec", "--no", "--", "kaal-foundation", "sha256", "package.json"], unscoped);
  assert.match(bare.out, /UNSCOPED kaal-foundation ran/, `the fixture's unscoped bin is reachable by its bare name: ${bare.out}`);
  // The documented command never runs it: without the scoped package it fails.
  const refused = run(args("sha256", "package.json"), unscoped);
  assert.doesNotMatch(refused.out, /UNSCOPED/, "the documented command never runs the unscoped package");
  assert.notEqual(refused.status, 0, `without the scoped package installed, the documented command fails: ${refused.out}`);
});
