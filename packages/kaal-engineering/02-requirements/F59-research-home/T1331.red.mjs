// Case engineering/T1331 tests: engineering/F59
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
export const id = 'engineering/T1331';
export const tests = ['engineering/F59'];
export const title = 'the template names research and retros as the only children of 02-learnings; the check accepts research with anything inside it and names any other folder in 02-learnings';
export async function run() {
  const l = template().folders.find((f) => f.name === '02-learnings');
  assert.ok(l, '02-learnings is absent');
  assert.deepEqual([...l.children].sort(), ['research', 'retros'], 'research and retros are not the only children');
  assert.equal(l.closed, true, 'learnings holds more than it names');
  assert.equal(judge(fixture([...GOOD, '02-learnings/research/R1.md'])).code, 0, 'research alone is not accepted');
  assert.equal(judge(fixture([...GOOD, '02-learnings/research/R1.md', '02-learnings/retros/RT1.md'])).code, 0, 'research beside retros is not accepted');
  assert.equal(judge(fixture([...GOOD, '02-learnings/research/R1/R1.md', '02-learnings/research/R1/key.md'])).code, 0, 'what sits inside research is judged by the layout');
  assert.equal(judge(fixture([...GOOD, '02-learnings/research/inbound/R1.md', '02-learnings/research/own/R2.md'])).code, 0, 'a folder per direction inside research is judged by the layout');
  const stray = judge(fixture([...GOOD, '02-learnings/research/R1.md', '02-learnings/notes/n.md']));
  assert.equal(stray.code, 1);
  assert.match(stray.out, /02-learnings holds notes/);
}
