// Case change/T1700 tests: change/G20
import test from 'node:test';
import assert from 'node:assert/strict';
import { pinOf, record, entry, succeeds, lib, kinds } from './fixtures.mjs';
export const id = 'change/T1700';
export const tests = ['change/G20'];
export const closes = ['change/G20'];
export const title = 'a required record states its predecessors or states none: an absent succeeds is undeclared, an empty list is an answer';
export async function run() {
  const { readSuccession } = await lib('succession');
  const a = record('release/C1');
  const read = (extra, required) => readSuccession([{ identity: 'release/C1', text: a }, { identity: 'change/C2', text: record('change/C2', extra) }], { pinOf, ...(required ? { require: required } : {}) });
  const need = ['change/C2'];
  const absent = read('', need);
  assert.deepEqual(kinds(absent), ['undeclared']);
  assert.deepEqual(absent.findings.map((f) => f.change), ['change/C2']);
  assert.deepEqual(kinds(read('succeeds: []\n', need)), [], 'an explicit empty list is an answer');
  assert.deepEqual(kinds(read(succeeds(entry('release/C1', pinOf(a))), need)), [], 'entries are an answer');
  assert.deepEqual(kinds(read('', undefined)), [], 'without require nothing changes');
  assert.deepEqual(kinds(read('', ['release/C1'])), ['undeclared'], 'only a required identity is held to it');
  assert.deepEqual(kinds(read('', [])), [], 'an empty require holds no one');
}
test(id, () => run());
