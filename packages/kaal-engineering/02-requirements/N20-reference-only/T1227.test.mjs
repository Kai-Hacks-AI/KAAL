// Case engineering/T1227 tests: engineering/N20
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(root, 'packages/kaal-engineering');
const dir = join(pkg, 'skills/kaal-engineering');
const template = () => { const f = join(dir, 'references/package-layout.json'); assert.ok(existsSync(f), 'the template references/package-layout.json is absent'); return JSON.parse(readFileSync(f, 'utf8')); };
const folder = (t, n) => t.folders.find((f) => f.name === n);
export const id = 'engineering/T1227';
export const tests = ['engineering/N20'];
export const title = 'the package still ships payload and skills only, has no script of the reference itself, and keeps the reference inside the Skill';
export async function run() {
  const p = JSON.parse(readFileSync(join(pkg, 'package.json'), 'utf8'));
  assert.deepEqual([...(p.files ?? [])].sort(), ['payload', 'skills']);
  assert.ok(!existsSync(join(dir, 'scripts')) || readdirSync(join(dir, 'scripts')).join() === 'check-layout.mjs', 'the Skill gained a script beyond the layout check');
  assert.ok(existsSync(join(dir, 'references/package-layout.json')), 'the template is not inside the Skill');
}
