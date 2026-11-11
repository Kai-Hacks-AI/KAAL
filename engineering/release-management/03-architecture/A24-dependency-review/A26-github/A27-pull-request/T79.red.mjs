// Case release/T79 tests: A27
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T79';
export const tests = ['release/A27'];
export const title = 'A27 applies the control to a pull request';
export function run() {
  const d = read(join(cap, '03-architecture/A24-dependency-review/A26-github/A27-pull-request/A27.md'), 'A27');
  assert.ok(d.includes('pull request'), 'A27 does not state pull request');
  assert.ok(d.includes('read-only'), 'A27 does not state read-only');
}
