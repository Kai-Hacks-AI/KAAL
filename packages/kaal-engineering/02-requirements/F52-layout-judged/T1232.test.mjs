// Case engineering/T1232 tests: engineering/F52
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
export const id = 'engineering/T1232';
export const tests = ['engineering/F52'];
export const title = 'an element folder, or the source, without the folder that verifies it is FAIL and named';
export async function run() {
  for (const [folderName, drop] of [['10-intent', '10-intent/test-cases/'], ['11-requirements', '11-requirements/test-cases/'], ['12-architecture', '12-architecture/test-cases/'], ['13-source', '13-source/unit-tests/'], ['14-defects', '14-defects/test-cases/']]) {
    const r = judge(fixture(GOOD.filter((f) => !f.startsWith(drop))));
    assert.equal(r.code, 1, `${folderName} without its verifying folder is not FAIL`);
    assert.ok(r.out.includes(folderName), `${folderName} is not named`);
  }
  const absent = judge(fixture(GOOD.filter((f) => !f.startsWith('14-defects/'))));
  assert.equal(absent.code, 0, 'a folder the capability does not have is judged');
}
