// Case release/T94 tests: A30
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const act = join(repo, '.github/PULL_REQUEST_TEMPLATE/act.md');
const plan = join(repo, '.github/PULL_REQUEST_TEMPLATE/plan.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = (text) => text.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
export const id = 'release/T94';
export const tests = ['release/A30'];
export const title = 'the ACT template stands where GitHub offers it';
export function run() {
  assert.ok(existsSync(act), 'the ACT template is absent');
}
