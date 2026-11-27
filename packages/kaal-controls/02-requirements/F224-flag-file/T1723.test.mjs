// Case controls/T1723 tests: controls/F224
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (rel) => { const f = join(S, rel); assert.ok(existsSync(f), `scripts/${rel} is absent`); return import(pathToFileURL(f).href); };
export const id = 'controls/T1723';
export const tests = ['controls/F224'];
export const title = 'parseFlags reads the flag file whole or not at all, and flagSource gives a flag for an entry and undefined for a control with none';
const file = (flags, schema = 'kaal-controls/flags@1') => JSON.stringify({ schema, flags });
export async function run() {
  const { parseFlags, flagSource } = await load('flags.mjs');
  const e1 = { control: 'x/CTL2', name: 'FLAG_X_CTL2', value: 'on' };
  const e2 = { control: 'x/CTL1', name: 'FLAG_X_CTL1', value: null };
  const entries = parseFlags(file([e1, e2]));
  assert.deepEqual(entries, [e2, e1], 'sorted by control');
  assert.deepEqual(parseFlags(file([])), []);
  for (const bad of ['', 'not json', '[]', 'null', file([e1], 'other@1'), JSON.stringify({ schema: 'kaal-controls/flags@1' }), JSON.stringify({ schema: 'kaal-controls/flags@1', flags: {} }),
    file([e1, e1]), file([{ ...e1, control: '' }]), file([{ ...e1, name: '' }]), file([{ ...e1, name: 3 }]), file([{ ...e1, value: 1 }]), file([{ control: 'x/CTL1', name: 'N' }]), file([null]), file([e1, 'x'])]) {
    assert.throws(() => parseFlags(bad), undefined, String(bad).slice(0, 40));
  }
  assert.throws(() => parseFlags(undefined));
  assert.throws(() => parseFlags(5));
  const src = flagSource(entries);
  assert.deepEqual(src.of('x/CTL2'), { name: 'FLAG_X_CTL2', value: 'on' });
  assert.deepEqual(src.of('x/CTL1'), { name: 'FLAG_X_CTL1', value: null });
  assert.equal(src.of('x/CTL9'), undefined, 'a missing flag stays missing, not off');
  assert.deepEqual(src.controls(), ['x/CTL1', 'x/CTL2']);
  assert.throws(() => flagSource('x'));
}
