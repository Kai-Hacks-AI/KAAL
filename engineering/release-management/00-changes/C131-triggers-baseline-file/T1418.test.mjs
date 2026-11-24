// Case release/T1418 tests: release/C131
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BASELINE, findingsOf, readTree } from '../../05-src/triggers/verify-triggers.mjs';
export const id = 'release/T1418';
export const tests = ['release/C131'];
export const title = 'the baseline file of verify Triggers is a sorted list of unique workflow paths and equals the findings of .github/workflows of the repository, so a change that forgets it names itself';
export async function run() {
  const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
  const list = JSON.parse(readFileSync(`${repo}/${BASELINE}`, 'utf8'));
  assert.ok(Array.isArray(list) && list.every((x) => typeof x === 'string' && x));
  assert.deepEqual(list, [...new Set(list)].sort(), 'the file is sorted and holds no name twice');
  assert.deepEqual(list, findingsOf(readTree(`${repo}/.github/workflows`)), 'the file differs from what the workflows say');
}
