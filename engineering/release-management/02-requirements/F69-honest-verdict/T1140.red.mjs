// Case release/T1140 tests: release/F69
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM, draft, loadDraft, green, facts, NOW } from '../../03-architecture/A64-verdict-from-evidence/fixtures.mjs';
export const id = 'release/T1140';
export const tests = ['release/F69'];
export const title = "release/F69 serves release/I51 and states the honest verdict, equal to its draft";
export async function run() {
  const real = join(RM, '02-requirements/F69-honest-verdict/F69.md');
  assert.ok(existsSync(real), 'F69.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, draft('F69.md') + '\n', 'F69.md differs from the draft');
  assert.match(t, /serves: \[release\/I51\]/);
  assert.match(t, /never replaces or hides the verdict/);
}
