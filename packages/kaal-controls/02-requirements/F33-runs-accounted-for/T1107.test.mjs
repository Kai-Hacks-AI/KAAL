// Case controls/T1107 tests: controls/F33
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

export const id = 'controls/T1107';
export const tests = ['controls/F33'];
export const title = 'a record that says nobody recorded it is not counted and is listed, and the state line shows the unhandled runs';
export async function run() {
  const noBy = await judge([rec('a'), rec('b', 'GREEN', { by: undefined }), prov]);
  assert.equal(noBy.verdict, 'UNKNOWN', 'a record with no recorder counted');
  assert.deepEqual((noBy.unrecorded ?? []).map((r) => r.run), ['b'], 'the record with no recorder was not listed');
  for (const empty of ['', '  ']) assert.equal((await judge([rec('a'), rec('b', 'GREEN', { by: empty }), prov])).verdict, 'UNKNOWN', 'an empty recorder counted');
  const { judgeEvidence, stateLine } = await import(pathToFileURL(join(S, 'evidence.mjs')).href);
  const c = await ctl();
  const v = judgeEvidence(c, [rec('a'), rec('b'), prov, rec('c', 'RED')]);
  const line = stateLine(c, v);
  assert.ok(!line.includes('\n'), 'the state is more than one line');
  assert.match(line, /UNKNOWN unhandled/, 'the line did not show the reason');
  assert.match(line, /1 unhandled/, 'the line did not show how many runs are unhandled');
}
