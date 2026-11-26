// Case release/T174 tests: F18. Amended in release/C138: the fallback declares nothing, since DEFAULT is not a TYPE (release/F19).
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const fallback = join(cap, '03-architecture/A41-fallback-template/fallback-template.md');
const typedDir = join(repo, '.github/PULL_REQUEST_TEMPLATE');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = (text) => text.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
const typed = () => (existsSync(typedDir) ? readdirSync(typedDir).filter((name) => name.endsWith('.md')) : []);
export const id = 'release/T174';
export const tests = ['release/F18'];
export const title = 'the fallback holds no declaration, no specialized template declares DEFAULT, and the chapters of the fallback equal those of no specialized template';
export function run() {
  assert.match(read(join(cap, '02-requirements/F18-fallback-interface/F18.md'), 'F18'), /release\/F19/);
  const text = read(fallback, 'the fallback template');
  assert.deepEqual(text.match(/<!--\s*KAAL-PR-template:[^>]*-->/g) || [], [], 'the fallback holds a declaration');
  const own = headings(text);
  assert.equal(own[0], 'Change', 'the fallback does not start with the shared Change chapter');
  for (const name of typed()) {
    const raw = readFileSync(join(typedDir, name), 'utf8');
    assert.ok(!/KAAL-PR-template:\s*DEFAULT\b/.test(raw), `${name} declares the fallback TYPE DEFAULT`);
    assert.notDeepEqual(own, headings(raw), `the fallback has the chapters of ${name}`);
  }
}
