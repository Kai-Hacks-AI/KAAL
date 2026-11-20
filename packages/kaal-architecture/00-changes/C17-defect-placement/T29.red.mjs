// Case architecture/T29 tests: architecture/N3
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import * as records from '../../lib/records.mjs';
export const id = 'architecture/T29';
export const tests = ['architecture/N3'];
export const title = 'placement reuses addresses: the library exports only the record mechanics and the lookup, there is no placement library, and nothing is written, run or given a status';
export function run() {
  assert.deepEqual(Object.keys(records).sort(), ['addressing', 'checkAddresses', 'nextId', 'readRecord']);
  assert.ok(!existsSync(new URL('../../lib/placement.mjs', import.meta.url)), 'no placement library');
  const src = readFileSync(new URL('../../lib/records.mjs', import.meta.url), 'utf8');
  assert.ok(!/from\s+'|writeFile|appendFile|child_process|fixOwner|origin/.test(src), 'no import, write, run or placement field');
}
