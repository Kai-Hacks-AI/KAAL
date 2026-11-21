// Case engineering/T1331 tests: engineering/F59
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
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
export const id = 'engineering/T1331';
export const tests = ['engineering/F59'];
export const title = 'research has one place: a research folder inside 14-operations is named, and a package whose notes are in 02-learnings/research is PASS';
export async function run() {
  const inOps = judge(fixture([...GOOD, '14-operations/research/R1.md']));
  assert.equal(inOps.code, 1, 'research inside operations is not refused');
  assert.match(inOps.out, /14-operations holds research/);
  assert.equal(judge(fixture([...GOOD, '02-learnings/research/R1.md'])).code, 0, 'a package with its notes in learnings is not PASS');
}
