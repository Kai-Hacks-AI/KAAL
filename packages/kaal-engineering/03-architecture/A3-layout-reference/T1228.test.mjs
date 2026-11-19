// Case engineering/T1228 tests: engineering/A3
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
export const id = 'engineering/T1228';
export const tests = ['engineering/A3'];
export const title = 'the Skill links a page that exists beside its data, and the Engineer Skill checker still passes';
export async function run() {
  const skill = readFileSync(join(dir, 'SKILL.md'), 'utf8');
  const links = [...skill.matchAll(/\]\((references\/[^)]+)\)/g)].map((m) => m[1]);
  assert.ok(links.length >= 1, 'SKILL.md links no reference');
  for (const l of links) assert.ok(existsSync(join(dir, l)), `the linked ${l} does not exist`);
  assert.ok(existsSync(join(dir, 'references/package-layout.json')), 'the data is not beside the page');
  const r = spawnSync(process.execPath, [join(root, 'packages/kaal-engineer-skill/skills/kaal-engineer-skill/scripts/check-skill.mjs'), dir], { encoding: 'utf8' });
  assert.equal(r.status, 0, `check-skill found: ${r.stdout}${r.stderr}`);
}
