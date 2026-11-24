// Case release/T208 tests: F21
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T208';
export const tests = ['release/F21'];
export const title = 'the directory of new hooks exists and holds only installed copies of tested sources';

// A file of the directory is allowed when it is the README that states the rule, or a source copied unchanged.
export function judge(files, sources) {
  return files.every(({ name, text }) => name === 'README.md' || (name in sources && sources[name] === text));
}
export function run() {
  assert.equal(judge([{ name: 'README.md', text: 'x' }], {}), true);
  assert.equal(judge([{ name: '10-a', text: 'x' }], { '10-a': 'x' }), true);
  assert.equal(judge([{ name: '10-a', text: 'x' }], { '10-a': 'y' }), false, 'a changed copy is accepted');
  assert.equal(judge([{ name: '10-a', text: 'x' }], {}), false, 'a hook with no source is accepted');
  const dir = join(repo, '.githooks/new/pre-push.d');
  assert.ok(existsSync(dir), '.githooks/new/pre-push.d is absent');
  const src = join(repo, 'engineering/release-management/05-src/wiring/hooks');
  const sources = Object.fromEntries((existsSync(src) ? readdirSync(src) : []).map((n) => [n.replace(/-development$/, ''), readFileSync(join(src, n), 'utf8')]));
  const files = readdirSync(dir).map((name) => ({ name, text: readFileSync(join(dir, name), 'utf8') }));
  assert.ok(files.some((f) => f.name === 'README.md'), 'the README that states the rule is absent');
  assert.ok(judge(files, sources), 'a file of the directory is not an unchanged copy of a tested source');
}
