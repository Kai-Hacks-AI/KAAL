// Case engineering/T1221 tests: engineering/F45
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(root, 'packages/kaal-engineering');
const dir = join(pkg, 'skills/kaal-engineering');
const template = () => { const f = join(dir, 'references/package-layout.json'); assert.ok(existsSync(f), 'the template references/package-layout.json is absent'); return JSON.parse(readFileSync(f, 'utf8')); };
const folder = (t, n) => t.folders.find((f) => f.name === n);
export const id = 'engineering/T1221';
export const tests = ['engineering/F45'];
export const title = 'the template lists the root files and folders once each, in number order, for the three places';
export async function run() {
  const t = template();
  for (const f of ['AGENTS.md', 'README.md', 'LICENSE', 'package.json', '*.kaal.json']) assert.ok(t.root.some((r) => r.name === f), `the root file ${f} is absent`);
  const names = t.folders.map((f) => f.name);
  assert.equal(new Set(names).size, names.length, 'a folder is listed twice');
  const numbered = names.filter((n) => /^\d\d-/.test(n));
  assert.deepEqual(numbered, ['00-backlog', '01-changes', '02-learnings', '10-intent', '11-requirements', '12-architecture', '13-source', '14-operations', '15-defects']);
  assert.deepEqual([...numbered].sort(), numbered, 'the folders are not in number order');
  assert.ok(names.includes('dist'), 'dist is absent');
  assert.equal(t.places.length, 3, 'three places share the layout');
  for (const p of ['packages/', 'engineering/', '.kaal/']) assert.ok(t.places.some((x) => x.startsWith(p)), `the place ${p} is absent`);
}
