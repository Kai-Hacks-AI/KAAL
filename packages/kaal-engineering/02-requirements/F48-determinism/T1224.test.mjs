// Case engineering/T1224 tests: engineering/F48
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
export const id = 'engineering/T1224';
export const tests = ['engineering/F48'];
export const title = 'every entry is machinery or content, the deterministic set is three, and dist is generated and not committed';
export async function run() {
  const t = template();
  const kind = (n) => [...t.root, ...t.folders].find((e) => e.name === n)?.kind;
  for (const n of ['AGENTS.md', 'README.md', 'LICENSE', 'package.json', '*.kaal.json', '13-source', 'dist']) assert.equal(kind(n), 'machinery', `${n} is machinery`);
  for (const f of t.folders.filter((x) => /^(0\d|1[0-2]|14)-/.test(x.name))) assert.equal(f.kind, 'content', `${f.name} is content`);
  assert.deepEqual([...t.deterministic].sort(), ['scripts', 'test-cases', 'unit-tests']);
  const d = folder(t, 'dist');
  assert.equal(d.generated, true);
  assert.equal(d.committed, false);
  assert.equal(d.from, '13-source');
  assert.equal(t.rules.numbersOrderOnly, true);
}
