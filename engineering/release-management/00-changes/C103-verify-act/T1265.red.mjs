// Case release/T1265 tests: release/A71
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const SRC = join(RM, '05-src/phase/judge-act.mjs');
const load = () => import(pathToFileURL(SRC).href);
const draft = (name) => readFileSync(join(RM, '00-changes/C103-verify-act/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
// A collector made in a scratch repository: main, a PLAN adding three RED Cases, a SYNC from main, a first DO, a PLAN amendment that adds, changes and
// retires Cases (one of them already moved by the DO), and two more DO pull requests, as squash commits whose subjects are the pull request titles.
const CHANGE = 'engineering/release-management/00-changes/C999-demo';
const F1 = 'engineering/release-management/02-requirements/F1-x';
const CASE = (n, v = 'v1') => `export const id = 'x/T${n}';\nexport const tests = [];\nexport const title = 't';\nexport async function run() { /* ${v} */ }\n`;
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'c103-'));
  const git = (...a) => execFileSync('git', ['-C', root, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { encoding: 'utf8' });
  const put = (p, t) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), t); };
  const commit = (m) => { git('add', '-A'); git('commit', '-q', '-m', m); return git('rev-parse', 'HEAD').trim(); };
  const mv = (a, b) => { mkdirSync(dirname(join(root, b)), { recursive: true }); git('mv', a, b); };
  git('init', '-q', '-b', 'main');
  put('README.md', 'x\n'); commit('main');
  git('checkout', '-q', '-b', 'collector');
  put(`${CHANGE}/C999.md`, '# plan 1\n');
  for (const n of [9001, 9002, 9003]) put(`${CHANGE}/T${n}.red.mjs`, CASE(n));
  const plan1 = commit('PLAN: first (#1)');
  git('checkout', '-q', 'main'); put('later.md', 'y\n'); commit('main moves');
  git('checkout', '-q', 'collector'); git('merge', '-q', '--no-ff', '-m', 'SYNC: main', 'main');
  mv(`${CHANGE}/T9002.red.mjs`, `${F1}/T9002.test.mjs`);
  const do1 = commit('DO: first (#2)');
  // The amendment: retire T9001, change T9003 (still red) and T9002 (already moved and green), add T9004.
  put(`${CHANGE}/C999.md`, '# plan 2\n');
  git('rm', '-q', `${CHANGE}/T9001.red.mjs`);
  put(`${CHANGE}/T9003.red.mjs`, CASE(9003, 'v2'));
  put(`${F1}/T9002.test.mjs`, CASE(9002, 'v2'));
  put(`${CHANGE}/T9004.red.mjs`, CASE(9004));
  const plan2 = commit('PLAN: amendment (#3)');
  mv(`${CHANGE}/T9003.red.mjs`, `${F1}/T9003.test.mjs`);
  const do2 = commit('DO: second (#4)');
  mv(`${CHANGE}/T9004.red.mjs`, `${F1}/T9004.test.mjs`);
  put(`${F1}/T9005.test.mjs`, CASE(9005));
  const done = commit('DO: third (#5)');
  // A DO that weakens a Case, merged into the collector: it changes nothing that is in force, and the Case at the head is no longer that Case.
  put(`${F1}/T9004.test.mjs`, CASE(9004, 'weakened'));
  put(`${CHANGE}/do.md`, '# do\n');
  const weak = commit('DO: weaken (#6)');
  git('checkout', '-q', 'collector');
  return { root, git, put, commit, plan1, do1, plan2, do2, done, weak, clean: () => rmSync(root, { recursive: true, force: true }) };
}
export const id = 'release/T1265';
export const tests = ['release/A71'];
export const title = 'plannedCases folds the PLAN pull requests of a Change in order, so a PLAN amendment adds, changes and retires Cases, a DO and a SYNC change nothing in force, and headCases finds the Cases wherever the DO put them';
export async function run() {
  assert.ok(existsSync(SRC), 'judge-act.mjs is absent');
  const { plannedCases, headCases } = await load();
  const f = fixture();
  try {
    const ids = (list) => list.map((c) => c.id);
    const first = plannedCases(f.root, f.plan1, CHANGE);
    assert.deepEqual(ids(first), ['T9001', 'T9002', 'T9003'], 'the first PLAN');
    // The DO and the SYNC change nothing that is in force.
    assert.deepEqual(plannedCases(f.root, f.do1, CHANGE), first);
    // The amendment retires T9001, adds T9004 and gives T9002 and T9003 new content, the one in a moved file included.
    const cumulative = plannedCases(f.root, f.plan2, CHANGE);
    assert.deepEqual(ids(cumulative), ['T9002', 'T9003', 'T9004'], 'the amended PLAN');
    const by = (list, id) => list.find((c) => c.id === id).fingerprint;
    assert.notEqual(by(cumulative, 'T9002'), by(first, 'T9002'), 'a changed Case has a new fingerprint');
    assert.notEqual(by(cumulative, 'T9003'), by(first, 'T9003'));
    // Later DO pull requests change nothing in force, and the planned set is the same read at any later base.
    assert.deepEqual(plannedCases(f.root, f.do2, CHANGE), cumulative);
    assert.deepEqual(plannedCases(f.root, f.done, CHANGE), cumulative);
    assert.deepEqual(plannedCases(f.root, f.weak, CHANGE), cumulative, 'a DO that weakens a Case must not change what is in force');
    assert.notEqual(headCases(f.root, f.weak).T9004.fingerprint, by(cumulative, 'T9004'), 'the weakened Case is not the Case in force');
    assert.deepEqual(plannedCases(f.root, f.done, 'engineering/release-management/00-changes/C998-none'), [], 'a folder with no PLAN has nothing in force');
    // The head, wherever the DO moved the Cases.
    const h = headCases(f.root, f.done);
    assert.equal(h.T9004.path, `${F1}/T9004.test.mjs`);
    assert.ok(h.T9002.green && h.T9003.green && h.T9004.green);
    assert.equal(h.T9004.fingerprint, by(cumulative, 'T9004'), 'the renamed Case is the same Case');
    assert.equal(h.T9002.fingerprint, by(cumulative, 'T9002'), 'the amended content of a moved Case is the one in force');
    assert.ok(h.T9005, 'a Case no PLAN put in force is listed too');
    assert.equal(headCases(f.root, f.plan1).T9001.green, false, 'a .red.mjs is not green');
  } finally { f.clean(); }
}
