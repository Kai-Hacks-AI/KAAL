// Case release/T35 tests: release/G7
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const walk = (dir) => (existsSync(dir) ? readdirSync(dir).flatMap((name) => { const p = join(dir, name); return statSync(p).isDirectory() ? walk(p) : [p]; }) : []);
const node = (kind, n) => walk(join(cap, '0' + ({ I: 1, F: 2, A: 3, D: 6 })[kind] + '-' + ({ I: 'intent', F: 'requirements', A: 'architecture', D: 'defects' })[kind])).find((p) => p.endsWith('/' + kind + n + '.md'));
export const id = 'release/T35';
export const tests = ['release/G7'];
export const title = 'gap release/G7 is closed: F1 states the id form and the placement fallback';
export function run() {
  assert.ok(node('F', 1), 'F1 is absent');
  const text = read(node('F', 1), 'F1');
  assert.match(text, /<capability>\/<kind><n>/, 'F1 does not state the id form');
  assert.match(text, /capability itself/, 'F1 does not state the placement fallback');
}
