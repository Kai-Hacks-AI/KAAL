// Case release/T80 tests: A28
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T80';
export const tests = ['release/A28'];
export const title = 'A28 applies the control to a merge group';
export function run() {
  const d = read(join(cap, '03-architecture/A24-analyze-vulnerabilities/A26-github/A28-merge-group/A28.md'), 'A28');
  assert.ok(d.includes('merge group'), 'A28 does not state merge group');
  assert.ok(d.includes('scratch target'), 'A28 does not state scratch target');
}
