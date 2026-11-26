// Case controls/T1573 tests: controls/F217
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const lib = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/judge-running.mjs');
const adapter = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs');
export const id = 'controls/T1573';
export const tests = ['controls/F217'];
export const title = 'the Running fact is judged from run records: true by a valid established run of this revision, never false, and the mode and whether the flag applied the control are told beside it, so a switched-off run never reads as applied';
const on = { name: 'KAAL_X_Y', value: 'on', state: 'on' };
const off = { name: 'KAAL_X_Y', value: 'off', state: 'off' };
const rec = (o = {}) => ({ control: 'x/CTL1', x: 'real', run: 'r1', sha: 's1', verdict: 'PASS', by: 'adapter', mode: 'preventive', applied: true, flag: on, ...o });
const est = (run = 'r1', sha = 's1', control = 'x/CTL1') => ({ control, run, sha });
export async function run() {
  assert.ok(existsSync(lib), 'scripts/judge-running.mjs is absent');
  const { judgeRunning } = await import(pathToFileURL(lib).href);
  const { executed } = await import(pathToFileURL(adapter).href);
  const go = (o = {}) => judgeRunning({ id: 'x/CTL1', records: [rec()], revision: 's1', established: [est()], ...o });
  const never = (r) => assert.notEqual(r.running, false, 'running was false');
  // nothing counts: unknown, never false
  let r = await go({ records: [], established: [] }); assert.deepEqual(r, { id: 'x/CTL1', running: null, applied: null, modes: [], runs: 0 });
  // a valid established run of this revision with the flag on
  r = await go(); assert.deepEqual(r, { id: 'x/CTL1', running: true, applied: true, modes: ['preventive'], runs: 1 });
  // a run that was switched off executed: it is running, and the mode and applied say it was not applied
  r = await go({ records: [rec({ mode: 'off', applied: false, flag: off })] }); assert.deepEqual(r, { id: 'x/CTL1', running: true, applied: false, modes: ['off'], runs: 1 });
  // one applied run among switched-off ones applies; all unknown flags leave it unknown
  r = await go({ records: [rec({ mode: 'off', applied: false, flag: off, run: 'r0' }), rec()], established: [est('r0'), est()] }); assert.equal(r.running, true); assert.equal(r.applied, true); assert.equal(r.runs, 2); assert.deepEqual(r.modes, ['off', 'preventive']);
  r = await go({ records: [rec({ mode: 'off', applied: false, flag: off, run: 'r0' }), rec({ flag: { name: 'KAAL_X_Y', value: null, state: 'UNKNOWN' }, applied: null })], established: [est('r0'), est()] }); assert.equal(r.running, true); assert.equal(r.applied, null); assert.equal(r.runs, 2); assert.deepEqual(r.modes, ['off', 'preventive']);
  // a record with a flag that contradicts its own mode is unknown for applied, not a pass for either
  r = await go({ records: [rec({ mode: 'off', applied: true, flag: on })] }); assert.deepEqual(r, { id: 'x/CTL1', running: true, applied: null, modes: ['off'], runs: 1 });
  r = await go({ records: [rec({ mode: 'preventive', flag: off })] }); assert.equal(r.applied, null);
  r = await go({ records: [rec({ flag: undefined })] }); assert.deepEqual(r, { id: 'x/CTL1', running: true, applied: null, modes: ['preventive'], runs: 1 });
  r = await go({ records: [rec({ mode: undefined })] }); assert.deepEqual(r, { id: 'x/CTL1', running: true, applied: null, modes: [], runs: 1 });
  // what does not count is ignored and never counted against the control
  for (const [why, record, established] of [
    ['not established', rec(), []],
    ['established for another run', rec(), [est('r9')]],
    ['established for another revision', rec(), [est('r1', 'sX')]],
    ['record of another revision', rec({ sha: 'sX' }), [est('r1', 'sX')]],
    ['record of another control', rec({ control: 'x/CTL2' }), [est('r1', 's1', 'x/CTL2')]],
    ['not a real X', rec({ x: 'demo' }), [est()]],
    ['not by the adapter', rec({ by: 'hand' }), [est()]],
    ['no verdict', rec({ verdict: undefined }), [est()]],
    ['a verdict that is not PASS or FAIL', rec({ verdict: 'UNKNOWN' }), [est()]],
    ['no run', rec({ run: '' }), [est('')]],
  ]) { r = await go({ records: [record], established }); assert.deepEqual(r, { id: 'x/CTL1', running: null, applied: null, modes: [], runs: 0 }, why); never(r); }
  // the rule that decides which records count is the one of executed, written once: both agree on every set above
  for (const records of [[rec()], [rec({ sha: 'sX' })], [rec({ x: 'demo' })], [rec({ mode: 'off', applied: false, flag: off })], []]) {
    for (const established of [[est()], []]) assert.equal(executed({ id: 'x/CTL1', records, revision: 's1', established }) === true, (await go({ records, established })).runs > 0);
  }
  // it cannot read bad input and says so
  assert.throws(() => judgeRunning({ id: '', records: [], revision: 's1', established: [] }));
  assert.throws(() => judgeRunning({ id: 'x/CTL1', records: [], revision: '', established: [] }));
  assert.throws(() => judgeRunning({ id: 'x/CTL1', records: 'no', revision: 's1', established: [] }));
  assert.throws(() => judgeRunning({ id: 'x/CTL1', records: [], revision: 's1', established: null }));
  assert.throws(() => judgeRunning());
  // pure: the input is not changed
  const records = Object.freeze([Object.freeze(rec())]); const established = Object.freeze([Object.freeze(est())]);
  r = judgeRunning({ id: 'x/CTL1', records, revision: 's1', established }); assert.equal(r.running, true);
}
