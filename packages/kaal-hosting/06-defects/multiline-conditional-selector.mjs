// hosting/T201 to hosting/T205: `couplings` classifies a platform-conditional test registration however it is laid out.
//
// hosting/T201, hosting/T202 and hosting/T203 are the RED Cases of hosting/D10: they fail on the head that Codex
// reviewed (df4ae4c) and pass with the fix. hosting/T204 and hosting/T205 are controls that pass before and after.
// The Cases run the real `couplings` from the built package over one test source each. A platform finding inside a
// conditional expression that picks a test registration on either branch is `registration` (hosting/F40), whether the
// expression is written on one line or across several.
//
//   npm run build -w @kaihacksai/kaal-hosting
//   node --test packages/kaal-hosting/06-defects/multiline-conditional-selector.mjs
import assert from "node:assert/strict";
import { test } from "node:test";
import { couplings } from "../dist/skills/kaal-hosting/scripts/couplings.js";

const IMPORT = 'import { it } from "node:test";\n';

/** The kinds of the platform findings `couplings` reports for one test source that imports `it`. */
async function kinds(body) {
  const r = await couplings({ "test/a.test.mjs": IMPORT + body + "\n" });
  return r.findings.filter((f) => f.rule === "platform-query" || f.rule === "platform-literal").map((f) => f.kind);
}

test("hosting/T201: a conditional selector with the registration on the false branch and the branches on later lines is registration", async () => {
  const k = await kinds('(process.platform === "win32"\n  ? () => {}\n  : it)("conditional", () => {});');
  assert.ok(k.length > 0);
  assert.deepEqual([...new Set(k)], ["registration"]);
});

test("hosting/T202: a conditional selector with the registration on the true branch and the branches on later lines is registration", async () => {
  const k = await kinds('(process.platform !== "win32"\n  ? it\n  : () => {})("conditional", () => {});');
  assert.ok(k.length > 0);
  assert.deepEqual([...new Set(k)], ["registration"]);
});

test("hosting/T203: a conditional selector whose registration branch is a skip is registration across lines", async () => {
  const k = await kinds('(process.platform === "win32"\n  ? it.skip\n  : it)("conditional", () => {});');
  assert.ok(k.length > 0);
  assert.deepEqual([...new Set(k)], ["registration"]);
});

test("hosting/T204: the same selector on one line is registration", async () => {
  const k = await kinds('(process.platform === "win32" ? () => {} : it)("conditional", () => {});');
  assert.ok(k.length > 0);
  assert.deepEqual([...new Set(k)], ["registration"]);
});

test("hosting/T205: a multi-line conditional that picks no registration stays setup", async () => {
  const k = await kinds('const mode = process.platform === "win32"\n  ? "a"\n  : "b";');
  assert.ok(k.length > 0);
  assert.deepEqual([...new Set(k)], ["setup"]);
});
