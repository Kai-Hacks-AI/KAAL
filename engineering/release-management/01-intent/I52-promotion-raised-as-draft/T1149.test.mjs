// Case release/T1149 tests: release/I52
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM, draft, load, text, ACT, HOTFIX, PLAN, DO, WIRE, SYNC, ev } from '../../03-architecture/A65-raise-from-the-event/fixtures.mjs';
export const id = 'release/T1149';
export const tests = ['release/I52'];
export const title = "release/I52 states that the final step raises a draft and the Dispatcher never readies, approves or merges it";
export async function run() {
  const real = join(RM, '01-intent/I52-promotion-raised-as-draft/I52.md');
  assert.ok(existsSync(real), 'I52.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, draft('I52.md') + '\n', 'I52.md differs from the draft');
  assert.match(t, /as a draft/);
  assert.match(t, /never marks it ready, approves, merges, enables auto-merge, syncs or edits a branch/);
}
