// foundation/C15 planned scenario. DO keeps it in test/acceptance/ until Testing discovery reads the final layout (foundation/C20).
// Existing Testing discovery and Engineering's pack-once ledger own execution.
import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { install } from "kaal-testing/acceptance";
import { spawnSync } from "node:child_process";
import { lstat, readFile } from "node:fs/promises";
import { sha256 } from "../../05-src/skills/kaal-foundation/scripts/sha256.mjs";

// Node's own facilities, so this scenario does not depend on how Hosting is named.
const execute = async (command, args, options) => {
  const cli = process.env.npm_execpath;
  if (command === "npm") assert.ok(cli && /\.[cm]?js$/.test(cli), "npm_execpath names npm's CLI script: run these tests through npm");
  const r = spawnSync(process.execPath, command === "npm" ? [cli, ...args] : [...args], { ...options, encoding: "utf8" });
  return { status: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
};
const kind = async (path) => (await lstat(path).then((s) => (s.isDirectory() ? "directory" : "file"), () => "missing"));

test("foundation/T51 [foundation/F25, foundation/F26, foundation/F27, foundation/N15]: a ledger-recorded clean consumer resolves and verifies the exact Foundation declaration candidate", async () => {
  const host = await install(["@kaihacksai/kaal-foundation"], { offline: true });
  const installed = join(host, "node_modules", "@kaihacksai", "kaal-foundation");
  const before = await readFile(join(host, "package.json"));
  assert.equal(await kind(join(host, ".kaal")), "missing");
  const source = `import {createRequire} from 'node:module'; import {readFileSync} from 'node:fs';
    import {sha256} from '@kaihacksai/kaal-foundation/sha256';
    const require=createRequire(process.cwd()+'/probe.mjs');
    console.log(sha256(readFileSync(require.resolve('@kaihacksai/kaal-foundation/capability'))));`;
  const resolved = await execute(process.execPath, ["--input-type=module", "-e", source], { cwd: host, env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
  assert.equal(resolved.status, 0, resolved.stderr);
  assert.equal(resolved.stdout.trim(), "649fbafb81a8d976b65a4e8c0db7228a194ec515385820d489e4a74041dc27c5");
  const r = await execute("npm", ["test"], { cwd: installed, env: { ...process.env, NODE_TEST_CONTEXT: undefined, npm_config_offline: "true" } });
  assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`);
  const line = r.stdout.trim().split(/\r?\n/).at(-1);
  assert.ok(line.startsWith("kaal-foundation-verification "));
  const report = JSON.parse(line.slice("kaal-foundation-verification ".length));
  const manifestBytes = await readFile(join(installed, "dist/test/package-check/verify.json"));
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  assert.equal(report.result, "verified");
  assert.equal(report.exit, 0);
  assert.deepEqual(report.causes, []);
  assert.deepEqual(report.cases.map(c => c.name).sort(), [...manifest.cases].sort());
  assert.ok(report.cases.every(c => c.outcome === "pass"));
  assert.ok(report.cases.some(c => c.name === "foundation/T50"));
  assert.deepEqual(await readFile(join(host, "package.json")), before);
  assert.equal(await kind(join(host, ".kaal")), "missing");
  // Retained by the existing lane's runner output; no second evidence store.
  console.log(JSON.stringify({ package: "@kaihacksai/kaal-foundation", manifest: sha256(manifestBytes), report }));
});
