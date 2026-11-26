// Case change/T1553 tests: change/G17
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
export const id = 'change/T1553';
export const tests = ['change/G17'];
export const closes = ['change/G17'];
export const title = 'kaal-change declares exactly PLAN, DO, ACT and HOTFIX';
export const FILE = new URL('../../13-source/pull-request-types/kaal-change.json', import.meta.url);
export const load = () => {
  assert.ok(existsSync(FILE), 'the declaration file is absent');
  return JSON.parse(readFileSync(FILE, 'utf8'));
};
export function run() {
  const d = load();
  assert.deepEqual(Object.keys(d), ['types']);
  assert.deepEqual(d.types.map(t => t.type), ['PLAN', 'DO', 'ACT', 'HOTFIX']);
}
test(id, () => run());
