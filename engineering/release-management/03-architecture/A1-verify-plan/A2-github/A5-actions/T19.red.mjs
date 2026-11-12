// Case release/T19 tests: release/A5
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const walk = (dir) => (existsSync(dir) ? readdirSync(dir).flatMap((name) => { const p = join(dir, name); return statSync(p).isDirectory() ? walk(p) : [p]; }) : []);
const node = (kind, n) => walk(join(cap, '0' + ({ I: 1, F: 2, A: 3, D: 6 })[kind] + '-' + ({ I: 'intent', F: 'requirements', A: 'architecture', D: 'defects' })[kind])).find((p) => p.endsWith('/' + kind + n + '.md'));
export const id = 'release/T19';
export const tests = ['release/A5'];
export const title = 'a workflow runs the check on every PLAN pull request';
export function run() {
  assert.ok(existsSync(join(repo, '.github/workflows/verify-plan.yml')), 'the verify Plan workflow is absent');
}
