// Case release/T86 tests: G26
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T86';
export const tests = ['release/G26'];
export const title = 'gap release/G26 is closed: the replay is present';
export function run() {
  read(join(cap, '00-changes/C5-analyze-vulnerabilities/replay.mjs'), 'the replay');
}
