// Case release/T102 tests: G31
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const doTemplate = join(repo, '.github/PULL_REQUEST_TEMPLATE/do.md');
const planTemplate = join(repo, '.github/PULL_REQUEST_TEMPLATE/plan.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = (text) => text.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
export const id = 'release/T102';
export const tests = ['release/G31'];
export const title = 'gap release/G31 is closed: I6 is present';
export function run() {
  read(join(cap, '01-intent/I6-do-pull-request/I6.md'), 'I6');
}
