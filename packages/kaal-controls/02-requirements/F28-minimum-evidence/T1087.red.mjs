// Case controls/T1087 tests: controls/F28
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

export const id = 'controls/T1087';
export const tests = ['controls/F28'];
export const title = 'a control meets its minimum when its own Cases have run GREEN against each declared kind of X often enough, each run once';
export async function run() {
  const e = join(S, 'evidence.mjs');
  assert.ok(existsSync(e), 'the evidence script is absent');
  const { judgeEvidence } = await import(pathToFileURL(e).href);
  const { findControls } = await import(pathToFileURL(join(S, 'find-controls.mjs')).href);
  const c = ctl(findControls, { evidence: MIN });
  assert.deepEqual(c.tests.map((t) => t.id), ['demo/T1'], 'the Case of the control is not found from it');
  const v = judgeEvidence(c, enough());
  assert.equal(v.verdict, 'PASS', 'enough GREEN runs is not a pass');
  assert.equal(v.missing.length, 0);
  assert.deepEqual(v.met.map((m) => m.kind), ['fixture', 'merge', 'provoked']);
  assert.equal(judgeEvidence(c, [...enough(), rec('some-other-x', 1)]).verdict, 'PASS', 'a run against an undeclared kind of X broke the pass');
}
