// Case release/T174 tests: F18
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const fallback = join(repo, '.github/pull_request_template.md');
const typedDir = join(repo, '.github/PULL_REQUEST_TEMPLATE');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = (text) => text.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
const typed = () => (existsSync(typedDir) ? readdirSync(typedDir).filter((name) => name.endsWith('.md')) : []);
export const id = 'release/T174';
export const tests = ['release/F18'];
export const title = 'the fallback is not a TYPE: it declares nothing, and its chapters equal those of no specialized template';
export function run() {
  assert.match(read(join(cap, '02-requirements/F18-fallback-interface/F18.md'), 'F18'), /not a TYPE/);
  const text = read(fallback, 'the fallback template');
  assert.ok(!/KAAL-PR-template/.test(text), 'the fallback carries a template declaration');
  const own = headings(text);
  assert.equal(own[0], 'Change', 'the fallback does not start with the shared Change chapter');
  for (const name of typed()) {
    const other = headings(readFileSync(join(typedDir, name), 'utf8'));
    assert.notDeepEqual(own, other, `the fallback has the chapters of ${name}`);
  }
}
