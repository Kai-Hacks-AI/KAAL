// Case release/T105 tests: I7
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T105';
export const tests = ['release/I7'];
export const title = 'I7 check PR Body is present';
export function run() {
  assert.ok(existsSync(join(repo, 'engineering/release-management/01-intent/I7-check-pr-body/I7.md')), 'I7 is absent');
}
