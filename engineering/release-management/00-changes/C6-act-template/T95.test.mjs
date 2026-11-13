// Case release/T95 tests: G28
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T95';
export const tests = ['release/G28'];
export const title = 'gap release/G28 is closed: I5 is present';
export function run() {
  read(join(cap, '01-intent/I5-act-pull-request/I5.md'), 'I5');
}
