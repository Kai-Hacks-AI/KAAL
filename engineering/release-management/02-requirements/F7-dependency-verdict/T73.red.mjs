// Case release/T73 tests: F7
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T73';
export const tests = ['release/F7'];
export const title = 'the verdicts of Dependency Review are stated by dependency-verdict';
export function run() {
  const d = read(join(cap, '02-requirements/F7-dependency-verdict/F7.md'), 'F7');
  assert.ok(d.includes('PASS'), 'F7 does not state PASS');
  assert.ok(d.includes('FAIL'), 'F7 does not state FAIL');
  assert.ok(d.includes('UNKNOWN'), 'F7 does not state UNKNOWN');
  assert.ok(d.includes('UNKNOWN never passes'), 'F7 does not state UNKNOWN never passes');
}
