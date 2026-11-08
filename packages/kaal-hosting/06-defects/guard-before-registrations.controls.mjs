// hosting/T239 and hosting/T240: a return inside a registered callback, or a throw caught in the guarded branch, does not leave the suite.
//
// Control of hosting/D12, added with its fix after Codex found that the fix read every `return` or `throw`
// in a guarded branch as an exit from the enclosing scope. It passes before the D12 fix and must pass after it.
//
//   npm run build -w @kaihacksai/kaal-hosting
//   node --test packages/kaal-hosting/06-defects/guard-before-registrations.controls.mjs
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { portability } from "../dist/skills/kaal-hosting/scripts/boundary-core.js";

async function challenged(body) {
  const root = mkdtempSync(join(tmpdir(), "hosting-d12-"));
  try {
    mkdirSync(join(root, "test"));
    writeFileSync(join(root, "package.json"), JSON.stringify({ name: "capability", version: "1.0.0" }));
    writeFileSync(join(root, "test", "a.test.mjs"), `import { describe, it } from "node:test";\n${body}\n`);
    return (await portability({ name: "capability", root, builtins: ["node:test"] })).challenged;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("hosting/T239 control: a return inside a guarded case's callback does not challenge the cases registered after the guard", async () => {
  const r = await challenged('describe("suite", () => {\n  if (process.platform === "win32") { it("windows-only", () => { return; }); }\n  it("portable", () => {});\n});');
  assert.deepEqual(r, ["windows-only"]);
});

test("hosting/T239 control: a function declaration body that returns does not extend the guard either", async () => {
  const r = await challenged('describe("suite", () => {\n  if (process.platform === "win32") { it("windows-only", function () { return; }); }\n  it("portable", () => {});\n});');
  assert.deepEqual(r, ["windows-only"]);
});

test("hosting/T240 control: a throw caught inside the guarded branch does not challenge the cases registered after the guard", async () => {
  const r = await challenged('describe("suite", () => {\n  if (process.platform === "win32") { try { throw new Error("probe"); } catch {} it("windows-only", () => {}); }\n  it("portable", () => {});\n});');
  assert.deepEqual(r, ["windows-only"]);
});

test("hosting/T241 control: a method named return in the guarded branch does not leave the suite", async () => {
  const r = await challenged('describe("suite", () => {\n  if (process.platform === "win32") { iterator.return(); it("windows-only", () => {}); }\n  it("portable", () => {});\n});');
  assert.deepEqual(r, ["windows-only"]);
});
