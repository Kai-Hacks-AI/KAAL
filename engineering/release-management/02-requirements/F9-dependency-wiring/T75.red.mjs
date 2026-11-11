// Case release/T75 tests: F9
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T75';
export const tests = ['release/F9'];
export const title = 'the stable name and the binding limits are stated by dependency-wiring';
export function run() {
  const d = read(join(cap, '02-requirements/F9-dependency-wiring/F9.md'), 'F9');
  assert.ok(d.includes('stable'), 'F9 does not state stable');
  assert.ok(d.includes('merge group'), 'F9 does not state merge group');
  assert.ok(d.includes('guard Integration'), 'F9 does not state guard Integration');
}
