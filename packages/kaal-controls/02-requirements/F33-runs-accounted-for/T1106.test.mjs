// Case controls/T1106 tests: controls/F33
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const item = (o = {}) => { const f = { id: 'demo/CTL1', title: 'review access', description: 'Access is reviewed.', type: 'detective', status: 'running', has: '[demo/I1]', evidence: '[real:2, provoked:1:fail]', ...o }; return '---\n' + Object.entries(f).map(([k, v]) => k + ': ' + v).join('\n') + '\n---\n# a control\n'; };
const ctl = async (o) => { const { findControls } = await import(pathToFileURL(join(S, 'find-controls.mjs')).href); return findControls([{ path: 'x/CTL1.md', text: item(o) }, { path: 'x/T1.test.mjs', text: '// Case demo/T1 tests: demo/CTL1\n' }]).controls[0]; };
const rec = (run, outcome = 'GREEN', more = {}) => ({ case: 'demo/T1', x: 'real', run, outcome, by: 'runner', ...more });
const prov = { case: 'demo/T1', x: 'provoked', run: 'p', outcome: 'GREEN', by: 'runner', base: { run: 'p0', outcome: 'RED' } };
const judge = async (records) => { const { judgeEvidence } = await import(pathToFileURL(join(S, 'evidence.mjs')).href); return judgeEvidence(await ctl(), records); };

export const id = 'controls/T1106';
export const tests = ['controls/F33'];
export const title = 'a run that was not GREEN and is not explained keeps a tested claim unproven; an explained one does not block and counts nowhere';
export async function run() {
  const base = [rec('a'), rec('b'), prov];
  assert.equal((await judge(base)).verdict, 'PASS', 'two GREEN runs of the minimum did not pass');
  for (const outcome of ['RED', 'UNKNOWN']) {
    const v = await judge([...base, rec('c', outcome)]);
    assert.equal(v.verdict, 'UNKNOWN', 'an unexplained ' + outcome + ' run did not block');
    assert.equal(v.reason, 'unhandled', 'the reason for an unexplained ' + outcome + ' run was not unhandled');
    assert.deepEqual((v.unhandled ?? []).map((r) => r.run), ['c'], 'the unexplained ' + outcome + ' run was not listed');
  }
  const handled = await judge([...base, rec('c', 'RED', { handled: 'the fixture was stale, fixed in a later run' })]);
  assert.equal(handled.verdict, 'PASS', 'an explained run blocked');
  assert.deepEqual((handled.handledRuns ?? []).map((r) => r.run), ['c'], 'the explained run was not listed');
  const counted = await judge([rec('a'), prov, rec('c', 'RED', { handled: 'a false alarm' })]);
  assert.equal(counted.verdict, 'UNKNOWN', 'an explained RED run counted as a GREEN run');
  assert.equal(counted.reason, 'below-minimum');
}
