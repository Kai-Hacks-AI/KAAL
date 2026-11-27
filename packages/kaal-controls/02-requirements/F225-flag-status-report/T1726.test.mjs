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
export const title = 'reportFlags gives one row for each control and place with its flag, declared state, STAMP and blocking, and names every reason and orphan as a finding, never as a block';
export async function run() {
  const { parseFlags, flagSource } = await load('flags.mjs');
  const { reportFlags } = await load('flag-status.mjs');
  const e = (control, place, value) => ({ control, place, name: `F_${control}_${place}`, value });
  const source = flagSource(parseFlags(JSON.stringify({ schema: 'kaal-controls/flags@1', flags: [
    e('x/CTL1', 'pr', 'preventing'), e('x/CTL1', 'mg', 'advisory'), e('x/CTL2', 'pr', 'stopped'), e('x/CTL3', 'pr', 'advisory'), e('x/CTL4', 'pr', 'preventing'), e('x/CTL9', 'pr', 'on')] })));
  const controls = [
    { id: 'x/CTL1', type: 'preventive', places: ['mg', 'pr'] }, { id: 'x/CTL2', type: 'preventive', places: ['pr'] }, { id: 'x/CTL3', type: 'detective', places: ['pr'] },
    { id: 'x/CTL4', type: 'preventive', places: ['pr'] }, { id: 'x/CTL5', type: 'preventive', places: ['pr'] }, { id: 'x/CTL7', type: 'directive', places: ['pr'] }];
  const run = (verdict, applied, id = 'r', sha) => ({ run: id, verdict, mode: applied ? 'preventive' : 'off', applied, ...(sha ? { sha } : {}) });
  const runs = {
    'x/CTL1': { pr: [run('PASS', false, 'r1'), run('PASS', true, 'r2', 'tree:a')], mg: [run('REPORT', false, 'r3')] },
    'x/CTL3': { pr: [run('UNKNOWN', false, 'r4')] },
    'x/CTL4': { pr: [run('PASS', true, 'r5')] },
  };
  const rep = reportFlags({ controls, source, runs });
  assert.deepEqual(rep.rows.map((x) => `${x.control}@${x.place}`), ['x/CTL1@mg', 'x/CTL1@pr', 'x/CTL2@pr', 'x/CTL3@pr', 'x/CTL4@pr', 'x/CTL5@pr']);
  const by = Object.fromEntries(rep.rows.map((x) => [`${x.control}@${x.place}`, x]));
  assert.deepEqual([by['x/CTL1@pr'].declared, by['x/CTL1@pr'].stamp, by['x/CTL1@pr'].blocking, by['x/CTL1@pr'].running, by['x/CTL1@pr'].last], ['PREVENTING', 'PREVENTING', true, true, { run: 'r2', sha: 'tree:a' }]);
  assert.deepEqual([by['x/CTL1@mg'].declared, by['x/CTL1@mg'].stamp, by['x/CTL1@mg'].blocking, by['x/CTL1@mg'].flag], ['ADVISORY', 'ADVISORY', false, { name: 'F_x/CTL1_mg', value: 'advisory' }]);
  assert.deepEqual([by['x/CTL2@pr'].stamp, by['x/CTL2@pr'].blocking, by['x/CTL2@pr'].running, by['x/CTL2@pr'].last], ['STOPPED', false, null, null]);
  assert.deepEqual([by['x/CTL3@pr'].stamp, by['x/CTL3@pr'].running, by['x/CTL3@pr'].last], ['TORN', null, { run: 'r4' }]);
  assert.deepEqual([by['x/CTL4@pr'].stamp, by['x/CTL4@pr'].blocking], ['PREVENTING', true]);
  assert.deepEqual([by['x/CTL5@pr'].flag, by['x/CTL5@pr'].declared, by['x/CTL5@pr'].stamp, by['x/CTL5@pr'].blocking], [null, 'UNKNOWN', 'MUTE', null]);
  assert.deepEqual(rep.findings, ['no-flag:x/CTL5@pr', 'no-verdict:x/CTL3@pr', 'orphan-flag:x/CTL9@pr', 'unproven-preventing:x/CTL4@pr']);
  const stubOnly = reportFlags({ controls: [{ id: 'x/CTL1', type: 'preventive', places: ['pr'] }], source: { of: () => ({ name: 'S', value: 'advisory' }) }, runs: { 'x/CTL1': { pr: [run('PASS', false)] } } });
  assert.deepEqual(stubOnly.findings, [], 'a source that cannot list gives no orphan finding');
  assert.throws(() => reportFlags({ controls: 'x', source, runs }));
  assert.throws(() => reportFlags({ controls: [{ id: 'x/CTL1', type: 'preventive' }], source, runs }), undefined, 'a control needs its places');
  assert.throws(() => reportFlags({ controls, source: null, runs }));
}
