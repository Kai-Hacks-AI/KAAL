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
export const title = 'parseFlags reads the flag file whole or not at all, one entry for each control and place, and flagSource gives a flag for an entry and undefined for none';
const file = (flags, schema = 'kaal-controls/flags@1') => JSON.stringify({ schema, flags });
export async function run() {
  const { parseFlags, flagSource } = await load('flags.mjs');
  const e1 = { control: 'x/CTL2', place: 'pull_request', name: 'FLAG_X_CTL2', value: 'preventing' };
  const e2 = { control: 'x/CTL1', place: 'merge_group', name: 'FLAG_X_CTL1', value: null };
  const e3 = { control: 'x/CTL2', place: 'merge_group', name: 'FLAG_X_CTL2', value: 'advisory' };
  const entries = parseFlags(file([e1, e2, e3]));
  assert.deepEqual(entries, [e2, e3, e1], 'sorted by control and place');
  assert.deepEqual(parseFlags(file([])), []);
  for (const bad of ['', 'not json', '[]', 'null', file([e1], 'other@1'), JSON.stringify({ schema: 'kaal-controls/flags@1' }), JSON.stringify({ schema: 'kaal-controls/flags@1', flags: {} }),
    file([e1, e1]), file([{ ...e1, control: '' }]), file([{ ...e1, place: '' }]), file([{ ...e1, place: undefined }]), file([{ ...e1, name: '' }]), file([{ ...e1, name: 3 }]), file([{ ...e1, value: 1 }]), file([{ control: 'x/CTL1', place: 'p', name: 'N' }]), file([null]), file([e1, 'x'])]) {
    assert.throws(() => parseFlags(bad), undefined, String(bad).slice(0, 40));
  }
  assert.throws(() => parseFlags(undefined));
  assert.throws(() => parseFlags(5));
  const src = flagSource(entries);
  assert.deepEqual(src.of('x/CTL2', 'pull_request'), { name: 'FLAG_X_CTL2', value: 'preventing' });
  assert.deepEqual(src.of('x/CTL2', 'merge_group'), { name: 'FLAG_X_CTL2', value: 'advisory' });
  assert.deepEqual(src.of('x/CTL1', 'merge_group'), { name: 'FLAG_X_CTL1', value: null });
  assert.equal(src.of('x/CTL1', 'pull_request'), undefined, 'a control in another place has no flag there');
  assert.equal(src.of('x/CTL9', 'pull_request'), undefined, 'a missing flag stays missing');
  assert.deepEqual(src.controls(), ['x/CTL1@merge_group', 'x/CTL2@merge_group', 'x/CTL2@pull_request']);
  assert.throws(() => flagSource('x'));
}
