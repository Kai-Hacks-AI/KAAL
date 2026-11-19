// Case engineering/T1237 tests: engineering/CTL2
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(root, 'packages/kaal-engineering');
const script = join(pkg, 'skills/kaal-engineering/scripts/check-layout.mjs');
const templatePath = join(pkg, 'skills/kaal-engineering/references/package-layout.json');
const present = () => assert.ok(existsSync(script), 'the check skills/kaal-engineering/scripts/check-layout.mjs is absent');
// A scratch capability folder: a git repository holding exactly these files, all tracked.
const fixture = (files) => {
  const dir = mkdtempSync(join(tmpdir(), 'layout-'));
  for (const f of files) { mkdirSync(dirname(join(dir, f)), { recursive: true }); writeFileSync(join(dir, f), 'x\n'); }
  execFileSync('git', ['-C', dir, 'init', '-q']);
  execFileSync('git', ['-C', dir, 'add', '-A']);
  return dir;
};
const judge = (dir, template = templatePath) => { present(); const r = spawnSync(process.execPath, [script, template, dir], { encoding: 'utf8' }); return { code: r.status, out: r.stdout.trim() }; };
const GOOD = ['AGENTS.md', 'README.md', 'package.json', '10-intent/intent/I1.md', '10-intent/test-cases/T1.test.mjs', '11-requirements/requirements/F1.md', '11-requirements/test-cases/T2.test.mjs', '12-architecture/architecture/A1.md', '12-architecture/test-cases/T3.test.mjs', '13-source/skill/SKILL.md', '13-source/scripts/x.mjs', '13-source/unit-tests/u.test.mjs', '14-defects/defects/D1.md', '14-defects/test-cases/T4.test.mjs'];
export const id = 'engineering/T1237';
export const tests = ['engineering/CTL2'];
export const title = 'the control is listed as detective with Intent I4 and its evidence declaration is accepted by the controls checker';
export async function run() {
  const FINDER = join(root, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
  const CHECK = join(root, 'packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs');
  const area = join(root, 'packages/02-controls');
  const file = join(area, 'CTL2-verify-layout/CTL2.md');
  assert.ok(existsSync(file), 'CTL2.md is absent');
  assert.match(readFileSync(file, 'utf8'), /^evidence: \[fixture:2, real:1, provoked:1:fail\]$/m);
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, area], { encoding: 'utf8' }));
  const c = out.controls.find((x) => x.id === 'engineering/CTL2');
  assert.ok(c, 'engineering/CTL2 is not listed');
  assert.equal(c.type, 'detective');
  assert.deepEqual(c.has, ['engineering/I4']);
  assert.deepEqual(out.refused, []);
  const chk = spawnSync(process.execPath, [CHECK, area], { encoding: 'utf8' });
  assert.doesNotMatch(chk.stdout + chk.stderr, /CTL2[^\n]*(invalid|evidence)/i, 'the controls checker rejects the declaration');
}
