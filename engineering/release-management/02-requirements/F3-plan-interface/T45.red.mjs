// Case release/T45 tests: F3
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const template = join(repo, '.github/PULL_REQUEST_TEMPLATE/plan.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const sentence = () => read(template, 'the PLAN template').split('\n').filter((line) => line.includes('the plan to go from'));
export const id = 'release/T45';
export const tests = ['release/F3'];
export const title = 'the PLAN interface is one sentence: the plan to go from A to B because of X';
export function run() {
  assert.deepEqual(sentence(), ['<Change id>: the plan to go from <A> to <B>, because of <X>.']);
}
