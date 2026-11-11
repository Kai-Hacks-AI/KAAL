// Case release/T96 tests: G29
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
export const id = 'release/T96';
export const tests = ['release/G29'];
export const title = 'gap release/G29 is closed: F10 and the ACT template are present';
export function run() {
  read(join(cap, '02-requirements/F10-act-interface/F10.md'), 'F10');
  assert.ok(existsSync(act), 'the ACT template is absent');
}
