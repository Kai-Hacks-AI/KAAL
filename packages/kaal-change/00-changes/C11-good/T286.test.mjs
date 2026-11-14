// Case change/T286 tests: change/G3
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
export const id = 'change/T286';
export const tests = ['change/G3'];
export const title = "the reference asks the four questions";
const REF = new URL('../../skills/kaal-change/references/good.md', import.meta.url);
export function run() {
  assert.ok(existsSync(REF), 'the good reference is absent');
  const t = readFileSync(REF, 'utf8');
  for (const w of ['**Good.**','**Bad.**','**Notice.**','**Wrong.**']) assert.ok(t.includes(w), 'missing: ' + w);
}
test(id, () => run());
