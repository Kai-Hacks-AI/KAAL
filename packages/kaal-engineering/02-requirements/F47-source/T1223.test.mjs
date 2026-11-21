// Case engineering/T1223 tests: engineering/F47
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
export const id = 'engineering/T1223';
export const tests = ['engineering/F47'];
export const title = 'the source holds skill, scripts, unit-tests and workflows, and the BASS steps sit on the entries that stand for them';
export async function run() {
  const t = template();
  const s = folder(t, '13-source');
  assert.deepEqual([...s.children].sort(), ['scripts', 'skill', 'unit-tests', 'workflows']);
  assert.equal(s.bass.skill, 'Agent to Skill');
  assert.equal(s.bass.scripts, 'Skill to Script');
  assert.equal(t.root.find((r) => r.name === 'AGENTS.md').bass, 'Bare to Agent');
}
