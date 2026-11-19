// Case controls/T1088 tests: controls/F28
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

export const id = 'controls/T1088';
export const tests = ['controls/F28'];
export const title = 'missing, short, repeated, not GREEN or foreign evidence is UNKNOWN, never a pass';
export async function run() {
  const e = join(S, 'evidence.mjs');
  assert.ok(existsSync(e), 'the evidence script is absent');
  const { judgeEvidence } = await import(pathToFileURL(e).href);
  const { findControls } = await import(pathToFileURL(join(S, 'find-controls.mjs')).href);
  const c = ctl(findControls, { evidence: MIN });
  const nomin = ctl(findControls);
  assert.equal(judgeEvidence(nomin, enough()).verdict, 'UNKNOWN', 'a tested claim with no declared minimum passed');
  assert.equal(judgeEvidence(nomin, enough()).reason, 'no-minimum');
  assert.equal(judgeEvidence(c, []).verdict, 'UNKNOWN', 'no records passed');
  assert.equal(judgeEvidence(c, []).reason, 'no-records');
  const vs = judgeEvidence(c, enough().slice(1));
  assert.equal(vs.verdict, 'UNKNOWN', 'a short kind of X passed');
  assert.deepEqual(vs.missing.map((m) => m.kind), ['fixture']);
  for (const outcome of ['RED', 'UNKNOWN']) assert.equal(judgeEvidence(c, [...enough().slice(0, 5), rec('provoked', 'x', outcome)]).verdict, 'UNKNOWN', `a ${outcome} run counted`);
  assert.equal(judgeEvidence(c, [rec('fixture', 1), rec('fixture', 1), rec('fixture', 1), ...enough().slice(3)]).verdict, 'UNKNOWN', 'one run counted three times');
  const red = judgeEvidence(c, [...enough(), rec('fixture', 9, 'RED')]);
  assert.equal(red.verdict, 'PASS');
  assert.deepEqual(red.notGreen, [{ case: 'demo/T1', x: 'fixture', run: 9, outcome: 'RED' }], 'a RED run was not reported');
  assert.equal(judgeEvidence(c, enough().map((r) => ({ ...r, case: 'demo/T2' }))).verdict, 'UNKNOWN', 'runs of a Case of another control counted');
}
