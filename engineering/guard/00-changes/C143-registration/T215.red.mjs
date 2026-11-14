// Case guard/T215 tests: F48
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { repo } from './lib.mjs';
export const id = 'guard/T215';
export const tests = ['guard/F48'];
export const title = 'Guard\'s own namespace in .kaal is config/guard, state/guard and guard/registered, and the boundary Case guard/T30 allows exactly those (successor of T30\'s namespace rule, listed before and after in change.md)';
export function run() {
  const t30 = readFileSync(join(repo, 'packages/kaal-guard/test/acceptance/architecture.test.mjs'), 'utf8');
  assert.match(t30, /guard\/registered/, 'the boundary Case does not allow Guard\'s registered namespace');
  const f1 = readFileSync(join(repo, 'packages/kaal-guard/docs/requirements.md'), 'utf8');
  assert.match(f1, /guard\/registered/, 'the enduring requirements do not name Guard\'s registered namespace');
}
