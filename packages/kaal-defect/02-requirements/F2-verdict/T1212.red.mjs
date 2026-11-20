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
export const title = 'known, fixed, unknown and unregistered state what the evidence shows; unknown and incomplete results are never known; no verdict makes the script fail';
const ctx = { 'a': { defects: ['x/D1'], register: [{ defect: 'x/D1', case: 'x/T1' }] }, 'b': { defects: ['y/D1'], register: [{ defect: 'y/D1', case: 'y/T1' }] } };
export async function run() {
  const known = check(fixture({ contexts: ctx, results: [{ case: 'x/T1', outcome: 'fail' }, { case: 'y/T1', outcome: 'fail' }] }));
  assert.equal(known.status, 0, known.stdout); assert.match(known.stdout, /^known x\/T1/m); assert.match(known.stdout, /^known y\/T1/m);
  const fixed = check(fixture({ contexts: ctx, results: [{ case: 'x/T1', outcome: 'pass' }, { case: 'y/T1', outcome: 'fail' }] }));
  assert.match(fixed.stdout, /fixed x\/T1/); assert.equal(fixed.status, 0, 'a verdict is evidence: the script does not fail on it');
  for (const outcome of ['unknown', 'skipped', 'error', 'timeout', 'incomplete']) {
    const r = check(fixture({ contexts: ctx, results: [{ case: 'x/T1', outcome }, { case: 'y/T1', outcome: 'fail' }] }));
    assert.match(r.stdout, /unknown x\/T1/, `${outcome} is never a proven known failure`);
    assert.doesNotMatch(r.stdout, /^known x\/T1/m, `${outcome} is not known`);
  }
  const missing = check(fixture({ contexts: ctx, results: [{ case: 'y/T1', outcome: 'fail' }] }));
  assert.match(missing.stdout, /unknown x\/T1/, 'no result is unknown, never a pass');
  const unregistered = check(fixture({ contexts: ctx, results: [{ case: 'x/T1', outcome: 'fail' }, { case: 'y/T1', outcome: 'fail' }, { case: 'z/T2', outcome: 'fail' }, { case: 'z/T3', outcome: 'unknown' }] }));
  assert.match(unregistered.stdout, /unregistered z\/T2/); assert.doesNotMatch(unregistered.stdout, /z\/T3/, 'an unknown unregistered Case is not a failure the mechanic reports');
}
