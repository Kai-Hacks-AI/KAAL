// Case release/T176 tests: A41
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const fallback = join(repo, '.github/pull_request_template.md');
const typedDir = join(repo, '.github/PULL_REQUEST_TEMPLATE');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const typed = () => (existsSync(typedDir) ? readdirSync(typedDir).filter((name) => name.endsWith('.md')) : []);
export const id = 'release/T176';
export const tests = ['release/A41'];
export const title = 'the fallback coexists with the specialized templates and does not compete: it is outside their directory, shares none of their hints and names none of them or their TYPE';
export function run() {
  read(join(cap, '03-architecture/A41-fallback-template/A41.md'), 'A41');
  const text = read(fallback, 'the fallback template');
  assert.match(text, /PULL_REQUEST_TEMPLATE/, 'the fallback does not point to the directory of specialized templates');
  assert.ok(!fallback.startsWith(typedDir), 'the fallback stands inside the specialized directory');
  const hints = (body) => (body.match(/<!--[\s\S]*?-->/g) || []).map((hint) => hint.replace(/\s+/g, ' ').trim());
  for (const name of typed()) {
    const other = readFileSync(join(typedDir, name), 'utf8');
    const type = (/KAAL-PR-template:\s*([A-Z]+)/.exec(other) || [])[1] || name.replace(/\.md$/, '').toUpperCase();
    assert.ok(!hints(text).some((hint) => hints(other).includes(hint)), `the fallback shares a hint with ${name}`);
    assert.ok(!text.includes(name), `the fallback names the template ${name}`);
    assert.ok(!new RegExp(`\\b${type}\\b`).test(text), `the fallback names the type ${type}`);
  }
}
