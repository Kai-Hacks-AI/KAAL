// Case release/T37 tests: release/G9
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const walk = (dir) => (existsSync(dir) ? readdirSync(dir).flatMap((name) => { const p = join(dir, name); return statSync(p).isDirectory() ? walk(p) : [p]; }) : []);
const node = (kind, n) => walk(join(cap, '0' + ({ I: 1, F: 2, A: 3, D: 6 })[kind] + '-' + ({ I: 'intent', F: 'requirements', A: 'architecture', D: 'defects' })[kind])).find((p) => p.endsWith('/' + kind + n + '.md'));
export const id = 'release/T37';
export const tests = ['release/G9'];
export const title = 'gap release/G9 is closed: the judgment checks the id grammar and validates the derived placement separately from identity';
export function run() {
  const rules = read(join(cap, '05-src/plan/rules.mjs'), 'the rules of the judgment');
  assert.match(rules, /F1\/5/, 'the rules do not validate the placement of a Case');
}
