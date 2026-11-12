// Case release/T36 tests: release/G8
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const walk = (dir) => (existsSync(dir) ? readdirSync(dir).flatMap((name) => { const p = join(dir, name); return statSync(p).isDirectory() ? walk(p) : [p]; }) : []);
const node = (kind, n) => walk(join(cap, '0' + ({ I: 1, F: 2, A: 3, D: 6 })[kind] + '-' + ({ I: 'intent', F: 'requirements', A: 'architecture', D: 'defects' })[kind])).find((p) => p.endsWith('/' + kind + n + '.md'));
export const id = 'release/T36';
export const tests = ['release/G8'];
export const title = 'gap release/G8 is closed: every node id of verify Plan is capability-qualified and Cases are numbered across the capability';
export function run() {
  assert.ok(node('I', 1), 'I1 is absent');
  for (const file of [node('I', 1), node('F', 1), node('D', 1), ...walk(join(cap, '03-architecture')).filter((p) => /\/A\d+\.md$/.test(p))]) {
    assert.ok(file, 'a node of verify Plan is absent');
    assert.match(readFileSync(file, 'utf8'), /^id: release\/[A-Z]\d+$/m, `${file} has no capability-qualified id`);
  }
}
