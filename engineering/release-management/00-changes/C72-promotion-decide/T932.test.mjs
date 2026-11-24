// Case release/T932 tests: release/I39
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { repo, read } from './fixtures.mjs';
export const id = 'release/T932';
export const tests = ['release/I39'];
export const title = 'the Intent exists, and states that what raises a PROMOTION only raises';
export async function run() {
  const p = 'engineering/release-management/01-intent/I39-collector-promotion-raised/I39.md';
  assert.ok(existsSync(join(repo, p)), 'I39.md is absent');
  const t = read(p);
  assert.match(t, /^id: release\/I39$/m, 'the id is not release/I39');
  assert.ok(/never approves, merges, syncs or edits a branch/.test(t), 'the Intent does not say it only raises');
}
