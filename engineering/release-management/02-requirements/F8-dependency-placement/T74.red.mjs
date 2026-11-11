// Case release/T74 tests: F8
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T74';
export const tests = ['release/F8'];
export const title = 'each of the four places says whether Dependency Review applies and how';
export function run() {
  const d = read(join(cap, '02-requirements/F8-dependency-placement/F8.md'), 'F8');
  for (const place of ['Development', 'Integration', 'Promotion', 'Publishing']) {
    const row = d.split('\n').find((l) => l.startsWith(`| ${place} |`));
    assert.ok(row, `F8 does not state ${place}`);
    assert.match(row, /\| (yes|no)[ ,|]/, `F8 does not say whether it applies at ${place}`);
    assert.ok(row.split('|').length >= 6, `F8 does not say how at ${place}`);
  }
}
