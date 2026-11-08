// hosting/T232 to hosting/T234: a selector that picks a suite on one branch and a case on the other keeps both attributions.
//
// Controls of hosting/D11. T232 passes before and after the fix of `affected` in `boundary-core.ts`: the
// case alternative of such a selector is still challenged (the fix must not trade one attribution for the other).
//
//   npm run build -w @kaihacksai/kaal-hosting
//   node --test packages/kaal-hosting/06-defects/suite-registration.controls.mjs
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { portability } from "../dist/skills/kaal-hosting/scripts/boundary-core.js";

test("hosting/T232 control: a selector choosing a case on one branch and a suite on the other challenges the registration", async () => {
  const root = mkdtempSync(join(tmpdir(), "hosting-d11-"));
  try {
    mkdirSync(join(root, "test"));
    writeFileSync(join(root, "package.json"), JSON.stringify({ name: "capability", version: "1.0.0" }));
    writeFileSync(join(root, "test", "a.test.mjs"), 'import { describe, test } from "node:test";\n(process.platform === "win32" ? test.skip : describe)("conditional", () => {});\n');
    const r = await portability({ name: "capability", root, builtins: ["node:test"] });
    assert.deepEqual(r.challenged, ["conditional"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("hosting/T233 control: a suite whose option holds a function is still governed by the platform skip in that option", async () => {
  const root = mkdtempSync(join(tmpdir(), "hosting-d11-"));
  try {
    mkdirSync(join(root, "test"));
    writeFileSync(join(root, "package.json"), JSON.stringify({ name: "capability", version: "1.0.0" }));
    writeFileSync(join(root, "test", "a.test.mjs"), 'import { describe, it } from "node:test";\ndescribe("suite", { skip: (() => process.platform === "win32")() }, () => {\n  it("child", () => {});\n});\n');
    const r = await portability({ name: "capability", root, builtins: ["node:test"] });
    assert.deepEqual(r.challenged, ["child"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("hosting/T234 control: a trailing comma after a suite's callback does not widen a finding inside the callback", async () => {
  const root = mkdtempSync(join(tmpdir(), "hosting-d11-"));
  try {
    mkdirSync(join(root, "test"));
    writeFileSync(join(root, "package.json"), JSON.stringify({ name: "capability", version: "1.0.0" }));
    writeFileSync(join(root, "test", "a.test.mjs"), 'import { describe, it } from "node:test";\ndescribe("suite", () => {\n  it("affected", { skip: process.platform === "win32" }, () => {});\n  it("unrelated", () => {});\n},);\n');
    const r = await portability({ name: "capability", root, builtins: ["node:test"] });
    assert.deepEqual(r.challenged, ["affected"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
