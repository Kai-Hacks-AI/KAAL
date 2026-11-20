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
function fixture({ contexts }) {
  assert.ok(existsSync(script), "the script scripts/known-defects.mjs is absent");
  const d = mkdtempSync(join(tmpdir(), "known-"));
  for (const [ctx, { defects = [], register = [], placed = {} }] of Object.entries(contexts)) {
    mkdirSync(join(d, ctx, "14-defects"), { recursive: true });
    for (const i of defects) writeFileSync(join(d, ctx, "14-defects", i.replace("/", "-") + ".md"), `---\nid: ${i}\n${placed[i] ? `placed: ${placed[i]}\n` : ""}---\n# ${i}\n`);
    writeFileSync(join(d, ctx, "14-defects", "known.json"), JSON.stringify(register));
  }
  return d;
}
const check = (d, ...more) => spawnSync(process.execPath, [script, "--root", d, ...more], { encoding: "utf8" });
export const title = 'a register sits in its context and an entry that points at no Defect in that folder is invalid';
export async function run() {
  const bad = check(fixture({ contexts: { 'a/b': { defects: ['x/D1'], register: [{ defect: 'x/D9', case: 'x/T1' }] } } }));
  assert.match(bad.stdout, /^invalid x\/D9 x\/T1$/m);
  const other = check(fixture({ contexts: { 'a/b': { register: [{ defect: 'x/D1', case: 'x/T1' }] }, 'c': { defects: ['x/D1'] } } }));
  assert.match(other.stdout, /^invalid x\/D1 x\/T1$/m, 'a Defect in another context does not satisfy the entry');
  const ok = check(fixture({ contexts: { 'a/b': { defects: ['x/D1'], register: [{ defect: 'x/D1', case: 'x/T1' }] } } }));
  assert.equal(ok.status, 0); assert.match(ok.stdout, /^link x\/D1 x\/T1$/m);
}
