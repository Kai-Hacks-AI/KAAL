// Case release/T74 tests: F8
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T74';
export const tests = ['release/F8'];
export const title = 'the places of Dependency Review are stated by dependency-placement';
export function run() {
  const d = read(join(cap, '02-requirements/F8-dependency-placement/F8.md'), 'F8');
  assert.ok(d.includes('Development OUT'), 'F8 does not state Development OUT');
  assert.ok(d.includes('Integration IN'), 'F8 does not state Integration IN');
  assert.ok(d.includes('Promotion IN'), 'F8 does not state Promotion IN');
  assert.ok(d.includes('Integration OUT'), 'F8 does not state Integration OUT');
}
