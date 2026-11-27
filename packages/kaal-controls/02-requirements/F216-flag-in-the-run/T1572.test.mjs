// Case controls/T1572 tests: controls/F216
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const lib = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs');
export const id = 'controls/T1572';
export const tests = ['controls/F216'];
export const title = 'the flag is handed to the adapter and recorded: only an exact on applies the mode, anything else runs the control switched off, a missing flag is unknown, and nothing reads the environment';
export async function run() {
  const { runControl } = await import(pathToFileURL(lib).href);
  let calls = 0;
  const failing = () => { calls += 1; return ['f1']; };
  const clean = () => { calls += 1; return []; };
  const flag = (value, name = 'KAAL_X_Y') => ({ name, value });
  const go = (o = {}) => runControl({ id: 'x/CTL1', mode: 'preventive', check: failing, boundary: { x: 'real', run: 'r1', sha: 's1', flag: flag('on') }, ...o });
  const withFlag = (f, o = {}) => go({ boundary: { x: 'real', run: 'r1', sha: 's1', flag: f }, ...o });
  // on: the mode asked applies and the flag is recorded
  let r = await go();
  assert.equal(r.mode, 'preventive'); assert.equal(r.applied, true); assert.equal(r.verdict, 'FAIL'); assert.equal(r.blocked, true);
  assert.deepEqual(r.log.flag, { name: 'KAAL_X_Y', value: 'on', state: 'on' }); assert.equal(r.log.mode, 'preventive');
  assert.deepEqual(r.record, { control: 'x/CTL1', x: 'real', run: 'r1', sha: 's1', verdict: 'FAIL', by: 'adapter', mode: 'preventive', applied: true, flag: { name: 'KAAL_X_Y', value: 'on', state: 'on' } });
  // only exactly on applies; any other value, even a near miss, an empty string or an unset variable, runs the control switched off
  for (const value of ['off', 'ON', 'true', '1', ' on', '', null]) {
    calls = 0;
    r = await withFlag(flag(value));
    assert.equal(calls, 1, `the check was not run once for ${JSON.stringify(value)}`);
    assert.equal(r.mode, 'off', JSON.stringify(value)); assert.equal(r.requested, 'preventive'); assert.equal(r.applied, false); assert.equal(r.blocked, false, 'a switched-off control blocked');
    assert.equal(r.verdict, 'REPORT', 'the findings were not kept for the record'); assert.deepEqual(r.findings, ['f1']);
    assert.equal(r.log.mode, 'off'); assert.deepEqual(r.log.flag, { name: 'KAAL_X_Y', value, state: 'off' });
    assert.equal(r.record.mode, 'off'); assert.equal(r.record.applied, false); assert.deepEqual(r.record.flag, { name: 'KAAL_X_Y', value, state: 'off' });
  }
  // switched off with no finding is a recorded pass, and a check that throws is still unknown and never blocked
  r = await withFlag(flag('off'), { check: clean }); assert.equal(r.verdict, 'PASS'); assert.equal(r.blocked, false); assert.equal(r.mode, 'off');
  r = await withFlag(flag('off'), { check: () => { throw new Error('x'); } }); assert.equal(r.verdict, 'UNKNOWN'); assert.equal(r.blocked, false); assert.equal(r.mode, 'off');
  // a ratchet is switched off the same way, and no baseline is applied to it
  r = await withFlag(flag('off'), { mode: 'ratchet', baseline: [], previous: [] }); assert.equal(r.mode, 'off'); assert.equal(r.requested, 'ratchet'); assert.equal(r.blocked, false);
  // a missing or malformed flag is unknown: the mode asked runs as before, never reported as applied and never as off
  for (const [why, f] of [['missing', undefined], ['not an object', 'on'], ['empty name', flag('on', '')], ['name not text', flag('on', 7)], ['value not text or null', flag(1)], ['value undefined', { name: 'KAAL_X_Y' }]]) {
    r = await withFlag(f);
    assert.equal(r.mode, 'preventive', why); assert.equal(r.applied, null, why); assert.equal(r.blocked, true, why); assert.equal(r.log.flag.state, 'UNKNOWN', why); assert.equal(r.record.flag.state, 'UNKNOWN', why); assert.equal(r.record.applied, null, why);
  }
  r = await runControl({ id: 'x/CTL1', mode: 'detective', check: failing }); // no boundary at all
  assert.equal(r.log.flag.state, 'UNKNOWN'); assert.equal(r.record, null); assert.equal(r.verdict, 'REPORT');
  // a run that cannot be identified leaves no record, switched off or not
  r = await go({ boundary: { flag: flag('off') } }); assert.equal(r.record, null); assert.equal(r.mode, 'off');
  // the library reads no environment: a variable of that name in the process changes nothing
  process.env.KAAL_X_Y = 'off';
  try { r = await withFlag(flag('on')); assert.equal(r.mode, 'preventive'); r = await withFlag(undefined); assert.equal(r.log.flag.state, 'UNKNOWN'); } finally { delete process.env.KAAL_X_Y; }
  // a flag never turns a verdict into another: on and unknown give the verdict of the mode alone
  r = await withFlag(flag('on'), { check: clean }); assert.equal(r.verdict, 'PASS'); assert.equal(r.blocked, false);
  // an unusable id is unknown whatever the flag says
  r = await withFlag(flag('on'), { id: '' }); assert.equal(r.verdict, 'UNKNOWN');
}
