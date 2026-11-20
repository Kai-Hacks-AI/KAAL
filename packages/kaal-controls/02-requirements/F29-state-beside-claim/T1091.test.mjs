// Case controls/T1091 tests: controls/F29
import assert from 'node:assert/strict';
import { existsSync, writeFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const item = (o = {}) => { const f = { id: 'demo/CTL1', title: 'approve Sync', description: 'A SYNC is approved when it is pure.', type: 'preventive', status: 'running', has: '[demo/I1]', ...o }; return '---\n' + Object.entries(f).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n---\n# ' + f.id + '\n'; };
const MIN = '[fixture:3, merge:2, provoked:1:fail]';
const CASE = '// Case demo/T1 tests: demo/CTL1\n';
const rec = (x, run, outcome = 'GREEN', base) => ({ case: 'demo/T1', x, run, outcome, ...(base ? { base } : {}) });
const some = () => [rec('fixture', 1), rec('fixture', 2), rec('merge', 'a')];
const all = () => [rec('fixture', 1), rec('fixture', 2), rec('fixture', 3), rec('merge', 'a'), rec('merge', 'b'), rec('provoked', 'x', 'GREEN', { run: 'x0', outcome: 'RED' })];
const ctl = async (o = {}) => { const { findControls } = await import(pathToFileURL(join(S, 'find-controls.mjs')).href); return findControls([{ path: 'x/CTL1.md', text: item(o) }, { path: 'x/T1.test.mjs', text: CASE }]).controls[0]; };

export const id = 'controls/T1091';
export const tests = ['controls/F29'];
export const title = 'the computed state is designed for a valid control, tested only when the minimum is shown, invalid for an invalid one';
export async function run() {
  const e = join(S, 'evidence.mjs');
  assert.ok(existsSync(e), 'the evidence script is absent');
  const m = await import(pathToFileURL(e).href);
  assert.equal(typeof m.computedState, 'function', 'computedState is not exported');
  const j = (c, r) => m.judgeEvidence(c, r);
  const c = await ctl({ status: 'running', evidence: MIN });
  assert.equal(m.computedState(c, j(c, [])), 'designed', 'no records is not designed');
  assert.equal(m.computedState(c, j(c, some())), 'designed', 'a short minimum is not designed');
  assert.equal(m.computedState(c, j(c, all())), 'tested', 'a met minimum is not tested');
  const nomin = await ctl({ status: 'tested' });
  assert.equal(m.computedState(nomin, j(nomin, all())), 'designed', 'a claim of tested without a minimum was computed tested');
  const bad = await ctl({ status: 'running', type: undefined });
  assert.equal(m.computedState(bad, j(bad, [])), 'invalid', 'an invalid control was not invalid');
}
