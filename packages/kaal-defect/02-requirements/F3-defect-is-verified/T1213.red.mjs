// Case defect/T1213 tests: defect/F3
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const skillFile = join(root, 'packages/kaal-defect/skills/kaal-defect/SKILL.md');
const checkFile = join(root, 'packages/kaal-defect/skills/kaal-defect/scripts/check-defects.mjs');
const skill = () => { assert.ok(existsSync(skillFile), 'the Skill packages/kaal-defect/skills/kaal-defect/SKILL.md is absent'); return readFileSync(skillFile, 'utf8'); };
export const id = 'defect/T1213';
export const tests = ['defect/F3'];
export const title = 'the check reports unproven and invalid Defects, reads the Test Case side only, and exits 1 on either';
function tree(files) {
  const d = mkdtempSync(join(tmpdir(), 'defect-'));
  for (const [p, c] of Object.entries(files)) { mkdirSync(join(d, p, '..'), { recursive: true }); writeFileSync(join(d, p), c); }
  return d;
}
const rec = (i) => `---\nid: ${i}\n---\n# ${i}\n`;
const tc = (n, ids) => `export const tests = [${ids.map((x) => `'${x}'`).join(', ')}];\n`;
const check = (d) => { assert.ok(existsSync(checkFile), 'the check scripts/check-defects.mjs is absent'); return spawnSync(process.execPath, [checkFile, d], { encoding: 'utf8' }); };
export async function run() {
  const proven = check(tree({ 'x/D1-a.md': rec('x/D1'), 'x/T1.test.mjs': tc(1, ['x/D1']) }));
  assert.equal(proven.status, 0, `a Defect a Test Case names is proven: ${proven.stdout}`);
  assert.match(proven.stdout, /proven x\/D1/);
  const unproven = check(tree({ 'x/D1-a.md': rec('x/D1') }));
  assert.equal(unproven.status, 1, 'a Defect no Test Case names is unproven and the check exits 1');
  assert.match(unproven.stdout, /unproven x\/D1/);
  const invalid = check(tree({ 'x/D1-a.md': rec('D1'), 'x/T1.test.mjs': tc(1, ['D1']) }));
  assert.equal(invalid.status, 1, 'an id without a capability is invalid and the check exits 1');
  assert.match(invalid.stdout, /invalid D1/);
  const copy = check(tree({ 'x/D1-a.md': '---\nid: x/D1\ntests: ["x/T9"]\n---\n' }));
  assert.equal(copy.status, 1, 'a tests list on the Defect is not read: the Defect stays unproven');
}
