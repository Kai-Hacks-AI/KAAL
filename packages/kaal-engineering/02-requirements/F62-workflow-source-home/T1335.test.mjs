// Case engineering/T1335 tests: engineering/F62
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
const fixture = (files) => {
  const dir = mkdtempSync(join(tmpdir(), 'layout-'));
  for (const f of files) { mkdirSync(dirname(join(dir, f)), { recursive: true }); writeFileSync(join(dir, f), 'x\n'); }
  execFileSync('git', ['-C', dir, 'init', '-q']);
  execFileSync('git', ['-C', dir, 'add', '-A']);
  return dir;
};
const judge = (dir) => { assert.ok(existsSync(script), 'the check is absent'); const r = spawnSync(process.execPath, [script, templatePath, dir], { encoding: 'utf8' }); return { code: r.status, out: r.stdout.trim() }; };
const GOOD = ['AGENTS.md', 'README.md', 'package.json', '10-intent/intent/I1.md', '10-intent/test-cases/T1.test.mjs', '11-requirements/requirements/F1.md', '11-requirements/test-cases/T2.test.mjs', '12-architecture/architecture/A1.md', '12-architecture/test-cases/T3.test.mjs', '13-source/skill/SKILL.md', '13-source/scripts/x.mjs', '13-source/unit-tests/u.test.mjs', '14-operations/controls/CTL1/CTL1.md', '15-defects/defects/D1.md', '15-defects/test-cases/T4.test.mjs'];
export const id = 'engineering/T1335';
export const tests = ['engineering/F62'];
export const title = 'workflows is a child of 13-source; the check accepts a workflow source beside the Skill and names any other folder in 13-source';
export async function run() {
  const s = JSON.parse(readFileSync(templatePath, 'utf8')).folders.find((f) => f.name === '13-source');
  assert.ok(s, '13-source is absent');
  assert.equal(s.closed, true, '13-source is no longer closed');
  assert.ok(s.children.includes('workflows'), 'workflows is not a child of 13-source');
  assert.equal(judge(fixture([...GOOD, '13-source/workflows/ci.yml'])).code, 0, 'a workflow source beside the Skill is not accepted');
  assert.equal(judge(fixture([...GOOD.filter((f) => !f.startsWith('13-source/')), '13-source/workflows/ci.yml', '13-source/unit-tests/u.test.mjs'])).code, 0, 'workflows without the Skill is not accepted');
  const other = judge(fixture([...GOOD, '13-source/pipelines/ci.yml']));
  assert.equal(other.code, 1, 'another folder in 13-source is not refused');
  assert.match(other.out, /13-source holds pipelines/);
}
