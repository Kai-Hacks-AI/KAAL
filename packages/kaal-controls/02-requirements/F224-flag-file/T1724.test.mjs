// Case controls/T1724 tests: controls/F224
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (rel) => { const f = join(S, rel); assert.ok(existsSync(f), `scripts/${rel} is absent`); return import(pathToFileURL(f).href); };
export const id = 'controls/T1724';
export const tests = ['controls/F224'];
export const title = 'the flag of the file reaches the adapter through toBoundary with no change of the adapter: preventing applies, advisory reports, a missing flag is UNKNOWN, stopped is not run, and the file code names no adopter, platform or path and reads nothing';
export async function run() {
  const { parseFlags, flagSource } = await load('flags.mjs');
  const { toBoundary } = await load('stamp.mjs');
  const { runControl } = await load('adapter.mjs');
  const src = flagSource(parseFlags(JSON.stringify({ schema: 'kaal-controls/flags@1', flags: [
    { control: 'x/CTL1', place: 'p', name: 'F1', value: 'preventing' }, { control: 'x/CTL2', place: 'p', name: 'F2', value: 'advisory' },
    { control: 'x/CTL4', place: 'p', name: 'F4', value: 'stopped' }, { control: 'x/CTL5', place: 'p', name: 'F5', value: 'on' }, { control: 'x/CTL6', place: 'p', name: 'F6', value: 'maybe' }] })));
  const flag = (c) => { const f = src.of(c, 'p'); return f ? toBoundary(f.name, f.value) : undefined; };
  assert.deepEqual(flag('x/CTL1'), { name: 'F1', value: 'on' });
  assert.deepEqual(flag('x/CTL2'), { name: 'F2', value: 'off' });
  assert.deepEqual(flag('x/CTL5'), { name: 'F5', value: 'on' }, 'the legacy on is preventing');
  assert.equal(flag('x/CTL4'), null, 'stopped means the adopter does not run the control');
  assert.equal(toBoundary('F6', 'maybe'), undefined, 'a value that is not understood is not off');
  assert.equal(toBoundary('F7', null), undefined);
  assert.equal(flag('x/CTL3'), undefined);
  const run = (c) => runControl({ id: c, mode: 'preventive', check: () => ['a'], boundary: { x: 'real', run: '1', sha: 'tree:a', flag: flag(c) } });
  const on = await run('x/CTL1'), off = await run('x/CTL2'), none = await run('x/CTL3'), odd = await run('x/CTL6');
  assert.deepEqual([on.mode, on.applied, on.verdict, on.blocked], ['preventive', true, 'FAIL', true]);
  assert.deepEqual([off.mode, off.applied, off.blocked], ['off', false, false]);
  assert.deepEqual([none.mode, none.applied, none.blocked], ['preventive', null, true]);
  assert.deepEqual([odd.applied, odd.log.flag.state], [null, 'UNKNOWN']);
  const stub = { of: () => ({ name: 'S', value: 'advisory' }) };
  assert.equal(stub.of('c', 'p').value, 'advisory', 'any source with of() serves');
  const text = readFileSync(join(S, 'flags.mjs'), 'utf8') + readFileSync(join(S, 'stamp.mjs'), 'utf8');
  for (const bad of ['node:fs', 'node:child_process', 'process.env', 'github', 'GitHub', 'engineering/', 'KAAL_', 'fetch(']) assert.ok(!text.includes(bad), `the flag code contains ${bad}`);
}
