// Case defect/T1213 tests: defect/F3
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(root, 'packages/kaal-defect');
const skillFile = join(pkg, 'skills/kaal-defect/SKILL.md');
const script = join(pkg, 'skills/kaal-defect/scripts/known-defects.mjs');
const skill = () => { assert.ok(existsSync(skillFile), 'the Skill packages/kaal-defect/skills/kaal-defect/SKILL.md is absent'); return readFileSync(skillFile, 'utf8'); };
export const id = 'defect/T1213';
export const tests = ['defect/F3'];
function fixture({ defects = ["x/D1"], register, results, fix = {} }) {
  assert.ok(existsSync(script), "the script scripts/known-defects.mjs is absent");
  const d = mkdtempSync(join(tmpdir(), "known-"));
  mkdirSync(join(d, "x/14-defects"), { recursive: true });
  for (const i of defects) writeFileSync(join(d, "x/14-defects", i.split("/")[1] + ".md"), `---\nid: ${i}\nfound: ${i.split("/")[0]}\n${fix[i] ? `placed: ${fix[i]}\n` : ""}---\n# ${i}\n`);
  writeFileSync(join(d, "register.json"), JSON.stringify(register));
  writeFileSync(join(d, "results.json"), JSON.stringify(results));
  return d;
}
const check = (d, ...more) => spawnSync(process.execPath, [script, "--register", join(d, "register.json"), "--defects", d, "--results", join(d, "results.json"), ...more], { encoding: "utf8" });
export const title = 'the to-fix list groups by the placement Architecture set, and by where it was found until there is one';
export async function run() {
  const d = fixture({ defects: ['x/D1', 'x/D2'], fix: { 'x/D1': 'y' }, register: [{ defect: 'x/D1', case: 'x/T1' }, { defect: 'x/D2', case: 'x/T2' }], results: [] });
  const r = check(d, '--list');
  assert.equal(r.status, 0);
  assert.match(r.stdout, /^y: x\/D1$/m, 'found in x, placed in y');
  assert.match(r.stdout, /^x: x\/D2$/m, 'not placed: stays where it was found');
}
