/*---
tests: [foundation/F26, foundation/F27, foundation/N15, foundation/A26]
---*/
// foundation/C15 planned publisher acceptance; DO moves unchanged to test/publisher/.
// No platform choice; npm is its own CLI under this Node, as existing Foundation cases do.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";
import { sha256 } from "../../05-src/skills/kaal-foundation/scripts/sha256.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const NAME = "@kaihacksai/kaal-foundation";
const NODE = "kaal/Foundation.md";
const PACKED_NODE = `dist/${NODE}`;
const MANIFEST = "dist/test/package-check/verify.json";
const SOURCE_MANIFEST = "04-test/package-check/verify.json";
const ID = "649fbafb81a8d976b65a4e8c0db7228a194ec515385820d489e4a74041dc27c5";
const env = () => ({ ...process.env, NODE_TEST_CONTEXT: undefined, npm_config_audit: "false", npm_config_fund: "false", npm_config_offline: "true" });
function npm(args, cwd) {
  const cli = process.env.npm_execpath;
  assert.ok(cli && /\.[cm]?js$/.test(cli), "run through npm's CLI environment");
  return spawnSync(process.execPath, [cli, ...args], { cwd, env: env(), encoding: "utf8" });
}
function node(source, cwd) {
  return spawnSync(process.execPath, ["--input-type=module", "-e", source], { cwd, env: env(), encoding: "utf8" });
}
function ok(r) { assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`); return r; }
function packed(r) { ok(r); return JSON.parse(r.stdout.slice(r.stdout.indexOf("[")))[0]; }
function inventory(root, prefix = "") {
  return readdirSync(root, { withFileTypes: true }).flatMap(e => {
    const p = prefix + e.name;
    return e.isDirectory() ? inventory(join(root, e.name), p + "/") : [p];
  }).sort();
}
function report(r) {
  const line = r.stdout.trim().split(/\r?\n/).at(-1);
  assert.ok(line?.startsWith("kaal-foundation-verification "), `${r.stdout}\n${r.stderr}`);
  return JSON.parse(line.slice("kaal-foundation-verification ".length));
}
const resolve = `import { createRequire } from 'node:module'; import { readFileSync } from 'node:fs';
const require = createRequire(process.cwd() + '/probe.mjs');
const p = require.resolve('${NAME}/capability');
console.log(JSON.stringify({path:p,bytes:readFileSync(p).toString('hex')}));`;
let work, pack, tarball, sourceManifest;
before(() => {
  work = mkdtempSync(join(tmpdir(), "foundation-declaration-"));
  sourceManifest = readFileSync(join(ROOT, SOURCE_MANIFEST));
  pack = packed(npm(["pack", "--json", "--pack-destination", work], ROOT));
  assert.deepEqual(readFileSync(join(ROOT, SOURCE_MANIFEST)), sourceManifest, "normal pack does not repair committed evidence");
  tarball = join(work, pack.filename);
});
after(() => { if (work) rmSync(work, { recursive: true, force: true }); });
function host(name) {
  const dir = join(work, name);
  mkdirSync(dir);
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name, version: "1.0.0", private: true }));
  return dir;
}
function install(name) {
  const dir = host(name);
  ok(npm(["install", "--no-package-lock", tarball], dir));
  return { dir, installed: join(dir, "node_modules", "@kaihacksai", "kaal-foundation") };
}

test("foundation/T47 [foundation/F26, foundation/N15, foundation/A26]: normal pack preserves committed bytes and exact inventory, and an isolated installed consumer resolves the owner Node and verifies every declared Case", { timeout: 300_000 }, () => {
  const beforeManifest = sourceManifest;
  const dry = packed(npm(["pack", "--dry-run", "--json", "--ignore-scripts"], ROOT));
  const paths = pack.files.map(f => f.path).sort();
  assert.deepEqual(paths, dry.files.map(f => f.path).sort());
  assert.ok(paths.includes(PACKED_NODE), "normal pack delivers the declaration");
  assert.ok(!paths.includes("ownership.kaal.json"), "the repository claim never ships");
  assert.deepEqual(paths.filter(p => p.startsWith("dist/kaal/")), [PACKED_NODE]);
  const { dir, installed } = install("exact");
  const m = JSON.parse(readFileSync(join(installed, MANIFEST), "utf8"));
  assert.deepEqual(paths, [...Object.keys(m.files), MANIFEST].sort());
  assert.deepEqual(inventory(installed), paths);
  assert.deepEqual(readFileSync(join(installed, MANIFEST)), beforeManifest);
  assert.deepEqual(readFileSync(join(ROOT, SOURCE_MANIFEST)), beforeManifest);
  const resolved = JSON.parse(ok(node(resolve, dir)).stdout);
  assert.equal(sha256(Buffer.from(resolved.bytes, "hex")), ID);
  assert.ok(resolved.path.startsWith(installed), "resolution belongs to the installed package");
  assert.deepEqual(Buffer.from(resolved.bytes, "hex"), readFileSync(join(ROOT, NODE)));
  const r = ok(npm(["test"], installed));
  const s = report(r);
  assert.equal(s.result, "verified");
  assert.equal(s.exit, 0);
  assert.deepEqual(s.causes, []);
  assert.deepEqual(s.cases.map(c => c.name).sort(), [...m.cases].sort());
  assert.ok(s.cases.every(c => c.outcome === "pass"));
  assert.ok(s.cases.some(c => c.name === "foundation/T50"));
  const hash = ok(node(`import {sha256} from '${NAME}/sha256'; console.log(sha256(new TextEncoder().encode('abc')));`, dir));
  assert.equal(hash.stdout.trim(), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});

test("foundation/T48 [foundation/F26, foundation/A26]: missing or changed declaration cannot verify, and wrong owner/name/type behind refreshed manifest digests fails an executed delivered Case", { timeout: 300_000 }, () => {
  const { installed } = install("negative");
  const path = join(installed, PACKED_NODE), mf = join(installed, MANIFEST);
  const original = readFileSync(path), originalManifest = readFileSync(mf);
  const verify = () => npm(["test"], installed);
  for (const change of [() => rmSync(path), () => writeFileSync(path, Buffer.concat([original, Buffer.from("\nchanged\n")]))]) {
    change();
    const r = verify(), s = report(r);
    assert.equal(r.status, 2);
    assert.equal(s.result, "cannot verify");
    assert.ok(s.causes.some(c => c.includes(NODE)));
    writeFileSync(path, original);
  }
  for (const wrong of [
    original.toString().replace("name: Foundation", "name: Another"),
    original.toString().replace("name: KAAL Capability", "name: KAAL Skill"),
    original.toString().replace("56fe97bfa390114264f234bc3198103cb46da306736200af7bc47c0484bcf02e", "0".repeat(64)),
  ]) {
    writeFileSync(path, wrong);
    const m = JSON.parse(originalManifest);
    m.files[PACKED_NODE] = sha256(readFileSync(path));
    writeFileSync(mf, JSON.stringify(m, null, 2) + "\n");
    const r = verify(), s = report(r);
    assert.equal(r.status, 1, r.stdout);
    assert.equal(s.result, "failed");
    assert.ok(s.cases.some(c => c.name === "foundation/T50" && c.outcome === "fail"));
    writeFileSync(path, original);
    writeFileSync(mf, originalManifest);
  }
  assert.equal(report(ok(verify())).result, "verified");
});

test("foundation/T49 [foundation/F27, foundation/A26]: install, public read and removal preserve an existing Engine and configuration; an unscoped impostor cannot substitute for an absent scoped export", { timeout: 300_000 }, () => {
  const dir = host("lifecycle"), engine = join(dir, ".kaal");
  mkdirSync(engine);
  writeFileSync(join(engine, "author.md"), "author-owned\n");
  writeFileSync(join(dir, "agent-config.json"), '{"author":true}\n');
  const pkg = readFileSync(join(dir, "package.json"));
  const snapshot = () => ({ files: inventory(engine), author: readFileSync(join(engine, "author.md"), "utf8"), config: readFileSync(join(dir, "agent-config.json"), "utf8") });
  const before = snapshot();
  ok(npm(["install", "--no-save", "--no-package-lock", tarball], dir));
  assert.deepEqual(snapshot(), before);
  assert.deepEqual(readFileSync(join(dir, "package.json")), pkg);
  ok(node(resolve, dir));
  assert.deepEqual(snapshot(), before);
  ok(npm(["uninstall", "--no-save", "--no-package-lock", NAME], dir));
  assert.deepEqual(snapshot(), before);
  assert.deepEqual(readFileSync(join(dir, "package.json")), pkg);
  const fake = join(dir, "node_modules", "kaal-foundation");
  mkdirSync(fake, { recursive: true });
  writeFileSync(join(fake, "package.json"), JSON.stringify({ name: "kaal-foundation", version: "9.9.9", exports: { "./capability": "./Foundation.md" } }));
  writeFileSync(join(fake, "Foundation.md"), "IMPOSTOR\n");
  const missing = node(resolve, dir);
  assert.notEqual(missing.status, 0);
  assert.doesNotMatch(missing.stdout, /IMPOSTOR/);
  assert.deepEqual(snapshot(), before);
});
