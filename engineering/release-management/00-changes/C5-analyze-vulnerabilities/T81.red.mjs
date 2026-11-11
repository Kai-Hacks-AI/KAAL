// Case release/T81 tests: G21
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T81';
export const tests = ['release/G21'];
export const title = 'gap release/G21 is closed: I4 is present';
export function run() {
  read(join(cap, '01-intent/I4-analyze-vulnerabilities/I4.md'), 'I4');
}
