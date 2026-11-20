// Case engineering/T1243 tests: engineering/F57
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
const template = () => { assert.ok(existsSync(templatePath), 'the template references/package-layout.json is absent'); return JSON.parse(readFileSync(templatePath, 'utf8')); };
const roleOf = (n) => n.replace(/^\d\d-/, '');
const fixture = (files) => {
  const dir = mkdtempSync(join(tmpdir(), 'layout-'));
  for (const f of files) { mkdirSync(dirname(join(dir, f)), { recursive: true }); writeFileSync(join(dir, f), 'x\n'); }
  execFileSync('git', ['-C', dir, 'init', '-q']);
  execFileSync('git', ['-C', dir, 'add', '-A']);
  return dir;
};
const judge = (dir) => { assert.ok(existsSync(script), 'the check is absent'); const r = spawnSync(process.execPath, [script, templatePath, dir], { encoding: 'utf8' }); return { code: r.status, out: r.stdout.trim() }; };
const BASE = ['AGENTS.md', 'README.md', 'package.json', '10-intent/intent/I1.md', '10-intent/test-cases/T1.test.mjs', '11-requirements/requirements/F1.md', '11-requirements/test-cases/T2.test.mjs', '12-architecture/architecture/A1.md', '12-architecture/test-cases/T3.test.mjs', '13-source/skill/SKILL.md', '13-source/scripts/x.mjs', '13-source/unit-tests/u.test.mjs', '15-defects/defects/D1.md', '15-defects/test-cases/T4.test.mjs'];
const GOOD = [...BASE, '14-operations/controls/CTL1/CTL1.md'];
export const id = 'engineering/T1243';
export const tests = ['engineering/F57'];
export const title = 'the new numbering is PASS with or without runs; the earlier numbering and a stray folder in operations or source are FAIL and named';
export async function run() {
  assert.equal(judge(fixture(GOOD)).code, 0, 'a correct setup is not PASS');
  assert.equal(judge(fixture([...GOOD, '14-operations/runs/r1.json'])).code, 0, 'runs is not accepted');
  assert.equal(judge(fixture(BASE)).code, 0, 'a package with no operations folder is not PASS');
  const bare = judge(fixture([...BASE, '14-operations/runs/r1.json']));
  assert.equal(bare.code, 1);
  assert.match(bare.out, /14-operations holds no controls/);
  const old = judge(fixture([...BASE, '02-controls/CTL1.md']));
  assert.equal(old.code, 1);
  assert.match(old.out, /02-controls/);
  const defects = judge(fixture([...GOOD, '14-defects/defects/D1.md']));
  assert.equal(defects.code, 1);
  assert.match(defects.out, /14-defects/);
  const stray = judge(fixture([...GOOD, '14-operations/notes/n.md']));
  assert.equal(stray.code, 1);
  assert.match(stray.out, /14-operations holds notes/);
  const source = judge(fixture([...GOOD, '13-source/extra/e.md']));
  assert.equal(source.code, 1);
  assert.match(source.out, /13-source holds extra/);
}
