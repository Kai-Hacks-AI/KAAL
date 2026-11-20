// Case release/T1296 tests: release/A74, release/F84
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const CHECK = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs');
const SRC = join(RM, '05-src/phase/judge-demand-act.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C108-demand-act/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1296';
export const tests = ['release/A74', 'release/F84'];
export const title = 'release/A74 is the judge of the demanded ACT and addresses release/F84; judgeDemandAct says FAIL naming each carried Change that is really green and has no act.md, PASS when every Change has its ACT or is not yet finished, and UNKNOWN, never PASS, when it cannot be told';
export async function run() {
  const real = join(RM, '03-architecture/A74-judge-demand-act/A74.md');
  assert.ok(existsSync(real), 'A74.md is absent');
  assert.equal(readFileSync(real, 'utf8'), `${draft('A74.md')}\n`, 'A74.md differs from the draft');
  assert.ok(existsSync(SRC), 'judge-demand-act.mjs is absent');
  assert.equal(readFileSync(SRC, 'utf8'), `${draft('judge-demand-act.mjs')}\n`, 'judge-demand-act.mjs differs from the draft');
  const { judgeDemandAct } = await import(pathToFileURL(SRC).href);
  const cases = [{ id: 'x/T1', parked: false }, { id: 'x/T2', parked: false }];
  const green = { 'x/T1': 'GREEN', 'x/T2': 'GREEN' };
  const change = (dir, acted, over = {}) => ({ dir, acted, applicable: cases, observed: green, ...over });
  const r = (...changes) => judgeDemandAct({ changes });
  // PASS: nothing is due
  assert.equal(r().verdict, 'PASS', 'a promotion carrying no Change demands nothing');
  assert.equal(r(change('C1', true)).verdict, 'PASS', 'a finished Change with its ACT');
  assert.equal(r(change('C1', false, { observed: { 'x/T1': 'GREEN', 'x/T2': 'RED' } })).verdict, 'PASS', 'a Change still red owes no ACT yet: that is not this control');
  assert.equal(r(change('C1', false, { applicable: [cases[0], { id: 'x/T2', parked: true }] })).verdict, 'PASS', 'a Change with a parked Case owes no ACT yet');
  assert.equal(r(change('C1', true, { observed: undefined, applicable: undefined })).verdict, 'PASS', 'a Change with its ACT needs no observation');
  // FAIL: finished, no ACT
  const f = r(change('C1', false));
  assert.equal(f.verdict, 'FAIL');
  assert.deepEqual(f.due, ['C1']);
  assert.ok(f.message.includes('C1'), 'the Change is not named');
  const g = r(change('C2', false), change('C1', true), change('C3', false), change('C4', false, { observed: { 'x/T1': 'RED' } }));
  assert.equal(g.verdict, 'FAIL');
  assert.deepEqual(g.due, ['C2', 'C3'], 'every Change that is due is named, in order given');
  // UNKNOWN: it cannot be told whether the Change is finished or has its ACT, and FAIL outranks it
  assert.equal(r(change('C1', false, { observed: { 'x/T1': 'GREEN' } })).verdict, 'UNKNOWN', 'an unobserved Case: is it finished?');
  assert.equal(r(change('C1', false, { observed: undefined })).verdict, 'UNKNOWN');
  assert.equal(r(change('C1', false, { applicable: [] })).verdict, 'UNKNOWN', 'no Case applies: nothing can be really green');
  assert.equal(r(change('C1', false, { applicable: undefined })).verdict, 'UNKNOWN');
  for (const acted of [undefined, null, 'true', 1]) assert.equal(r(change('C1', acted)).verdict, 'UNKNOWN', `acted ${JSON.stringify(acted)} must be UNKNOWN`);
  assert.equal(r(change('C1', false), change('C2', false, { observed: undefined })).verdict, 'FAIL', 'FAIL outranks UNKNOWN');
  for (const bad of [undefined, null, 'x', {}, [null], [{}], [{ dir: '', acted: true }], [{ dir: 5, acted: true }]]) assert.equal(judgeDemandAct({ changes: bad }).verdict, 'UNKNOWN', `${JSON.stringify(bad)} must be UNKNOWN`);
  for (const nothing of [undefined, null, 'x']) assert.equal(judgeDemandAct(nothing).verdict, 'UNKNOWN');
}
