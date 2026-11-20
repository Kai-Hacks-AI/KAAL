// Case change/T285 tests: change/G3
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
export const id = 'change/T285';
export const tests = ['change/G3'];
export const title = "gap change/G3 is closed: the reference states what a good Change is";
const REF = new URL('../../skills/kaal-change/references/good.md', import.meta.url);
export function run() {
  assert.ok(existsSync(REF), 'the good reference is absent');
  const t = readFileSync(REF, 'utf8');
  for (const w of ['A Change delivers the Intent and Requirements it states']) assert.ok(t.includes(w), 'missing: ' + w);
}
test(id, () => run());
