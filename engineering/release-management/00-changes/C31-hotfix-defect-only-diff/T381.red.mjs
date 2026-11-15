// Case release/T381 tests: G66
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T381';
export const tests = ['release/G66'];
export const title = 'gap release/G66 is closed: F16 states that a Hotfix diff carries the Case of its defect and stays inside one capability root';

export function run() {
  const path = join(repo, 'engineering/release-management/02-requirements/F16-hotfix-interface/F16.md');
  assert.ok(existsSync(path), 'F16 is absent');
  const f16 = readFileSync(path, 'utf8');
  assert.match(f16, /diff carries the Case of its defect/, 'F16 does not state that the diff carries the Case of the defect');
  assert.match(f16, /one capability root/, 'F16 does not state that the diff stays inside one capability root');
}
