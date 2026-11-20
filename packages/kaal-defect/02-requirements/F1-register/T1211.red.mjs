// Case defect/T1211 tests: defect/F1
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
export const id = 'defect/T1211';
export const tests = ['defect/F1'];
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
export const title = 'an entry that points at no existing Defect is invalid and blocks; one that does is judged';
export async function run() {
  const bad = check(fixture({ register: [{ defect: 'x/D9', case: 'x/T1' }], results: [{ case: 'x/T1', outcome: 'fail' }] }));
  assert.equal(bad.status, 1, 'an entry with no Defect blocks');
  assert.match(bad.stdout, /invalid x\/T1/);
  const ok = check(fixture({ register: [{ defect: 'x/D1', case: 'x/T1' }], results: [{ case: 'x/T1', outcome: 'fail' }] }));
  assert.equal(ok.status, 0, `an entry with a Defect is judged: ${ok.stdout}`);
}
