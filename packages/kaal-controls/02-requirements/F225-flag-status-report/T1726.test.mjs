// Case controls/T1726 tests: controls/F225
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (rel) => { const f = join(S, rel); assert.ok(existsSync(f), `scripts/${rel} is absent`); return import(pathToFileURL(f).href); };
export const id = 'controls/T1726';
export const tests = ['controls/F225'];
export const title = 'reportFlags gives one row for each control and place with the declared decision, the observed signal, the blocking by decision and the evidence of what blocked as separate fields, an unknown flag as a configuration error and not a state, and every mismatch as a finding';
export async function run() {
  const { parseFlags, flagSource } = await load('flags.mjs');
  const { reportFlags } = await load('flag-status.mjs');
  const e = (control, place, value) => ({ control, place, name: `F_${control}_${place}`, value });
  const file = (flags) => flagSource(parseFlags(JSON.stringify({ schema: 'kaal-controls/flags@1', flags })));
  const source = file([e('x/CTL1', 'pr', 'preventing'), e('x/CTL1', 'mg', 'advisory'), e('x/CTL2', 'pr', 'stopped'), e('x/CTL3', 'pr', 'advisory'), e('x/CTL4', 'pr', 'preventing'), e('x/CTL6', 'pr', 'maybe'), e('x/CTL9', 'pr', 'on')]);
  const controls = [
    { id: 'x/CTL1', type: 'preventive', places: ['mg', 'pr'] }, { id: 'x/CTL2', type: 'preventive', places: ['pr'] }, { id: 'x/CTL3', type: 'detective', places: ['pr'] },
    { id: 'x/CTL4', type: 'preventive', places: ['pr'] }, { id: 'x/CTL5', type: 'preventive', places: ['pr'] }, { id: 'x/CTL6', type: 'preventive', places: ['pr'] }, { id: 'x/CTL7', type: 'directive', places: ['pr'] }];
  const run = (verdict, applied, blocked, id = 'r', sha) => ({ run: id, verdict, applied, blocked, ...(sha ? { sha } : {}) });
  const runs = {
    'x/CTL1': { pr: [run('PASS', false, false, 'r1'), run('FAIL', true, true, 'r2', 'tree:a')], mg: [run('REPORT', false, false, 'r3')] },
    'x/CTL3': { pr: [run('UNKNOWN', false, false, 'r4')] },
    'x/CTL4': { pr: [run('PASS', true, false, 'r5')] },
    'x/CTL5': { pr: [run('FAIL', null, true, 'r6')] },
  };
  const rep = reportFlags({ controls, source, runs });
  assert.deepEqual(rep.rows.map((x) => `${x.control}@${x.place}`), ['x/CTL1@mg', 'x/CTL1@pr', 'x/CTL2@pr', 'x/CTL3@pr', 'x/CTL4@pr', 'x/CTL5@pr', 'x/CTL6@pr']);
  const by = Object.fromEntries(rep.rows.map((x) => [`${x.control}@${x.place}`, x]));
  const f = (k) => { const x = by[k]; return [x.declared, x.observed, x.stamp, x.blocking, x.blocked, x.configError]; };
  assert.deepEqual(f('x/CTL1@pr'), ['PREVENTING', 'OK', 'PREVENTING', true, true, null]);
  assert.deepEqual([by['x/CTL1@pr'].running, by['x/CTL1@pr'].last], [true, { run: 'r2', sha: 'tree:a' }]);
  assert.deepEqual(f('x/CTL1@mg'), ['ADVISORY', 'OK', 'ADVISORY', false, false, null]);
  assert.deepEqual(by['x/CTL1@mg'].flag, { name: 'F_x/CTL1_mg', value: 'advisory' });
  assert.deepEqual(f('x/CTL2@pr'), ['STOPPED', 'N/A', 'STOPPED', false, null, null]);
  assert.deepEqual([by['x/CTL2@pr'].running, by['x/CTL2@pr'].last], [null, null]);
  assert.deepEqual(f('x/CTL3@pr'), ['ADVISORY', 'TORN', 'TORN', false, false, null]);
  assert.deepEqual([by['x/CTL3@pr'].running, by['x/CTL3@pr'].last], [null, { run: 'r4' }]);
  assert.deepEqual(f('x/CTL4@pr'), ['PREVENTING', 'OK', 'PREVENTING', false, false, null]);
  assert.deepEqual(f('x/CTL5@pr'), [null, null, null, null, true, 'no-flag'], 'no flag is a configuration error and not Mute, and the block is shown');
  assert.equal(by['x/CTL5@pr'].flag, null);
  assert.deepEqual(f('x/CTL6@pr'), [null, null, null, null, null, 'unrecognized-flag']);
  assert.deepEqual(rep.findings, ['blocked-without-flag:x/CTL5@pr', 'no-flag:x/CTL5@pr', 'no-verdict:x/CTL3@pr', 'orphan-flag:x/CTL9@pr', 'unproven-preventing:x/CTL4@pr', 'unrecognized-flag:x/CTL6@pr']);
  const only = (id, value) => file([e(id, 'pr', value)]);
  const stopped = reportFlags({ controls: [{ id: 'x/CTL2', type: 'preventive', places: ['pr'] }], source: only('x/CTL2', 'stopped'), runs: { 'x/CTL2': { pr: [run('FAIL', true, true, 'r8')] } } });
  assert.deepEqual([stopped.rows[0].stamp, stopped.rows[0].blocking, stopped.rows[0].blocked], ['STOPPED', false, true], 'the decision and the evidence are both shown');
  assert.deepEqual(stopped.findings, ['blocked-while-stopped:x/CTL2@pr', 'ran-while-stopped:x/CTL2@pr']);
  const mute = reportFlags({ controls: [{ id: 'x/CTL1', type: 'preventive', places: ['pr'] }], source: only('x/CTL1', 'preventing'), runs: {} });
  assert.deepEqual([mute.rows[0].stamp, mute.rows[0].observed, mute.rows[0].blocking], ['MUTE', 'MUTE', true]);
  assert.deepEqual(mute.findings, ['no-trace:x/CTL1@pr', 'unproven-preventing:x/CTL1@pr']);
  const stubOnly = reportFlags({ controls: [{ id: 'x/CTL1', type: 'preventive', places: ['pr'] }], source: { of: () => ({ name: 'S', value: 'advisory' }) }, runs: { 'x/CTL1': { pr: [run('PASS', false, false)] } } });
  assert.deepEqual(stubOnly.findings, [], 'a source that cannot list gives no orphan finding');
  assert.throws(() => reportFlags({ controls: 'x', source, runs }));
  assert.throws(() => reportFlags({ controls: [{ id: 'x/CTL1', type: 'preventive' }], source, runs }), undefined, 'a control needs its places');
  assert.throws(() => reportFlags({ controls, source: null, runs }));
}
