// Case release/T101 tests: A32
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const doTemplate = join(repo, '.github/PULL_REQUEST_TEMPLATE/do.md');
export const id = 'release/T101';
export const tests = ['release/A32'];
export const title = 'the DO template stands where GitHub offers it';
export function run() {
  assert.ok(existsSync(doTemplate), 'the DO template is absent');
}
