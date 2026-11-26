// Case release/T182 tests: F19. Amended in release/C138: DEFAULT is not a TYPE, it is an invalid route (the Owner and the CPO, 26 Nov).
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T182';
export const tests = ['release/F19'];
export const title = 'DEFAULT is not a TYPE: F19 names it an invalid route, a finding with its own reason, never registered, never a pass, and no template declares it';
export function run() {
  const text = read(join(cap, '02-requirements/F19-fallback-type/F19.md'), 'F19');
  assert.match(text, /DEFAULT is not a TYPE/);
  assert.match(text, /invalid route/);
  assert.match(text, /engineering\/C37|pull-request-types/, 'F19 does not point to the file that names DEFAULT invalid');
  assert.doesNotMatch(text, /DEFAULT is a TYPE/, 'F19 still says DEFAULT is a TYPE');
  assert.doesNotMatch(text, /KAAL-PR-template: DEFAULT/, 'F19 still has a template declare DEFAULT');
}
