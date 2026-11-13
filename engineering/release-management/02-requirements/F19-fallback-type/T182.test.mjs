// Case release/T182 tests: F19
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T182';
export const tests = ['release/F19'];
export const title = 'DEFAULT is a TYPE: F19 names it, gives the title DEFAULT: <description>, and applies it only when no specialized TYPE fits';
export function run() {
  const text = read(join(cap, '02-requirements/F19-fallback-type/F19.md'), 'F19');
  assert.match(text, /DEFAULT is a TYPE/);
  assert.match(text, /DEFAULT: <meaningful description>/);
  assert.match(text, /only when no specialized TYPE fits/);
  assert.match(text, /KAAL-PR-template: DEFAULT/);
}
