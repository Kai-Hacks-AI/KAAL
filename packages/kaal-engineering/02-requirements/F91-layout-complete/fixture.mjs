// The shared set-up of the Cases of engineering/F91: a capability folder as tracked files, and the check run over it.
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
export const pkg = join(root, 'packages/kaal-engineering');
export const script = join(pkg, 'skills/kaal-engineering/scripts/check-layout.mjs');
export const templatePath = join(pkg, 'skills/kaal-engineering/references/package-layout.json');
export const fixture = (files) => {
  const dir = mkdtempSync(join(tmpdir(), 'layout-'));
  for (const f of files) { mkdirSync(dirname(join(dir, f)), { recursive: true }); writeFileSync(join(dir, f), 'x\n'); }
  execFileSync('git', ['-C', dir, 'init', '-q']);
  execFileSync('git', ['-C', dir, 'add', '-A']);
  return dir;
};
export const judge = (dir, template = templatePath) => { assert.ok(existsSync(script), 'the check is absent'); const r = spawnSync(process.execPath, [script, template, dir], { encoding: 'utf8' }); return { code: r.status, out: r.stdout.trim() }; };
export const template = () => JSON.parse(readFileSync(templatePath, 'utf8'));
// A folder that is in the specification: the required root files and folders, nothing else.
export const GOOD = ['AGENTS.md', 'README.md', 'package.json', '10-intent/intent/I1.md', '10-intent/test-cases/T1.test.mjs', '11-requirements/requirements/F1.md', '11-requirements/test-cases/T2.test.mjs', '12-architecture/architecture/A1.md', '12-architecture/test-cases/T3.test.mjs', '13-source/skill/SKILL.md', '13-source/scripts/x.mjs', '13-source/unit-tests/u.test.mjs', '14-operations/controls/CTL1/CTL1.md'];
export const without = (prefix) => GOOD.filter((f) => !(f === prefix || f.startsWith(`${prefix}/`)));
// The findings of a run, one per `;`.
export const findings = (out) => out.replace(/^[A-Z]+:?\s*/, '').split(';').map((s) => s.trim()).filter(Boolean);
