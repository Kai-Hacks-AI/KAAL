// Case controls/T1086 tests: controls/F28
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(repo, 'packages/kaal-controls');
const S = join(pkg, 'skills/kaal-controls/scripts');
const item = (o = {}) => { const f = { id: 'demo/CTL1', title: 'approve Sync', description: 'A SYNC is approved when it is pure.', type: 'preventive', status: 'running', has: '[demo/I1]', ...o }; return '---\n' + Object.entries(f).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n---\n# ' + f.id + '\n'; };
const MIN = '[fixture:3, merge:2, provoked:1:fail]';
const CASE = '// Case demo/T1 tests: demo/CTL1\n';
const ctl = (findControls, o = {}) => findControls([{ path: 'x/CTL1.md', text: item({ status: 'tested', ...o }) }, { path: 'x/T1.test.mjs', text: CASE }]).controls[0];
const rec = (x, run, outcome = 'GREEN', c = 'demo/T1') => ({ case: c, x, run, outcome });
const enough = () => [rec('fixture', 1), rec('fixture', 2), rec('fixture', 3), rec('merge', 'a'), rec('merge', 'b'), rec('provoked', 'x')];

export const id = 'controls/T1086';
export const tests = ['controls/F28'];
export const title = 'a control declares its minimum evidence as kinds of X its Cases run against; a bad line stays listed, invalid, and names evidence with a recovery';
export async function run() {
  const f = join(S, 'find-controls.mjs');
  assert.ok(existsSync(f), 'the finder is absent');
  const { findControls } = await import(pathToFileURL(f).href);
  const one = (text) => findControls([{ path: 'x/CTL1.md', text }]).controls[0];
  const ok = one(item({ evidence: MIN }));
  assert.equal(ok.valid, true, 'a valid evidence list fails validation');
  assert.deepEqual(ok.evidence, [{ kind: 'fixture', runs: 3, fail: false }, { kind: 'merge', runs: 2, fail: false }, { kind: 'provoked', runs: 1, fail: true }]);
  assert.deepEqual(one(item()).evidence, [], 'no evidence is not an empty list');
  assert.equal(one(item()).valid, true, 'a control without evidence is invalid');
  for (const bad of ['[]', '[fixture:3]', '[fixture:0:fail]', '[fixture:2:fail, fixture:1]', '[Fixture:1:fail]', '[fixture:1:pass]', '[fixture:1:fail:x]', 'fixture:1:fail', '[fixture:one:fail]']) {
    const r = findControls([{ path: 'x/CTL1.md', text: item({ evidence: bad }) }]);
    assert.equal(r.controls.length, 1, `evidence ${bad} dropped the control`);
    const c = r.controls[0];
    assert.equal(c.valid, false, `evidence ${bad} passed validation`);
    assert.equal(c.problems.length, 1);
    assert.equal(c.problems[0].field, 'evidence');
    for (const w of ['X', 'runs', 'fail']) assert.ok(c.problems[0].recovery.includes(w), `the recovery does not name ${w}`);
  }
}
