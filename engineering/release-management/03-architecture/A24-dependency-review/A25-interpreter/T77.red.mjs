// Case release/T77 tests: A25
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T77';
export const tests = ['release/A25'];
export const title = 'A25 is the one interpreter';
export function run() {
  const d = read(join(cap, '03-architecture/A24-dependency-review/A25-interpreter/A25.md'), 'A25');
  assert.ok(d.includes('No adapter restates'), 'A25 does not state No adapter restates');
}
