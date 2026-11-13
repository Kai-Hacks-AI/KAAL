// Case release/T53 tests: A16
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (p, what) => { assert.ok(existsSync(p), `${what} is absent`); return readFileSync(p, 'utf8'); };
const checker = join(cap, '05-src/plan-body/check.mjs');
export const id = 'release/T53';
export const tests = ['release/A16'];
export const title = 'the body contract is a module of create Plan on GitHub with its checker';
export function run() {
  const a16 = read(join(cap, '03-architecture/A14-create-plan/A15-github/A16-body-contract/A16.md'), 'A16');
  assert.match(a16, /parent: release\/A15/);
  assert.match(a16, /addresses: \[release\/F3\]/);
  assert.ok(existsSync(checker), 'the body checker is absent');
}
