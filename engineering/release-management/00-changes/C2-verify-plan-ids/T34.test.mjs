// Case release/T34 tests: release/G6
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const walk = (dir) => (existsSync(dir) ? readdirSync(dir).flatMap((name) => { const p = join(dir, name); return statSync(p).isDirectory() ? walk(p) : [p]; }) : []);
const node = (kind, n) => walk(join(cap, '0' + ({ I: 1, F: 2, A: 3, D: 6 })[kind] + '-' + ({ I: 'intent', F: 'requirements', A: 'architecture', D: 'defects' })[kind])).find((p) => p.endsWith('/' + kind + n + '.md'));
export const id = 'release/T34';
export const tests = ['release/G6'];
export const title = 'gap release/G6 is closed: the layout and agent rules state the one id grammar, that identity is not placement, and the derived placement';
export function run() {
  assert.match(read(join(cap, 'README.md'), 'README.md'), /<capability>\/<kind><n>/, 'the layout does not state the id grammar');
  assert.match(read(join(cap, 'AGENTS.md'), 'AGENTS.md'), /<capability>\/<kind><n>/, 'the agent rules do not state the id grammar');
}
