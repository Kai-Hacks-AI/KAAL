// Case change/T287 tests: change/G3
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
export const id = 'change/T287';
export const tests = ['change/G3'];
export const title = "the reference says where the answers live";
const REF = new URL('../../skills/kaal-change/references/good.md', import.meta.url);
export function run() {
  assert.ok(existsSync(REF), 'the good reference is absent');
  const t = readFileSync(REF, 'utf8');
  for (const w of ['chapter called `Good`','Requirements']) assert.ok(t.includes(w), 'missing: ' + w);
}
test(id, () => run());
