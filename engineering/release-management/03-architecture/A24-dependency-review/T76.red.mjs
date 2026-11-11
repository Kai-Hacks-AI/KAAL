// Case release/T76 tests: A24
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T76';
export const tests = ['release/A24'];
export const title = 'A24 is the control and names its deployment target';
export function run() {
  const d = read(join(cap, '03-architecture/A24-dependency-review/A24.md'), 'A24');
  assert.ok(d.includes('release/A25'), 'A24 does not state release/A25');
  assert.ok(d.includes('release/A26'), 'A24 does not state release/A26');
  assert.ok(d.includes('Guard'), 'A24 does not state Guard');
}
