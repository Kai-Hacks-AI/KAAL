// Case controls/T1101 tests: controls/F31
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const item = (o) => { const f = { id: 'demo/CTL1', title: 'a control', description: 'It does its thing.', type: 'preventive', status: 'running', has: '[demo/I1]', evidence: '[provoked:1:fail]', ...o }; return '---\n' + Object.entries(f).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n---\n# ' + f.id + '\n'; };
const ctl = async (o) => { const { findControls } = await import(pathToFileURL(join(S, 'find-controls.mjs')).href); return findControls([{ path: 'x/CTL1.md', text: item(o) }, { path: 'x/T1.test.mjs', text: '// Case demo/T1 tests: demo/CTL1\n' }]).controls[0]; };
const rec = (shows) => ({ case: 'demo/T1', x: 'provoked', run: 'p', outcome: 'GREEN', base: { run: 'b', outcome: 'RED', without: 'packages/x/scripts/m.mjs' }, ...(shows ? { shows } : {}) });

export const id = 'controls/T1101';
export const tests = ['controls/F31'];
export const title = 'a provoked run counts as its control type requires: refused at a declared station, reported, restored, and unshown or unnamed is said';
export async function run() {
  const { judgeEvidence } = await import(pathToFileURL(join(S, 'evidence.mjs')).href);
  const v = async (o, shows) => judgeEvidence(await ctl(o), [rec(shows)]);
  const prev = { type: 'preventive', stations: '[Integrating:preventive]' };
  assert.equal((await v(prev, { refused: 'Integrating' })).verdict, 'PASS', 'a refusal at the declared station did not count');
  assert.equal((await v(prev, { refused: 'Promoting' })).verdict, 'UNKNOWN', 'a refusal at another station counted');
  assert.equal((await v({ type: 'preventive' }, { refused: 'Integrating' })).boundaryUnnamed, true, 'a preventive control with no station was not shown as boundary unnamed');
  assert.equal((await v({ type: 'preventive', stations: '[Integrating:detective]' }, { refused: 'Integrating' })).verdict, 'UNKNOWN', 'a detective station was taken as a boundary');
  assert.equal((await v({ type: 'detective' }, { reported: 'finding#12' })).verdict, 'PASS', 'a report did not count');
  assert.equal((await v({ type: 'detective' }, { refused: 'Integrating' })).verdict, 'UNKNOWN', 'a refusal counted for a detective control');
  assert.equal((await v({ type: 'corrective' }, { restored: 'tree@abc' })).verdict, 'PASS', 'a restoration did not count');
  assert.equal((await v({ type: 'corrective' }, { reported: 'x' })).verdict, 'UNKNOWN', 'a report counted for a corrective control');
  const none = await v({ type: 'detective' }, undefined);
  assert.equal(none.verdict, 'PASS', 'a run with no shows stopped counting');
  assert.equal(none.unshown, 1, 'a run with no shows was not said to be unshown');
  assert.equal((await v({ type: 'directive' }, undefined)).verdict, 'PASS', 'a directive was asked for shows');
}
