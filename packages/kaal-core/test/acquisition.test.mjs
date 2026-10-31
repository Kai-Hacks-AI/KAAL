// core/T96, added by the Owner's review of core/C29 (#704): safe acquisition. Every documented way to
// install or run kaal-core names the scoped package `@kaihacksai/kaal-core` (core/F74), and the
// documented command runs the scoped package's own bin where it is installed, also beside another
// package's `kaal`, and fails, never running another package, where only an
// unrelated unscoped `kaal-core` with a `kaal` bin is installed.
//
// Revised after Codex's review on #704: `npm exec --package=<scoped> -- kaal` runs whichever installed
// package owns node_modules/.bin/kaal, so the documented command is the scoped package's own bin by
// its path, `node node_modules/@kaihacksai/kaal-core/dist/cli.js`, and a fixture installs both packages
// side by side.
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
const DOCUMENTED = `node node_modules/${SCOPED}/dist/cli.js`;
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

let work, scoped, both, unscoped, current;
before(async () => {
  work = mkdtempSync(join(tmpdir(), "kaal-core-acquisition-"));
  const dependencies = [];
  for (const d of DEPENDENCIES) dependencies.push(await pack(d, work));
  const candidate = await scopedCandidate(work);
  // The candidate as it is today, from its own tarball: under its current name until the rename.
  current = await consumer(work, "current", [await pack(CORE, work), ...dependencies]);
  scoped = await consumer(work, "scoped", [candidate, ...dependencies]);
  // An unrelated unscoped package named kaal-core, with a bin named kaal.
  const fake = join(work, "fake");
  mkdirSync(fake);
  writeFileSync(join(fake, "package.json"), JSON.stringify({ name: "kaal-core", version: "9.9.9", bin: { kaal: "bin.mjs" } }));
  writeFileSync(join(fake, "bin.mjs"), '#!/usr/bin/env node\nconsole.log("UNSCOPED kaal-core ran");\n');
  const impostor = await pack(fake, work);
  unscoped = await consumer(work, "unscoped", [impostor]);
  // Both, with the impostor installed last, so it owns node_modules/.bin/kaal.
  both = await consumer(work, "both", [candidate, ...dependencies]);
  const last = await npm(["install", "--no-package-lock", impostor], both);
  assert.equal(last.status, 0, last.out);
});
after(() => rmSync(work, { recursive: true, force: true }));

describe("kaal-core's safe acquisition (core/C29, the Owner's review on #704)", () => {
  it("core/T96 [core/F74, core/F69]: every documented install of kaal-core names the scoped package, none runs kaal through npx or npm exec, and such a command appears only in prose that warns against it", () => {
    const docs = ["README.md", ...readdirSync(join(CORE, "docs")).map((f) => `docs/${f}`)];
    const offenders = [];
    for (const path of docs) {
      const text = readFileSync(join(CORE, path), "utf8");
      for (const c of code(text)) {
        const names = /\bkaal(-core)?\b/.test(c) && !/\.tgz\b/.test(c);
        // Running through PATH (npx, npm exec) can reach another package's kaal, scoped or not.
        const throughPath = /^\s*(npx\b|npm\s+(exec|x)\b)/.test(c);
        const acquires = /^\s*npm\s+(install|i)\b/.test(c);
        if (names && (throughPath || (acquires && !c.includes(SCOPED)))) offenders.push(`${path}: ${c.trim()}`);
      }
    }
    assert.deepEqual(offenders, [], "every documented acquisition names the scoped package");
    const operations = readFileSync(join(CORE, "docs", "operations.md"), "utf8");
    for (const expected of [`npm install ${SCOPED}`, `${DOCUMENTED} <command>`, `npm explore ${SCOPED} -- npm test`, `npm uninstall ${SCOPED}`]) assert.ok(operations.includes(expected), `docs/operations.md documents ${expected}`);
    assert.ok(readFileSync(join(CORE, "README.md"), "utf8").includes(DOCUMENTED), `README.md documents ${DOCUMENTED}`);
  });

  it("core/T96 [core/F74]: the documented command runs the scoped package's own bin where it is installed, also beside another package's kaal, and fails without running anything else where only an unscoped kaal-core is installed", { timeout: 600_000 }, async () => {
    const pkg = JSON.parse(readFileSync(join(CORE, "package.json"), "utf8"));
    assert.equal(pkg.bin?.kaal, "dist/cli.js", "the documented path is the package's own bin");
    const [cmd, script] = DOCUMENTED.split(" ");
    assert.equal(cmd, "node");
    const run = (cwd) => execute(process.execPath, [script, "version"], { cwd, env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
    const printsVersion = (r) => r.stdout.split(/\r?\n/).includes(`kaal-core ${pkg.version}`);

    const ok = await run(scoped);
    assert.equal(ok.status, 0, `${ok.stdout}${ok.stderr}`);
    assert.ok(printsVersion(ok), ok.stdout);

    // Both installed, the impostor owning node_modules/.bin/kaal. Control: npm exec with the scoped
    // --package still runs the impostor, which is why the documentation never relies on it.
    const viaPath = await npm(["exec", "--no", `--package=${SCOPED}`, "--", "kaal", "version"], both);
    assert.match(viaPath.out, /UNSCOPED kaal-core ran/, `npm exec --package does not bind kaal to the scoped package: ${viaPath.out}`);
    const beside = await run(both);
    assert.equal(beside.status, 0, `${beside.stdout}${beside.stderr}`);
    assert.ok(printsVersion(beside), beside.stdout);
    assert.doesNotMatch(`${beside.stdout}${beside.stderr}`, /UNSCOPED/, "another package's kaal never stands in for kaal-core");

    // Control: the bare bin name selects the unscoped package, so this fixture would catch that.
    const bare = await npm(["exec", "--no", "--", "kaal", "version"], unscoped);
    assert.match(bare.out, /UNSCOPED kaal-core ran/, `the fixture's unscoped bin is reachable by its bare name: ${bare.out}`);
    const refused = await run(unscoped);
    assert.doesNotMatch(`${refused.stdout}${refused.stderr}`, /UNSCOPED/, "the documented command never runs the unscoped package");
    assert.notEqual(refused.status, 0, "without the scoped package installed, the documented command fails");
  });

  it("core/T96 [core/F74, core/F69]: until the rename, the documents also say how to run and verify the tarball as it installs today, and that command runs it", { timeout: 600_000 }, async () => {
    const pkg = JSON.parse(readFileSync(join(CORE, "package.json"), "utf8"));
    const today = `node node_modules/${pkg.name}/dist/cli.js`;
    if (pkg.name !== SCOPED) {
      const operations = readFileSync(join(CORE, "docs", "operations.md"), "utf8");
      for (const expected of [`${today} <command>`, `npm explore ${pkg.name} -- npm test`]) assert.ok(operations.includes(expected), `docs/operations.md documents ${expected} for the tarball installed today`);
    }
    const r = await execute(process.execPath, [today.split(" ")[1], "version"], { cwd: current, env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
    assert.equal(r.status, 0, `${r.stdout}${r.stderr}`);
    assert.ok(r.stdout.split(/\r?\n/).includes(`kaal-core ${pkg.version}`), r.stdout);
  });
});
