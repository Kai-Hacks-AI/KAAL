// Case release/T47 tests: A15
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const template = join(repo, '.github/PULL_REQUEST_TEMPLATE/plan.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = () => read(template, 'the PLAN template').split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
export const id = 'release/T47';
export const tests = ['release/A15'];
export const title = 'the GitHub target of create Plan is the PLAN pull request template';
export function run() {
  read(join(cap, '03-architecture/A14-create-plan/A15-github/A15.md'), 'A15');
  assert.ok(existsSync(template), 'the PLAN template is absent');
}
