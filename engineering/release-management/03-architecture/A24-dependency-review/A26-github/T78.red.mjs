// Case release/T78 tests: A26
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T78';
export const tests = ['release/A26'];
export const title = 'A26 applies the control at Integration IN and Promotion IN';
export function run() {
  const d = read(join(cap, '03-architecture/A24-dependency-review/A26-github/A26.md'), 'A26');
  assert.ok(d.includes('Integration IN'), 'A26 does not state Integration IN');
  assert.ok(d.includes('Promotion IN'), 'A26 does not state Promotion IN');
  assert.ok(d.includes('fails closed'), 'A26 does not state fails closed');
}
