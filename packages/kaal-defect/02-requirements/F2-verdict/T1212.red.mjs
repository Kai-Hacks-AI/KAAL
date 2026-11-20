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
function fixture({ contexts, results = [] }) {
  assert.ok(existsSync(script), "the script scripts/known-defects.mjs is absent");
  const d = mkdtempSync(join(tmpdir(), "known-"));
  for (const [ctx, { defects = [], register = [], placed = {} }] of Object.entries(contexts)) {
    mkdirSync(join(d, ctx, "14-defects"), { recursive: true });
    for (const i of defects) writeFileSync(join(d, ctx, "14-defects", i.replace("/", "-") + ".md"), `---\nid: ${i}\n${placed[i] ? `placed: ${placed[i]}\n` : ""}---\n# ${i}\n`);
    writeFileSync(join(d, ctx, "14-defects", "known.json"), JSON.stringify(register));
  }
  writeFileSync(join(d, "results.json"), JSON.stringify(results));
  return d;
}
const check = (d, ...more) => spawnSync(process.execPath, [script, "--root", d, "--results", join(d, "results.json"), ...more], { encoding: "utf8" });
export const title = 'known passes, fixed blocks, unregistered fail blocks, a registered Case with no result is unknown and blocks, across every context';
const ctx = { 'a': { defects: ['x/D1'], register: [{ defect: 'x/D1', case: 'x/T1' }] }, 'b': { defects: ['y/D1'], register: [{ defect: 'y/D1', case: 'y/T1' }] } };
export async function run() {
  const known = check(fixture({ contexts: ctx, results: [{ case: 'x/T1', outcome: 'fail' }, { case: 'y/T1', outcome: 'fail' }] }));
  assert.equal(known.status, 0, known.stdout); assert.match(known.stdout, /known x\/T1/); assert.match(known.stdout, /known y\/T1/);
  const fixed = check(fixture({ contexts: ctx, results: [{ case: 'x/T1', outcome: 'pass' }, { case: 'y/T1', outcome: 'fail' }] }));
  assert.equal(fixed.status, 1, 'an unexpected GREEN fails'); assert.match(fixed.stdout, /fixed x\/T1/);
  const blocking = check(fixture({ contexts: ctx, results: [{ case: 'x/T1', outcome: 'fail' }, { case: 'y/T1', outcome: 'fail' }, { case: 'z/T2', outcome: 'fail' }] }));
  assert.equal(blocking.status, 1); assert.match(blocking.stdout, /blocking z\/T2/);
  const unknown = check(fixture({ contexts: ctx, results: [{ case: 'y/T1', outcome: 'fail' }] }));
  assert.equal(unknown.status, 1, 'no result is never a pass'); assert.match(unknown.stdout, /unknown x\/T1/);
}
