// Case change/T288 tests: change/G3
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
export const id = 'change/T288';
export const tests = ['change/G3'];
export const title = "the reference says Change owns only its own Good and offers no general method";
const REF = new URL('../../skills/kaal-change/references/good.md', import.meta.url);
export function run() {
  assert.ok(existsSync(REF), 'the good reference is absent');
  const t = readFileSync(REF, 'utf8');
  for (const w of ['did our Good notice','Every capability owns its own Good','Review can review anything']) assert.ok(t.includes(w), 'missing: ' + w);
}
test(id, () => run());
