// Case release/T53 tests: release/G15
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
export const id = 'release/T53';
export const tests = ['release/G15'];
export const title = 'gap release/G15 is closed: F1 cites F2 and states only the judgment';
export function run() {
  const f1 = read(join(cap, '02-requirements/F1-plan-pr/F1.md'), 'F1');
  assert.ok(f1.includes('release/F2'), 'F1 does not cite F2');
  assert.ok(!f1.includes('Every Change has at least one driver'), 'F1 still states the structure of a PLAN');
}
