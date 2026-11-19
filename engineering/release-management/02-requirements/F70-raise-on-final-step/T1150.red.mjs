// Case release/T1150 tests: release/F70
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM, draft, load, text, ACT, HOTFIX, PLAN, DO, WIRE, SYNC, ev } from '../../03-architecture/A65-raise-from-the-event/fixtures.mjs';
export const id = 'release/T1150';
export const tests = ['release/F70'];
export const title = "release/F70 serves release/I52 and states what a final step is, equal to its draft";
export async function run() {
  const real = join(RM, '02-requirements/F70-raise-on-final-step/F70.md');
  assert.ok(existsSync(real), 'F70.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, draft('F70.md') + '\n', 'F70.md differs from the draft');
  assert.match(t, /serves: \[release\/I52\]/);
  assert.match(t, /A PLAN, a DO, a SYNC/);
}
