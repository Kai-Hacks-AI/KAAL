// Case change/T1560 tests: change/G18
import test from 'node:test';
import assert from 'node:assert/strict';
import { pinOf, record, entry, succeeds, load } from './fixtures.mjs';
export const id = 'change/T1560';
export const tests = ['change/G18'];
export const closes = ['change/G18'];
export const title = 'a cycle, and a Change that succeeds itself, are findings naming each Change, sorted';
export async function run() {
  const readSuccession = await load();
  // Pins cannot be written for a true cycle from bytes; the reader is given asserted pins through pinOf, as change/F12 allows.
  const texts = {
    'change/C1': record('change/C1', succeeds(entry('change/C2', 'a'.repeat(64)))),
    'change/C2': record('change/C2', succeeds(entry('change/C1', 'b'.repeat(64)))),
    'change/C3': record('change/C3', succeeds(entry('change/C3', 'c'.repeat(64)))),
  };
  const asserted = (text) => ({ [texts['change/C1']]: 'b'.repeat(64), [texts['change/C2']]: 'a'.repeat(64), [texts['change/C3']]: 'c'.repeat(64) })[text];
  const r = readSuccession(Object.entries(texts).map(([identity, text]) => ({ identity, text })), { pinOf: asserted });
  const cycles = r.findings.filter((f) => f.kind === 'cycle').map((f) => f.changes);
  assert.deepEqual(cycles, [['change/C1', 'change/C2'], ['change/C3']]);
}
test(id, () => run());
