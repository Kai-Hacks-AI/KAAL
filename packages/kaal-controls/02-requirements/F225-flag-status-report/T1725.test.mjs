// Case controls/T1725 tests: controls/F225
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (rel) => { const f = join(S, rel); assert.ok(existsSync(f), `scripts/${rel} is absent`); return import(pathToFileURL(f).href); };
export const id = 'controls/T1725';
export const tests = ['controls/F225'];
export const title = 'reportFlags gives one row per control with its flag, state, effective mode and what its runs show, and names no-flag, orphan-flag, flag-disagrees and never-ran as findings, never as a block';
export async function run() {
  const { parseFlags, flagSource } = await load('flags.mjs');
  const { reportFlags } = await load('flag-status.mjs');
  const entry = (control, value) => ({ control, name: `F_${control}`, value });
  const source = flagSource(parseFlags(JSON.stringify({ schema: 'kaal-controls/flags@1', flags: [entry('x/CTL1', 'on'), entry('x/CTL2', 'off'), entry('x/CTL3', null), entry('x/CTL4', 'on'), entry('x/CTL5', 'on'), entry('x/CTL9', 'on')] })));
  const controls = [
    { id: 'x/CTL2', type: 'preventive' }, { id: 'x/CTL1', type: 'preventive' }, { id: 'x/CTL3', type: 'preventive' }, { id: 'x/CTL4', type: 'detective' },
    { id: 'x/CTL5', type: 'preventive' }, { id: 'x/CTL6', type: 'preventive' }, { id: 'x/CTL7', type: 'directive' },
  ];
  const ran = (applied, run = 'r1') => ({ running: true, applied, modes: ['preventive'], runs: 1, last: { run, sha: 'tree:a' } });
  const running = { 'x/CTL1': ran(true), 'x/CTL2': ran(true, 'r2'), 'x/CTL3': ran(false), 'x/CTL4': ran(true), 'x/CTL5': ran(false) };
  const r = reportFlags({ controls, source, running });
  assert.deepEqual(r.rows.map((x) => x.control), ['x/CTL1', 'x/CTL2', 'x/CTL3', 'x/CTL4', 'x/CTL5', 'x/CTL6', 'x/CTL7']);
  const by = Object.fromEntries(r.rows.map((x) => [x.control, x]));
  assert.deepEqual([by['x/CTL1'].state, by['x/CTL1'].effective, by['x/CTL1'].applied, by['x/CTL1'].last], ['on', 'preventive', true, { run: 'r1', sha: 'tree:a' }]);
  assert.deepEqual([by['x/CTL2'].state, by['x/CTL2'].effective], ['off', 'detective']);
  assert.deepEqual([by['x/CTL3'].state, by['x/CTL3'].effective, by['x/CTL3'].flag], ['off', 'detective', { name: 'F_x/CTL3', value: null }]);
  assert.deepEqual([by['x/CTL4'].state, by['x/CTL4'].effective], ['on', 'detective']);
  assert.deepEqual([by['x/CTL6'].flag, by['x/CTL6'].state, by['x/CTL6'].effective, by['x/CTL6'].applied, by['x/CTL6'].running, by['x/CTL6'].last], [null, 'UNKNOWN', 'preventive', null, null, null]);
  assert.deepEqual([by['x/CTL7'].effective, by['x/CTL7'].state], ['none', 'UNKNOWN']);
  assert.deepEqual(r.findings, ['flag-disagrees:x/CTL2', 'flag-disagrees:x/CTL5', 'no-flag:x/CTL6', 'orphan-flag:x/CTL9']);
  const one = flagSource(parseFlags(JSON.stringify({ schema: 'kaal-controls/flags@1', flags: [entry('x/CTL1', 'on')] })));
  const never = reportFlags({ controls: [{ id: 'x/CTL1', type: 'preventive' }], source: one, running: {} });
  assert.deepEqual(never.findings, ['never-ran:x/CTL1']);
  const unknown = reportFlags({ controls: [{ id: 'x/CTL1', type: 'preventive' }], source: one, running: { 'x/CTL1': { running: true, applied: null, modes: [], runs: 1, last: null } } });
  assert.deepEqual(unknown.findings, [], 'unknown applied is no disagreement');
  const stubOnly = reportFlags({ controls: [{ id: 'x/CTL1', type: 'preventive' }], source: { of: () => ({ name: 'S', value: 'on' }) }, running: { 'x/CTL1': ran(true) } });
  assert.deepEqual(stubOnly.findings, [], 'a source that cannot list gives no orphan finding');
  assert.throws(() => reportFlags({ controls: 'x', source, running }));
  assert.throws(() => reportFlags({ controls, source: null, running }));
}
