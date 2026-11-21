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
export const title = 'release/A74 is the judge of the demanded ACT and addresses release/F84; judgeDemandAct says FAIL naming the carried Changes that no retro reflects once the work is finished, and any more than one ACT (more than one retro that reflects the carried Changes, whatever the split), PASS when the work is not yet finished and at most one retro reflects them, or one retro reflects every Change, and UNKNOWN, never PASS, when it cannot be told';
export async function run() {
  const real = join(RM, '03-architecture/A74-judge-demand-act/A74.md');
  assert.ok(existsSync(real), 'A74.md is absent');
  assert.equal(readFileSync(real, 'utf8'), `${draft('A74.md')}\n`, 'A74.md differs from the draft');
  assert.ok(existsSync(SRC), 'judge-demand-act.mjs is absent');
  const { judgeDemandAct } = await import(pathToFileURL(SRC).href);
  const cases = [{ id: 'x/T1', parked: false }, { id: 'x/T2', parked: false }];
  const green = { 'x/T1': 'GREEN', 'x/T2': 'GREEN' };
  const change = (id, over = {}) => ({ id, applicable: cases, ...over });
  const retro = (...reflects) => ({ reflects });
  const r = (changes, retros, ...observed) => judgeDemandAct({ changes, retros, observed: observed.length ? observed[0] : green });
  // PASS: nothing is due
  assert.equal(r([], []).verdict, 'PASS', 'a promotion carrying no Change demands nothing');
  assert.equal(r([change('C1'), change('C2')], [retro('C1', 'C2')]).verdict, 'PASS', 'a finished collector with its retro');
  assert.equal(r([change('C1'), change('C2')], [retro('C1', 'C2', 'C9')]).verdict, 'PASS', 'the one ACT may reflect more than the collector carries');
  assert.equal(r([change('C1')], [retro('C1')], undefined).verdict, 'PASS', 'a Change with its retro needs no observation');
  assert.equal(r([change('C1')], [], { 'x/T1': 'GREEN', 'x/T2': 'RED' }).verdict, 'PASS', 'a collector still red owes no retro yet: that is not this control');
  assert.equal(r([change('C1', { applicable: [cases[0], { id: 'x/T2', parked: true }] })], []).verdict, 'PASS', 'a collector with a parked Case owes no retro yet');
  assert.equal(r([change('C1'), change('C2', { applicable: [{ id: 'x/T3', parked: false }] })], [], green).verdict, 'UNKNOWN', 'a Case that was not observed: is the work finished?');
  // FAIL: finished, a Change that no retro reflects
  let f = r([change('C1')], []);
  assert.equal(f.verdict, 'FAIL');
  assert.deepEqual(f.due, ['C1']);
  assert.ok(f.message.includes('C1') && f.message.includes('retro due'), 'the Change is not named');
  f = r([change('C1'), change('C2'), change('C3')], [retro('C2'), retro('C9')]);
  assert.equal(f.verdict, 'FAIL');
  assert.deepEqual(f.due, ['C1', 'C3'], 'every Change that is due is named, in order given; the retro of another Change reflects none of these');
  // the work of one Change is the work of the collector: all the Cases must be green before a retro is due
  assert.equal(r([change('C1'), change('C2', { applicable: [{ id: 'x/T3', parked: true }] })], [retro('C1')]).verdict, 'PASS', 'one Change still red: the collector is not finished');
  // the full set in one ACT: a retro that reflects some of the carried Changes leaves the rest due
  f = r([change('C1'), change('C2')], [retro('C1')]);
  assert.equal(f.verdict, 'FAIL', 'one retro that reflects only C1 does not close a collector that carries C1 and C2');
  assert.deepEqual(f.due, ['C2']);
  // FAIL at any time: one collector, one ACT; more than one retro reflects the carried Changes, whatever the split and whatever is red
  f = r([change('C1')], [retro('C1'), retro('C1', 'C2')], { 'x/T1': 'RED' });
  assert.equal(f.verdict, 'FAIL', 'two retros of one Change, whatever is red');
  assert.equal(f.acts, 2);
  assert.match(f.message, /more than one ACT for the collector: \[C1\] \[C1, C2\]/);
  f = r([change('C1'), change('C2')], [retro('C1'), retro('C2')]);
  assert.equal(f.verdict, 'FAIL', 'two retros, one for each Change, are not one ACT for the full set');
  assert.equal(f.acts, 2);
  assert.deepEqual(f.due, [], 'each Change is reflected: the fault is the number of ACTs');
  assert.equal(r([change('C1'), change('C2')], [retro('C1'), retro('C2')], { 'x/T1': 'RED' }).verdict, 'FAIL', 'two ACTs while the work is not finished');
  assert.equal(r([change('C1')], [retro('C1'), retro('C9')]).verdict, 'PASS', 'a retro that reflects no carried Change is not an ACT of this collector');
  // UNKNOWN: it cannot be told, and FAIL outranks it
  assert.equal(r([change('C1')], [], { 'x/T1': 'GREEN' }).verdict, 'UNKNOWN', 'an unobserved Case: is it finished?');
  assert.equal(r([change('C1')], [], undefined).verdict, 'UNKNOWN');
  assert.equal(r([change('C1', { applicable: [] })], []).verdict, 'UNKNOWN', 'no Case applies: nothing can be really green');
  assert.equal(r([change('C1'), change('C2')], [retro('C1', 'C2'), retro('C2')], undefined).verdict, 'FAIL', 'FAIL outranks UNKNOWN');
  assert.equal(r([change('C1'), change('C2')], [retro('C1')], undefined).verdict, 'UNKNOWN', 'one retro leaves C2 unreflected and it is not known whether the work is finished');
  for (const bad of [undefined, null, 'x', {}, [null], [{}], [{ id: '', applicable: [] }], [{ id: 5, applicable: [] }], [{ id: 'C1' }]]) assert.equal(r(bad, []).verdict, 'UNKNOWN', `changes ${JSON.stringify(bad)} must be UNKNOWN`);
  for (const bad of [undefined, null, 'RT1', [null], [{}], [{ reflects: 'C1' }], [{ reflects: [1] }]]) assert.equal(r([change('C1')], bad).verdict, 'UNKNOWN', `retros ${JSON.stringify(bad)} must be UNKNOWN`);
  for (const nothing of [undefined, null, 'x']) assert.equal(judgeDemandAct(nothing).verdict, 'UNKNOWN');
}
