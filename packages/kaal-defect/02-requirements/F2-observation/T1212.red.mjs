// Case defect/T1212 tests: defect/F2
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(root, 'packages/kaal-defect');
const skillFile = join(pkg, 'skills/kaal-defect/SKILL.md');
const script = join(pkg, 'skills/kaal-defect/scripts/known-defects.mjs');
const skill = () => { assert.ok(existsSync(skillFile), 'the Skill packages/kaal-defect/skills/kaal-defect/SKILL.md is absent'); return readFileSync(skillFile, 'utf8'); };
export const id = 'defect/T1212';
export const tests = ['defect/F2'];
function fixture({ contexts, results = [] }) {
  assert.ok(existsSync(script), "the script scripts/known-defects.mjs is absent");
  const d = mkdtempSync(join(tmpdir(), "known-"));
  for (const [ctx, { defects = [], register = [], placed = {} }] of Object.entries(contexts)) {
    mkdirSync(join(d, ctx, "14-defects"), { recursive: true });
    for (const i of defects) writeFileSync(join(d, ctx, "14-defects", i.replace("/", "-") + ".md"), `---\nid: ${i}\n${placed[i] ? `placed: ${placed[i]}\n` : ""}---\n# ${i}\n`);
    writeFileSync(join(d, ctx, "14-defects", "known.json"), JSON.stringify(register));
  }
  writeFileSync(join(d, "results.json"), JSON.stringify(results));
  return d;
}
const R = "r1";
const check = (d, ...more) => spawnSync(process.execPath, [script, "--root", d, "--results", join(d, "results.json"), "--revision", R, ...more], { encoding: "utf8" });
const obs = (c, outcome, revision = R) => ({ case: c, outcome, revision });
export const title = 'the observation of a Defect is derived from its Cases at one revision: reproduced, not reproduced or unknown; stale, incomplete and missing are unknown; registered is only membership';
const one = { 'a': { defects: ['x/D1'], register: [{ defect: 'x/D1', case: 'x/T1' }] } };
const lines = (r) => r.stdout.split('\n');
export async function run() {
  assert.match(check(fixture({ contexts: one, results: [obs('x/T1', 'fail')] })).stdout, /^reproduced x\/D1 registered$/m);
  assert.match(check(fixture({ contexts: one, results: [obs('x/T1', 'pass')] })).stdout, /^not reproduced x\/D1 registered$/m, 'a derived observation; nothing is stored on the Defect');
  for (const outcome of ['unknown', 'skipped', 'error', 'timeout', 'incomplete']) {
    const r = check(fixture({ contexts: one, results: [obs('x/T1', outcome)] }));
    assert.match(r.stdout, /^unknown x\/D1 registered$/m, `${outcome} is unknown, never reproduced`);
  }
  assert.match(check(fixture({ contexts: one, results: [] })).stdout, /^unknown x\/D1 registered$/m, 'no observation is unknown');
  assert.match(check(fixture({ contexts: one, results: [obs('x/T1', 'fail', 'r0')] })).stdout, /^unknown x\/D1 registered$/m, 'an observation of another revision is stale, so unknown');
  const two = { 'a': { defects: ['x/D1'], register: [{ defect: 'x/D1', case: 'x/T1' }, { defect: 'x/D1', case: 'x/T2' }] } };
  assert.match(check(fixture({ contexts: two, results: [obs('x/T1', 'pass'), obs('x/T2', 'fail')] })).stdout, /^reproduced x\/D1 registered$/m, 'any applicable failing Case reproduces the condition');
  assert.match(check(fixture({ contexts: two, results: [obs('x/T1', 'pass'), obs('x/T2', 'pass')] })).stdout, /^not reproduced x\/D1 registered$/m, 'not reproduced only when every Case passes');
  assert.match(check(fixture({ contexts: two, results: [obs('x/T1', 'pass')] })).stdout, /^unknown x\/D1 registered$/m, 'a missing Case leaves it unknown');
  assert.match(check(fixture({ contexts: two, results: [obs('x/T1', 'pass'), obs('x/T2', 'unknown')] })).stdout, /^unknown x\/D1 registered$/m);
  const u = check(fixture({ contexts: one, results: [obs('x/T1', 'fail'), obs('z/T2', 'fail'), obs('z/T3', 'unknown')] }));
  assert.ok(lines(u).includes('reproduced unregistered z/T2')); assert.doesNotMatch(u.stdout, /z\/T3/);
  for (const out of ['reproduced', 'not reproduced', 'unknown']) assert.equal(check(fixture({ contexts: one, results: [obs('x/T1', 'fail')] })).status, 0, 'no observation makes the script fail: policy is the consumer\'s');
}
