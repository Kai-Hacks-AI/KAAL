// Case release/T50 tests: G12
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const template = join(repo, '.github/PULL_REQUEST_TEMPLATE/plan.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = () => read(template, 'the PLAN template').split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
export const id = 'release/T50';
export const tests = ['release/G12'];
export const title = 'gap release/G12 is closed: F3 is present and the template has its five sections';
export function run() {
  read(join(cap, '02-requirements/F3-plan-interface/F3.md'), 'F3');
  assert.deepEqual(headings(), ['Change', 'Intent', 'Requirements', 'Architecture', 'Cases']);
}
