// Case release/T207 tests: G60
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T207';
export const tests = ['release/G60'];
export const title = 'gap release/G60 is closed: today\'s hook is kept as the legacy hook, without a changed byte, and still executable';

// The sha256 of `.githooks/pre-push` on `main` when this PLAN was written. The legacy hook is that file, moved.
export const legacy = 'df18ff0179e9a10ae340cd463d7012305c438b7148f0217348974b7ab56c8c06';
export function run() {
  const path = join(repo, '.githooks/old/pre-push');
  assert.ok(existsSync(path), '.githooks/old/pre-push is absent');
  assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'), legacy, 'the legacy hook differs from today\'s hook');
  assert.ok((statSync(path).mode & 0o111) !== 0, 'the legacy hook is not executable');
}
