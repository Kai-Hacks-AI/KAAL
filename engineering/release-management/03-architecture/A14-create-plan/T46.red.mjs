// Case release/T46 tests: release/A14
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
export const id = 'release/T46';
export const tests = ['release/A14'];
export const title = 'create Plan addresses the structure and the interface and is applied on GitHub through A15, which holds the template elements';
export function run() {
  const a14 = read(join(cap, '03-architecture/A14-create-plan/A14.md'), 'A14');
  assert.match(a14, /addresses: \[release\/F2, release\/F3\]/);
  assert.match(read(join(a15, 'A15.md'), 'A15'), /parent: release\/A14/);
  assert.ok(existsSync(join(a15, 'A3-pr-templates/A3.md')), 'A3 does not sit under A15');
}
