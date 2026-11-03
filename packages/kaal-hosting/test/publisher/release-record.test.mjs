// Publisher-only release interoperability: drive Hosting's real verifier and Engineering's
// accepted release judge. The fixture controls prerequisites and cases, never either verdict.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { readiness, verification } from "../../../../../engineering/release/release.mjs";
import { hashes, LOOPS, PACKAGE, PREFIX } from "../verify.mjs";

const NAME = "@kaihacksai/kaal-hosting";
const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;
const node = (pkg, entry) => spawnSync(process.execPath, [entry], { cwd: pkg, env, encoding: "utf8" });

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "hosting-release-record-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const pkg = join(root, "node_modules", ...NAME.split("/"));
  mkdirSync(join(pkg, "test", "embed"), { recursive: true });
  mkdirSync(join(pkg, "test", "publisher"));
  mkdirSync(join(pkg, "docs"));
  writeFileSync(join(root, "package.json"), "{}\n");
  writeFileSync(join(pkg, "package.json"), JSON.stringify({
    name: NAME, version: "0.0.1", type: "module",
    files: ["docs", "test/embed", "test/verify.mjs", "test/verify.json"],
  }));
  copyFileSync(new URL("../verify.mjs", import.meta.url), join(pkg, "test", "verify.mjs"));
  copyFileSync(new URL("./manifest.mjs", import.meta.url), join(pkg, "test", "publisher", "manifest.mjs"));
  writeFileSync(join(pkg, "docs", "requirements.md"), "**hosting/F1**: fixture obligation.\n");
  writeFileSync(join(pkg, "docs", "testing.md"), ["applicability", "allocated", "unverified"].map((marker) =>
    `<!-- kaal-hosting:${marker} -->\n| Identifier | Detail |\n| --- | --- |\n<!-- /kaal-hosting:${marker} -->\n`,
  ).join("\n"));
  for (const loop of LOOPS) writeFileSync(join(pkg, "test", "embed", `${loop}.test.mjs`),
    'import { it } from "node:test";\nit("case [hosting/F1]", () => {});\n');
  return pkg;
}

function inventory(pkg) {
  const generated = node(pkg, "test/publisher/manifest.mjs");
  assert.equal(generated.status, 0, generated.stdout + generated.stderr);
  rmSync(join(pkg, "test", "publisher"), { recursive: true });
  return JSON.parse(readFileSync(join(pkg, "test", "verify.json"), "utf8"));
}

function record(run) {
  const lines = run.stdout.trimEnd().split(/\r?\n/);
  const records = lines.filter((l) => l.startsWith(PREFIX));
  assert.equal(records.length, 1, run.stdout + run.stderr);
  assert.equal(lines.at(-1), records[0], "the one summary is the final line");
  const summary = JSON.parse(records[0].slice(PREFIX.length));
  assert.equal(summary.exit, run.status, "the record preserves the actual process status");
  assert.ok(Array.isArray(summary.causes), "causes is always a list");
  assert.ok(summary.causes.every((c) => typeof c === "string"));
  assert.ok(Array.isArray(summary.cases), "unavailable case execution is an empty inventory, never invented passes");
  return summary;
}

describe("Hosting release interoperability", () => {
  it("hosting/T83 [hosting/F15]: the real package passes unchanged Release readiness with exact runtime versions, and withholding each required version refuses release", () => {
    const manifest = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
    const required = {
      "cross-spawn": "7.0.6", "es-module-lexer": "3.0.3",
      "graceful-fs": "4.2.11", "proper-lockfile": "4.1.2",
    };
    assert.deepEqual(manifest.dependencies, required);
    const registry = { [NAME]: null, ...Object.fromEntries(Object.entries(required).map(([n, v]) => [n, [v]])) };
    const judge = (facts) => readiness({ manifest, directory: "packages/extensions/kaal-hosting", registry: facts });
    assert.deepEqual(judge(registry), { findings: [], path: "first" });
    for (const [name, version] of Object.entries(required)) {
      assert.deepEqual(judge({ ...registry, [name]: [] }).findings,
        [`dependency ${name}@${version} is not on the registry; release it first`]);
    }
  });

  it("hosting/T84 [hosting/F21, hosting/F22]: real installed verification records every passing case once and the unchanged Release judge accepts it", (t) => {
    const pkg = fixture(t);
    const declared = inventory(pkg).cases;
    const run = node(pkg, "test/verify.mjs");
    const summary = record(run);
    assert.equal(summary.result, "verified");
    assert.equal(run.status, 0);
    assert.deepEqual(summary.causes, []);
    assert.equal(summary.cases.length, 4);
    assert.deepEqual(verification(run.stdout, NAME, { status: run.status, declared }), { result: "verified", cases: 4 });
  });

  it("hosting/T85 [hosting/F21, hosting/F22]: a real failed delivered case retains failed/1 and its causes through the unchanged Release judge", (t) => {
    const pkg = fixture(t);
    const manifest = inventory(pkg);
    writeFileSync(join(pkg, "test", "embed", "code.test.mjs"),
      'import { it } from "node:test";\nit("case [hosting/F1]", () => { throw new Error("release regression sentinel"); });\n');
    manifest.hashes = hashes(pkg);
    writeFileSync(join(pkg, "test", "verify.json"), JSON.stringify(manifest));
    const run = node(pkg, "test/verify.mjs");
    const summary = record(run);
    assert.equal(summary.result, "failed");
    assert.equal(run.status, 1);
    assert.ok(summary.cases.some((c) => c.outcome === "fail"));
    assert.ok(summary.causes.some((c) => c.includes("delivered case failed")));
    assert.match(summary.cause, /delivered case failed/); // retain the existing field for consumers
    assert.equal(verification(run.stdout, NAME, { status: run.status, declared: manifest.cases }).result, "failed");
  });

  it("hosting/T86 [hosting/F21, hosting/F22]: missing prerequisites retain cannot verify/2, explicit causes and no fabricated case execution", (t) => {
    const pkg = fixture(t); // no generated manifest
    rmSync(join(pkg, "test", "publisher"), { recursive: true });
    const run = node(pkg, "test/verify.mjs");
    const summary = record(run);
    assert.equal(summary.result, "cannot verify");
    assert.equal(run.status, 2);
    assert.ok(summary.causes.length > 0);
    assert.deepEqual(summary.cases, []);
    const judged = verification(run.stdout, NAME, { status: run.status, declared: [] });
    assert.equal(judged.result, "unknown");
    assert.match(judged.cause, /reported cannot verify/);
  });

  it("hosting/T87 [hosting/F21]: an unexpected verifier failure uses the same complete cannot verify/2 record", (t) => {
    const pkg = fixture(t);
    writeFileSync(join(pkg, "package.json"), "null\n");
    const run = node(pkg, "test/verify.mjs");
    const summary = record(run);
    assert.equal(summary.result, "cannot verify");
    assert.equal(run.status, 2);
    assert.ok(summary.causes.some((c) => c.includes("verification itself could not complete")));
    assert.deepEqual(summary.cases, []);
  });
});
