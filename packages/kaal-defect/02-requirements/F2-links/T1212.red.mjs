// Case defect/T1212 tests: defect/F2
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
export const id = 'defect/T1212';
export const tests = ['defect/F2'];
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
export const title = 'the mechanic gives each Defect its linked Test Cases, several per Defect, across contexts, for Testing to observe';
export async function run() {
  const d = fixture({ contexts: { 'a': { defects: ['x/D1'], register: [{ defect: 'x/D1', case: 'x/T1' }, { defect: 'x/D1', case: 'x/T2' }] }, 'b': { defects: ['y/D1'], register: [{ defect: 'y/D1', case: 'y/T1' }] } } });
  const r = check(d);
  assert.equal(r.status, 0);
  for (const l of ['link x/D1 x/T1', 'link x/D1 x/T2', 'link y/D1 y/T1']) assert.ok(r.stdout.split('\n').includes(l), `missing: ${l}`);
}
