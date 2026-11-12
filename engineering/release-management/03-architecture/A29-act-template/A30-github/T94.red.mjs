// Case release/T94 tests: A30
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const act = join(repo, '.github/PULL_REQUEST_TEMPLATE/act.md');
export const id = 'release/T94';
export const tests = ['release/A30'];
export const title = 'the ACT template stands where GitHub offers it';
export function run() {
  assert.ok(existsSync(act), 'the ACT template is absent');
}
