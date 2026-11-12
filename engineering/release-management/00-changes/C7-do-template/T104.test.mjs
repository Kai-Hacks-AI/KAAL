// Case release/T104 tests: G33
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const doTemplate = join(repo, '.github/PULL_REQUEST_TEMPLATE/do.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T104';
export const tests = ['release/G33'];
export const title = 'gap release/G33 is closed: A31, A32 and the DO template are present';
export function run() {
  read(join(cap, '03-architecture/A31-do-template/A31.md'), 'A31');
  read(join(cap, '03-architecture/A31-do-template/A32-github/A32.md'), 'A32');
  assert.ok(existsSync(doTemplate), 'the DO template is absent');
}
