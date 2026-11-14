// Case change/T288 tests: change/G3
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
export const id = 'change/T288';
export const tests = ['change/G3'];
export const title = "the reader returns UNKNOWN for a missing field and marks reconstructed records";
const REF = new URL('../../skills/kaal-change/references/measurement.md', import.meta.url);
export function run() {
  assert.ok(existsSync(REF), 'the measurement reference is absent');
  const t = readFileSync(REF, 'utf8');
  for (const w of ['UNKNOWN','reconstructed: true','measurement epoch']) assert.ok(t.includes(w), 'missing: ' + w);
}
test(id, () => run());
