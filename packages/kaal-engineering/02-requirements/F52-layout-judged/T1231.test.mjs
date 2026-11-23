// Case engineering/T1231 tests: engineering/F52
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
const GOOD = ['AGENTS.md', 'README.md', 'package.json', '10-intent/intent/I1.md', '10-intent/test-cases/T1.test.mjs', '11-requirements/requirements/F1.md', '11-requirements/test-cases/T2.test.mjs', '12-architecture/architecture/A1.md', '12-architecture/test-cases/T3.test.mjs', '13-source/skill/SKILL.md', '13-source/scripts/x.mjs', '13-source/unit-tests/u.test.mjs', '14-operations/controls/CTL1/CTL1.md', '15-defects/defects/D1.md', '15-defects/test-cases/T4.test.mjs'];
export const id = 'engineering/T1231';
export const tests = ['engineering/F52'];
export const title = 'a numbered folder the template does not have, and only that, is FAIL and named';
export async function run() {
  const r = judge(fixture([...GOOD, '03-controls/c.md']));
  assert.equal(r.code, 1);
  assert.ok(r.out.includes('03-controls'), 'the stray numbered folder is not named');
  assert.equal(r.out.split(';').length, 1, 'more than the one fault is reported');
  const none = judge(fixture(['README.md', 'lib/x.mjs', 'capability/c.md']));
  assert.equal(none.code, 1, 'a folder with none of the layout is not FAIL');
  assert.match(none.out, /10-intent is missing/, 'what the folder lacks is not named');
  const other = judge(fixture([...GOOD, 'kaal/x.md']));
  assert.equal(other.code, 1, 'a folder that is not numbered is not judged (F91)');
  assert.match(other.out, /kaal is a folder the layout does not have/);
}
