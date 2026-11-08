// hosting/T249 to hosting/T254: controls of hosting/D13, added with its fix after Codex review.
//
// They pass with the fix and must keep passing: a throw that a try block catches skips the registrations to the end of
// that try block and no further (T249), and a function body with a return-type annotation is the boundary a return
// leaves (T250), and the finally block of the try a guard sits in still runs (T251), a process exit runs no finally block (T252), an exit guard in a never-called function challenges no module-level case (T253), and the other branch of an enclosing if is not challenged (T254).
//
//   npm run build -w @kaihacksai/kaal-hosting
//   node --test packages/kaal-hosting/06-defects/guard-scope.controls.mjs
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { portability } from "../dist/skills/kaal-hosting/scripts/boundary-core.js";

async function challenged(body) {
  const root = mkdtempSync(join(tmpdir(), "hosting-d13-"));
  try {
    mkdirSync(join(root, "test"));
    writeFileSync(join(root, "package.json"), JSON.stringify({ name: "capability", version: "1.0.0" }));
    writeFileSync(join(root, "test", "a.test.mjs"), `import { describe, it } from "node:test";\n${body}\n`);
    return (await portability({ name: "capability", root, builtins: ["node:test"] })).challenged;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("hosting/T249 control: a caught throw skips the registrations to the end of its try block and no further", async () => {
  const r = await challenged('describe("suite", () => {\n  try {\n    if (process.platform === "win32") { it("guarded", () => {}); throw new Error("unsupported"); }\n    it("inside-try", () => {});\n  } catch {}\n  it("after-try", () => {});\n});');
  assert.deepEqual([...r].sort(), ["guarded", "inside-try"]);
});

test("hosting/T250 control: a return in a function body with a return-type annotation leaves only that function", async () => {
  const r = await challenged('describe("suite", function (): void {\n  if (process.platform === "win32") return;\n  it("inside", () => {});\n});\nit("outside", () => {});');
  assert.deepEqual(r, ["inside"]);
});

test("hosting/T251 control: a finally block of the try the guard sits in still runs and is not challenged", async () => {
  const r = await challenged('describe("suite", () => {\n  try {\n    if (process.platform === "win32") return;\n  } finally {\n    it("always", () => {});\n  }\n  it("after", () => {});\n});');
  assert.deepEqual(r, ["after"]);
});

test("hosting/T252 control: a process exit runs no finally block of the try it sits in", async () => {
  const r = await challenged('describe("suite", () => {\n  try {\n    if (process.platform === "win32") process.exit(0);\n  } finally {\n    it("cleanup", () => {});\n  }\n});');
  assert.deepEqual(r, ["cleanup"]);
});

test("hosting/T253 control: an exit guard in a function that is never called does not challenge module-level cases", async () => {
  const r = await challenged('function unused() {\n  if (process.platform === "win32") process.exit(0);\n}\nit("independent", () => {});');
  assert.deepEqual(r, []);
});

test("hosting/T254 control: the other branch of an enclosing if is not challenged by a guard in one branch", async () => {
  const r = await challenged('describe("suite", () => {\n  if (enabled) {\n    if (process.platform === "win32") return;\n  } else {\n    it("alternative", () => {});\n  }\n  it("after", () => {});\n});');
  assert.deepEqual(r, ["after"]);
});
