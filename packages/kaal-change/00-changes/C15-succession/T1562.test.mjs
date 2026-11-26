// Case change/T1562 tests: change/G18
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
export const id = 'change/T1562';
export const tests = ['change/G18'];
export const closes = ['change/G18'];
export const title = 'the reader is pure over the records it is given: no file, process, network or host word';
export function run() {
  const url = new URL('../../lib/succession.mjs', import.meta.url);
  assert.ok(existsSync(url), 'lib/succession.mjs is absent');
  const src = readFileSync(url, 'utf8');
  for (const m of ['node:fs', 'node:child_process', 'node:http', 'node:https', 'node:net', 'fetch(', 'process.env'])
    assert.ok(!src.includes(m), 'the reader uses ' + m);
  for (const w of ['github', 'pull request', 'branch', 'collector'])
    assert.ok(!src.toLowerCase().includes(w), 'the reader names ' + w);
}
test(id, () => run());
