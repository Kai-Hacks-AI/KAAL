// Case change/T287 tests: change/G5
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
export const id = 'change/T287';
export const tests = ['change/G5'];
export const title = "gap change/G5 is closed: a Change records PLAN RED, amendment cause and CPO change-request";
const REF = new URL('../../skills/kaal-change/references/measurement.md', import.meta.url);
export function run() {
  assert.ok(existsSync(REF), 'the measurement reference is absent');
  const t = readFileSync(REF, 'utf8');
  for (const w of ['PLAN RED','## Amendment','CHANGE-REQUEST','## Record']) assert.ok(t.includes(w), 'missing: ' + w);
}
test(id, () => run());
