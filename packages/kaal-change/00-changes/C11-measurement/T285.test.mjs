// Case change/T285 tests: change/G3
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
export const id = 'change/T285';
export const tests = ['change/G3'];
export const title = "gap change/G3 is closed: an Intent records stated, source, fulfilled and dropped";
const REF = new URL('../../skills/kaal-change/references/measurement.md', import.meta.url);
export function run() {
  assert.ok(existsSync(REF), 'the measurement reference is absent');
  const t = readFileSync(REF, 'utf8');
  for (const w of ['stated:','source:','DROPPED','FULFILLED']) assert.ok(t.includes(w), 'missing: ' + w);
}
test(id, () => run());
