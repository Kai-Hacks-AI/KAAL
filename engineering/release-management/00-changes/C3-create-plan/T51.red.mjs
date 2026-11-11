// Case release/T51 tests: release/G13
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
export const id = 'release/T51';
export const tests = ['release/G13'];
export const title = 'gap release/G13 is closed: A14 and A15 are present and A15 holds the template feature';
export function run() {
  read(join(cap, '03-architecture/A14-create-plan/A14.md'), 'A14');
  read(join(a15, 'A15.md'), 'A15');
  assert.ok(existsSync(join(a15, 'A3-pr-templates/A3.md')), 'A3 does not sit under A15');
}
