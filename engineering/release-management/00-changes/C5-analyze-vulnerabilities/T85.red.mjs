// Case release/T85 tests: G25
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T85';
export const tests = ['release/G25'];
export const title = 'gap release/G25 is closed: the old workflow is gone';
export function run() {
  assert.ok(!existsSync(join(repo, '.github/workflows/dependency-review.yml')), 'dependency-review.yml is still present');
}
