// Case release/T82 tests: G22
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T82';
export const tests = ['release/G22'];
export const title = 'gap release/G22 is closed: Dependency Review is declared for its place';
export function run() {
  const d = read(join(repo, '.kaal/config/guard/Verify-Dependencies.md'), 'the Verify-Dependencies declaration');
  assert.match(d.split('---')[1] ?? '', /^runs: \[.*\bci\b.*\]$/m, 'the declaration does not run the check in ci');
}
