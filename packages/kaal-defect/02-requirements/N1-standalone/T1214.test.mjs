// Case defect/T1214 tests: defect/N1
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync as lsDir } from 'node:fs';
import { dirname as parentOf } from 'node:path';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(root, 'packages/kaal-defect');
const skillFile = join(pkg, 'skills/kaal-defect/SKILL.md');
const script = join(pkg, 'skills/kaal-defect/scripts/known-defects.mjs');
const skill = () => { assert.ok(existsSync(skillFile), 'the Skill packages/kaal-defect/skills/kaal-defect/SKILL.md is absent'); const refs = join(parentOf(skillFile), 'references'); return [skillFile, ...(existsSync(refs) ? lsDir(refs).sort().map((f) => join(refs, f)) : [])].map((f) => readFileSync(f, 'utf8')).join('\n'); }; // the Skill is SKILL.md and its references/
export const id = 'defect/T1214';
export const tests = ['defect/N1'];

export const title = 'the package depends on nothing but Foundation and Hosting, the script imports only Node and those, and it runs no Case';
export async function run() {
  assert.ok(existsSync(join(pkg, 'package.json')), 'packages/kaal-defect/package.json is absent');
  const p = JSON.parse(readFileSync(join(pkg, 'package.json'), 'utf8'));
  const allowed = new Set(['@kaihacksai/kaal-foundation', '@kaihacksai/kaal-hosting']);
  for (const k of ['dependencies', 'peerDependencies', 'optionalDependencies']) for (const dep of Object.keys(p[k] ?? {})) assert.ok(allowed.has(dep), `depends on ${dep}`);
  assert.ok(existsSync(script), 'the script is absent');
  const src = readFileSync(script, 'utf8');
  for (const m of src.matchAll(/(?:from|import\()\s*['"]([^'"]+)['"]/g)) assert.ok(m[1].startsWith('node:') || allowed.has(m[1]), `the script imports ${m[1]}`);
  assert.ok(!/child_process|\bspawn|execSync|execFile|\bfork\(/.test(src), 'the script runs no process, so no Case');
}
