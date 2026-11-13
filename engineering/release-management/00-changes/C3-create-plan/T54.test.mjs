// Case release/T54 tests: G14
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (p, what) => { assert.ok(existsSync(p), `${what} is absent`); return readFileSync(p, 'utf8'); };
const checker = join(cap, '05-src/plan-body/check.mjs');
export const id = 'release/T54';
export const tests = ['release/G14'];
export const title = 'gap release/G14 is closed: A16 and its checker are present';
export function run() {
  read(join(cap, '03-architecture/A14-create-plan/A15-github/A16-body-contract/A16.md'), 'A16');
  assert.ok(existsSync(checker), 'the body checker is absent');
}
