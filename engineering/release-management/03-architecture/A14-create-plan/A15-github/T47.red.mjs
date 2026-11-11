// Case release/T47 tests: release/A15
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const template = join(repo, '.github/PULL_REQUEST_TEMPLATE/plan.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = () => read(template, 'the PLAN template').split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
const a15 = join(cap, '03-architecture/A14-create-plan/A15-github');
export const id = 'release/T47';
export const tests = ['release/A15'];
export const title = 'the template elements A3 and A4 sit under the GitHub target of create Plan';
export function run() {
  assert.ok(existsSync(join(a15, 'A3-pr-templates/A4-plan-template/A4.md')), 'A4 does not sit under A15');
}
