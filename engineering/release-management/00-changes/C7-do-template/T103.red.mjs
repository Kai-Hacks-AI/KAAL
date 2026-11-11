// Case release/T103 tests: G32
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const doTemplate = join(repo, '.github/PULL_REQUEST_TEMPLATE/do.md');
const planTemplate = join(repo, '.github/PULL_REQUEST_TEMPLATE/plan.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = (text) => text.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
export const id = 'release/T103';
export const tests = ['release/G32'];
export const title = 'gap release/G32 is closed: F11 and the DO template are present';
export function run() {
  read(join(cap, '02-requirements/F11-do-interface/F11.md'), 'F11');
  assert.ok(existsSync(doTemplate), 'the DO template is absent');
}
