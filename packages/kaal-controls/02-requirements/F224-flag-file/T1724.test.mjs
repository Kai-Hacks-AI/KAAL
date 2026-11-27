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
export const title = 'the flag of the file reaches the run as boundary.flag with no mode logic of its own, a missing one runs as UNKNOWN, and the file code names no adopter, platform or path and reads nothing';
export async function run() {
  const { parseFlags, flagSource } = await load('flags.mjs');
  const { runControl } = await load('adapter.mjs');
  const src = flagSource(parseFlags(JSON.stringify({ schema: 'kaal-controls/flags@1', flags: [{ control: 'x/CTL1', name: 'F1', value: 'on' }, { control: 'x/CTL2', name: 'F2', value: 'off' }] })));
  const run = (c) => runControl({ id: c, mode: 'preventive', check: () => ['a'], boundary: { x: 'real', run: '1', sha: 'tree:a', flag: src.of(c) } });
  const on = await run('x/CTL1'), off = await run('x/CTL2'), none = await run('x/CTL3');
  assert.deepEqual([on.mode, on.applied, on.verdict, on.blocked], ['preventive', true, 'FAIL', true]);
  assert.deepEqual([off.mode, off.applied, off.blocked], ['off', false, false]);
  assert.deepEqual([none.mode, none.applied, none.blocked], ['preventive', null, true]);
  assert.equal(none.log.flag.state, 'UNKNOWN');
  // a flag source is a seam: any object with of() serves
  const stub = { of: (c) => ({ name: 'S', value: c === 'x/CTL1' ? 'on' : null }) };
  assert.equal((await runControl({ id: 'x/CTL1', mode: 'preventive', check: () => [], boundary: { flag: stub.of('x/CTL1') } })).applied, true);
  const text = readFileSync(join(S, 'flags.mjs'), 'utf8');
  for (const bad of ['node:fs', 'node:child_process', 'process.env', 'github', 'GitHub', 'engineering/', 'KAAL_', 'fetch(']) assert.ok(!text.includes(bad), `flags.mjs contains ${bad}`);
}
