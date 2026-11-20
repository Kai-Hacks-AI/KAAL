// Case release/T942 tests: release/I40
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { repo, read } from './fixtures.mjs';
export const id = 'release/T942';
export const tests = ['release/I40'];
export const title = 'the Intent exists, and states that the Dispatcher only raises and that the job holding its token reads no collector';
export async function run() {
  const p = 'engineering/release-management/01-intent/I40-dispatcher-only-raises/I40.md';
  assert.ok(existsSync(join(repo, p)), 'I40.md is absent');
  const t = read(join(repo, p));
  assert.match(t, /^id: release\/I40$/m, 'the id is not release/I40');
  assert.ok(/never approves, merges, enables auto-merge, pushes or edits a branch/.test(t), 'the Intent does not say it only raises');
  assert.ok(/reads no collector/.test(t), 'the Intent does not keep the token away from the collectors');
}
