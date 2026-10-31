// core/T96, added by the Owner's review of core/C29 (#704): safe acquisition. Every documented way to
// install or run kaal-core names the scoped package `@kaihacksai/kaal-core` (core/F74), and the
// documented command, `npm exec --no --package=@kaihacksai/kaal-core -- kaal`, runs the scoped
// package's `kaal` where it is installed and fails, never running another package, where only an
// unrelated unscoped `kaal-core` with a `kaal` bin is installed.
//
// The rename to the scoped name is pending (core/T79). Until it lands, the positive case installs the
// packed candidate as a copy whose package.json names it `@kaihacksai/kaal-core`, which is what the
// publication will be; once the package is scoped, it installs the candidate itself.
//
// npm runs as its CLI script under this Node (npm_execpath), offline, through Hosting, with no shell
// and no platform decision (core/F88). Run it through npm. Not shipped.
import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { execute } from "kaal-hosting";

const CORE = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPOSITORY = join(CORE, "..", "..");
const SCOPED = "@kaihacksai/kaal-core";
const DOCUMENTED = `npm exec --no --package=${SCOPED} -- kaal`;
const DEPENDENCIES = [join(REPOSITORY, "packages", "kaal-foundation"), join(REPOSITORY, "packages", "extensions", "kaal-hosting")];

const npm = async (args, cwd) => {
  const cli = process.env.npm_execpath;
  if (!cli || !/\.[cm]?js$/.test(cli)) return { status: null, stdout: "", out: "npm_execpath names no npm CLI script: run these tests through npm" };
  const env = { ...process.env, npm_config_audit: "false", npm_config_fund: "false", npm_config_offline: "true", NODE_TEST_CONTEXT: undefined };
  for (const k of Object.keys(env)) if (/^npm_config_(dry_run|json|pack_destination|ignore_scripts|workspaces?)$/i.test(k)) delete env[k];
  const r = await execute(process.execPath, [cli, ...args], { cwd, env });
  return { status: r.status, stdout: r.stdout, out: `${r.stdout}${r.stderr}` };
};
const pack = async (dir, into) => {
  const r = await npm(["pack", "--json", "--ignore-scripts", "--pack-destination", into], dir);
  assert.equal(r.status, 0, r.out);
  return join(into, JSON.parse(r.stdout.slice(r.stdout.indexOf("[")))[0].filename);
};
const consumer = async (root, name, tarballs) => {
  const dir = join(root, name);
  mkdirSync(dir);
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name, version: "1.0.0", private: true }));
  const r = await npm(["install", "--no-package-lock", ...tarballs], dir);
  assert.equal(r.status, 0, r.out);
  return dir;
};

/** The candidate as it publishes: itself once scoped, until then a copy of its packed files named `@kaihacksai/kaal-core`. */
async function scopedCandidate(work) {
  const pkg = JSON.parse(readFileSync(join(CORE, "package.json"), "utf8"));
  if (pkg.name === SCOPED) return pack(CORE, work);
  const listed = await npm(["pack", "--dry-run", "--json", "--ignore-scripts"], CORE);
  assert.equal(listed.status, 0, listed.out);
  const stage = join(work, "stage");
  for (const f of JSON.parse(listed.stdout.slice(listed.stdout.indexOf("[")))[0].files.map((x) => x.path)) cpSync(join(CORE, f), join(stage, f), { recursive: true });
  writeFileSync(join(stage, "package.json"), `${JSON.stringify({ ...pkg, name: SCOPED }, null, 2)}\n`);
  return pack(stage, work);
}

/** Code a document shows: every fenced line, and each inline span except one on a line that warns against it ("never"). */
const code = (text) => {
  const fenced = [...text.matchAll(/```[^\n]*\n([\s\S]*?)```/g)].flatMap((m) => m[1].split("\n"));
  const prose = text.replace(/```[\s\S]*?```/g, "").split("\n").filter((line) => !/\bnever\b/i.test(line));
  return fenced.concat(prose.flatMap((line) => [...line.matchAll(/`([^`\n]+)`/g)].map((m) => m[1])));
};

let work, scoped, unscoped;
before(async () => {
  work = mkdtempSync(join(tmpdir(), "kaal-core-acquisition-"));
  const dependencies = [];
  for (const d of DEPENDENCIES) dependencies.push(await pack(d, work));
  scoped = await consumer(work, "scoped", [await scopedCandidate(work), ...dependencies]);
  // An unrelated unscoped package named kaal-core, with a bin named kaal.
  const fake = join(work, "fake");
  mkdirSync(fake);
  writeFileSync(join(fake, "package.json"), JSON.stringify({ name: "kaal-core", version: "9.9.9", bin: { kaal: "bin.mjs" } }));
  writeFileSync(join(fake, "bin.mjs"), '#!/usr/bin/env node\nconsole.log("UNSCOPED kaal-core ran");\n');
  unscoped = await consumer(work, "unscoped", [await pack(fake, work)]);
});
after(() => rmSync(work, { recursive: true, force: true }));

describe("kaal-core's safe acquisition (core/C29, the Owner's review on #704)", () => {
  it("core/T96 [core/F74, core/F69]: every documented install or run of kaal-core names the scoped package; an unscoped name appears only in prose that warns against it", () => {
    const docs = ["README.md", ...readdirSync(join(CORE, "docs")).map((f) => `docs/${f}`)];
    const offenders = [];
    for (const path of docs) {
      const text = readFileSync(join(CORE, path), "utf8");
      for (const c of code(text)) {
        const acquires = /^\s*(npx\b|npm\s+(install|i|exec|x|explore|uninstall)\b)/.test(c);
        const names = /\bkaal(-core)?\b/.test(c) && !/\.tgz\b/.test(c);
        if (acquires && names && !c.includes(SCOPED)) offenders.push(`${path}: ${c.trim()}`);
      }
    }
    assert.deepEqual(offenders, [], "every documented acquisition names the scoped package");
    const operations = readFileSync(join(CORE, "docs", "operations.md"), "utf8");
    for (const expected of [`npm install ${SCOPED}`, DOCUMENTED, `npm explore ${SCOPED} -- npm test`, `npm uninstall ${SCOPED}`]) assert.ok(operations.includes(expected), `docs/operations.md documents ${expected}`);
    assert.ok(readFileSync(join(CORE, "README.md"), "utf8").includes(DOCUMENTED), `README.md documents ${DOCUMENTED}`);
  });

  it("core/T96 [core/F74]: the documented command runs the scoped package's kaal where it is installed, and fails without running anything else where only an unscoped kaal-core is installed", { timeout: 600_000 }, async () => {
    const args = (...rest) => [...DOCUMENTED.split(" ").slice(1), ...rest];
    const ok = await npm(args("version"), scoped);
    assert.equal(ok.status, 0, ok.out);
    assert.match(ok.stdout, /^kaal-core \d+\.\d+\.\d+/m, ok.out);

    // Control: the bare bin name selects the unscoped package, so this fixture would catch that.
    const bare = await npm(["exec", "--no", "--", "kaal", "version"], unscoped);
    assert.match(bare.out, /UNSCOPED kaal-core ran/, `the fixture's unscoped bin is reachable by its bare name: ${bare.out}`);
    const refused = await npm(args("version"), unscoped);
    assert.doesNotMatch(refused.out, /UNSCOPED/, "the documented command never runs the unscoped package");
    assert.notEqual(refused.status, 0, `without the scoped package installed, the documented command fails: ${refused.out}`);
  });
});
