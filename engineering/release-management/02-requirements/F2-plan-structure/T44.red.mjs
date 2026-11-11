// Case release/T44 tests: F2
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const template = join(repo, '.github/PULL_REQUEST_TEMPLATE/plan.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = () => read(template, 'the PLAN template').split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
export const id = 'release/T44';
export const tests = ['release/F2'];
export const title = 'the structure of a PLAN is stated by plan-structure';
export function run() {
  const f2 = read(join(cap, '02-requirements/F2-plan-structure/F2.md'), 'F2');
  for (const part of ['Change', 'Intent', 'Requirements', 'Architecture', 'Cases', 'red plan']) assert.ok(f2.includes(part), `F2 does not state ${part}`);
}
