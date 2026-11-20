// Case engineering/T1236 tests: engineering/A4
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
export const id = 'engineering/T1236';
export const tests = ['engineering/A4'];
export const title = 'the check is one script in the Skill that exports judgeLayout, reads the template from references and imports only Node';
export async function run() {
  present();
  const text = readFileSync(script, 'utf8');
  for (const m of text.matchAll(/^import .* from '([^']+)'/gm)) assert.ok(m[1].startsWith('node:'), `the check imports ${m[1]}, which is not Node's own`);
  const m = await import(script);
  assert.equal(typeof m.judgeLayout, 'function', 'judgeLayout is not exported');
  const template = JSON.parse(readFileSync(templatePath, 'utf8'));
  assert.equal(m.judgeLayout(template, GOOD).verdict, 'PASS');
  assert.equal(m.judgeLayout(null, GOOD).verdict, 'UNKNOWN');
}
