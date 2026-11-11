// Case release/T83 tests: G23
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T83';
export const tests = ['release/G23'];
export const title = 'gap release/G23 is closed: a merge group reports the check';
export function run() {
  const dir = join(repo, '.github/workflows');
  const files = existsSync(dir) ? readdirSync(dir) : [];
  const hit = files.filter((f) => { const s = readFileSync(join(dir, f), 'utf8'); return /merge_group/.test(s) && /name: (Dependency Review|Verify Dependencies)\s*$/m.test(s); });
  assert.ok(hit.length > 0, 'no workflow reports the Dependency Review name for a merge group');
}
