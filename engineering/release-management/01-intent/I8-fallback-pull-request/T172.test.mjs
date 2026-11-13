// Case release/T172 tests: I8
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T172';
export const tests = ['release/I8'];
export const title = 'I8 fallback pull request is present';
export function run() {
  read(join(cap, '01-intent/I8-fallback-pull-request/I8.md'), 'I8');
}
