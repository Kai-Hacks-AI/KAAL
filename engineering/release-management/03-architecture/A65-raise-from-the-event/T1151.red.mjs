// Case release/T1151 tests: release/A65
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM, draft, load, text, ACT, HOTFIX, PLAN, DO, SYNC, ev } from './fixtures.mjs';
export const id = 'release/T1151';
export const tests = ['release/A65'];
export const title = "release/A65 addresses release/F70 and states that no pull request code runs, equal to its draft";
export async function run() {
  const real = join(RM, '03-architecture/A65-raise-from-the-event/A65.md');
  assert.ok(existsSync(real), 'A65.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, draft('A65.md') + '\n', 'A65.md differs from the draft');
  assert.match(t, /addresses: \[release\/F70\]/);
  assert.match(t, /never checks out the pull request or its branch/);
}
