// Case engineering/T1245 tests: engineering/F58
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
const fixture = (files) => {
  const dir = mkdtempSync(join(tmpdir(), 'layout-'));
  for (const f of files) { mkdirSync(dirname(join(dir, f)), { recursive: true }); writeFileSync(join(dir, f), 'x\n'); }
  execFileSync('git', ['-C', dir, 'init', '-q']);
  execFileSync('git', ['-C', dir, 'add', '-A']);
  return dir;
};
const judge = (dir) => { assert.ok(existsSync(script), 'the check is absent'); const r = spawnSync(process.execPath, [script, templatePath, dir], { encoding: 'utf8' }); return { code: r.status, out: r.stdout.trim() }; };
const GOOD = ['AGENTS.md', 'README.md', 'package.json', '10-intent/intent/I1.md', '10-intent/test-cases/T1.test.mjs', '11-requirements/requirements/F1.md', '11-requirements/test-cases/T2.test.mjs', '12-architecture/architecture/A1.md', '12-architecture/test-cases/T3.test.mjs', '13-source/skill/SKILL.md', '13-source/scripts/x.mjs', '13-source/unit-tests/u.test.mjs', '14-operations/controls/CTL1/CTL1.md', '15-defects/defects/D1.md', '15-defects/test-cases/T4.test.mjs'];
export const id = 'engineering/T1245';
export const tests = ['engineering/F58'];
export const title = 'the template names 02-learnings with retros, research, rehearsals and reviews as its only children between 01-changes and 10-intent; the check accepts retros and names any other folder inside';
export async function run() {
  const t = template();
  const names = t.folders.map((f) => f.name);
  const l = t.folders.find((f) => f.name === '02-learnings');
  assert.ok(l, '02-learnings is absent');
  assert.deepEqual([...l.children].sort(), ['rehearsals', 'research', 'retros', 'reviews'], 'retros, research, rehearsals and reviews are not the only children');
  assert.equal(l.closed, true, 'learnings holds more than it names');
  assert.ok(names.indexOf('01-changes') < names.indexOf('02-learnings') && names.indexOf('02-learnings') < names.indexOf('10-intent'), 'learnings is not between changes and intent');
  assert.equal(judge(fixture([...GOOD, '02-learnings/retros/R1.md'])).code, 0, 'retros is not accepted');
  assert.equal(judge(fixture(GOOD)).code, 0, 'a package with no learnings folder is not PASS');
  const stray = judge(fixture([...GOOD, '02-learnings/retros/R1.md', '02-learnings/notes/n.md']));
  assert.equal(stray.code, 1);
  assert.match(stray.out, /02-learnings holds notes/);
}
