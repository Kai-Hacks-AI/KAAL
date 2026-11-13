// Case release/T184 tests: G49
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T184';
export const tests = ['release/G49'];
export const title = 'gap release/G49 is closed: F19 is present and F18 defers to it';
export function run() {
  read(join(cap, '02-requirements/F19-fallback-type/F19.md'), 'F19');
  assert.match(read(join(cap, '02-requirements/F18-fallback-interface/F18.md'), 'F18'), /release\/F19/);
}
