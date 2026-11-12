// Case release/T179 tests: G46
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const fallback = join(repo, '.github/pull_request_template.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = (text) => text.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
export const id = 'release/T179';
export const tests = ['release/G46'];
export const title = 'gap release/G46 is closed: F18 and the fallback template are present';
export function run() {
  read(join(cap, '02-requirements/F18-fallback-interface/F18.md'), 'F18');
  assert.deepEqual(headings(read(fallback, 'the fallback template')), ['Change', 'Because']);
}
