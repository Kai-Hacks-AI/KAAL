// Case release/T1405 tests: release/C124
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { baselineFile, emit } from './fixtures.mjs';
export const id = 'release/T1405';
export const tests = ['release/C124'];
export const title = 'the baseline file equals the findings of the workflows of this repository, so a rename that forgets the baseline names itself';
export async function run() {
  const repo = fileURLToPath(new URL('../../../../', import.meta.url));
  const r = emit(repo);
  assert.equal(r.code, 0, r.stderr);
  assert.deepEqual(JSON.parse(readFileSync(r.out, 'utf8')), JSON.parse(readFileSync(baselineFile, 'utf8')));
}
