// Proposed real Node adapter/API/CLI boundary. Source invocation during DO;
// the acceptance harness must also invoke these unchanged against a fresh install.
import assert from "node:assert/strict";
import { it } from "node:test";
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { manifest, observationFor } from "./fixtures.mjs";
const root = process.env.KAAL_PLAN_PACKAGE ?? fileURLToPath(new URL("../../../", import.meta.url));
async function api() {
  let m;
  try { m = await import(pathToFileURL(createRequire(join(root, "package.json")).resolve("kaal-testing/plan")).href); }
  catch (e) { assert.fail(`blocked before behavioural assertion: public runPlan is absent (${e.code ?? e.message})`); }
  assert.equal(typeof m.runPlan, "function", "blocked before behavioural assertion: runPlan export absent");
  return m.runPlan;
}
function consumer(t, special = {}) {
  const cwd = mkdtempSync(join(tmpdir(), "kaal composed plan "));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  for (const name of ["a", "b", "c"]) writeFileSync(join(cwd, name + ".test.mjs"), special[name] ?? `import {it} from 'node:test';import {appendFileSync} from 'node:fs';it('${name}',()=>{appendFileSync('calls.txt','${name}\\n');});`);
  return cwd;
}
it("CP10: the public API runs the composed Node files once and exposes the original shared observation", async t => {
  const runPlan = await api(), cwd = consumer(t), value = manifest();
  const r = await runPlan(value, { cwd });
  assert.equal(r.result, "passed"); assert.equal(r.exit, 0);
  assert.deepEqual(readFileSync(join(cwd, "calls.txt"), "utf8").trim().split("\n").sort(), ["a", "b", "c"]);
  assert.equal(r.executions.length, 3);
  assert.strictEqual(observationFor(r, "A", "b.test.mjs"), observationFor(r, "B", "b.test.mjs"));
  const b = observationFor(r, "A", "b.test.mjs");
  assert.equal(b.runnerExit, 0); assert.equal(b.complete, true);
  assert.ok(b.cases.some(c => c.name === "b" && c.outcome === "passed"));
  assert.deepEqual(r.suites.map(s => [s.id, s.result]), [["A", "passed"], ["B", "passed"]]);
});
it("CP11: the shipped Skill command preserves a shared failure, later work and nonzero CLI exit", async t => {
  const command = join(root, "skills", "kaal-testing", "scripts", "run-plan.mjs");
  assert.ok(existsSync(command), "blocked before behavioural assertion: shipped Skill script absent");
  const cwd = consumer(t, { b: `import {it} from 'node:test';import {appendFileSync} from 'node:fs';import assert from 'node:assert/strict';it('b',()=>{appendFileSync('calls.txt','b\\n');assert.fail('original b failure');});` });
  const path = join(cwd, "plan.json"); writeFileSync(path, JSON.stringify(manifest()));
  const env = { ...process.env }; delete env.NODE_TEST_CONTEXT;
  const child = spawnSync(process.execPath, [command, path], { cwd, env, encoding: "utf8", timeout: 30000 });
  assert.equal(child.error, undefined, child.stderr);
  assert.equal(child.status, 1, child.stdout + child.stderr);
  const lines = child.stdout.split(/\r?\n/).filter(s => s.startsWith("kaal-testing-plan "));
  assert.equal(lines.length, 1, "one result line, no fabricated successful empty run");
  const r = JSON.parse(lines[0].slice("kaal-testing-plan ".length));
  assert.equal(r.result, "failed"); assert.equal(r.exit, 1);
  assert.deepEqual(r.suites.map(s => [s.id, s.result]), [["A", "failed"], ["B", "failed"]]);
  assert.equal(r.executions.length, 3);
  assert.equal(observationFor(r, "A", "b.test.mjs").runnerExit, 1);
  assert.ok(observationFor(r, "B", "b.test.mjs").cases.some(c => c.outcome === "failed"));
  assert.deepEqual(readFileSync(join(cwd, "calls.txt"), "utf8").trim().split("\n").sort(), ["a", "b", "c"]);
});
it("CP12: native exit zero with no executed Case, an early exit or a skip remains unknown", async t => {
  const runPlan = await api();
  for (const source of ["", "process.exit(0);", `import {it} from 'node:test';it.skip('b',()=>{});`]) {
    const cwd = consumer(t, { b: source });
    const r = await runPlan(manifest(), { cwd });
    assert.equal(r.result, "unknown"); assert.equal(r.exit, 2);
    const b = observationFor(r, "A", "b.test.mjs");
    assert.equal(b.runnerExit, 0, "native runner result is retained separately");
    assert.equal(b.result, "unknown");
    assert.equal(r.suites.find(s => s.id === "B").result, "unknown");
    assert.equal(r.executions.length, 3);
    assert.deepEqual(readFileSync(join(cwd, "calls.txt"), "utf8").trim().split("\n").sort(), ["a", "c"]);
  }
});
