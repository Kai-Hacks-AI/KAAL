// Regression Cases for the Boundary Check scan (hosting/C102), one per Codex finding shape raised in review.
// They reach the scan through the built command, as test/plan/boundary-check.test.mjs does.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const COMMAND = join(PACKAGE, "bin", "kaal-hosting-boundary.mjs");
const LINE = "kaal-hosting-boundary";

function tree(sources) {
  const root = mkdtempSync(join(tmpdir(), "hosting-scan-"));
  for (const [path, text] of Object.entries(sources)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

function run(args, cwd) {
  const out = spawnSync(process.execPath, [COMMAND, ...args], { cwd, encoding: "utf8" });
  const line = out.stdout.split("\n").find((l) => l.startsWith(`${LINE} `));
  return { status: out.status, result: line ? JSON.parse(line.slice(LINE.length + 1)) : undefined };
}

describe("hosting/C102: scan regressions", () => {
  it("hosting/T125 [hosting/F68]: a target whose first path component merely starts with two dots lies inside the base", () => {
    const root = tree({ "..sources/a.mjs": "export const w = process.platform;\n" });
    const { status, result } = run(["--target", "..sources/a.mjs"], root);
    assert.equal(status, 0);
    assert.equal(result.result, "complete");
    assert.deepEqual(result.findings.map((f) => f.id), ["kaal-hosting/..sources/a.mjs:1"]);
  });

  it("hosting/T126 [hosting/F66]: a use through a binding that combines several origins is kept as a reference under each of them, and each place counted once", () => {
    const root = tree({ "src/a.mjs": ["const a = process.platform;", "const b = process.arch;", "const both = [a, b];", "console.log(both);"].join("\n") });
    const { result } = run(["--target", "src"], root);
    assert.deepEqual(result.findings.map((f) => f.line), [1, 2]);
    assert.deepEqual(result.findings.map((f) => f.references.map((r) => r.line)), [[3, 4], [3, 4]]);
    assert.equal(result.counts.references, 3);
  });

  it("hosting/T127 [hosting/F66]: bindings that reuse the preceding identifier twice are resolved once each, so a long chain scans in linear time", () => {
    const chain = ["const a0 = process.platform;", ...Array.from({ length: 60 }, (_, i) => `const a${i + 1} = [a${i}, a${i}];`), "console.log(a60);"].join("\n");
    const started = Date.now();
    const { status, result } = run(["--target", "src"], tree({ "src/a.mjs": chain }));
    assert.equal(status, 0);
    assert.deepEqual(result.findings.map((f) => f.line), [1]);
    assert.equal(result.findings[0].references.length, 121);
    assert.ok(Date.now() - started < 20000, "the scan did not finish in reasonable time");
  });
});
