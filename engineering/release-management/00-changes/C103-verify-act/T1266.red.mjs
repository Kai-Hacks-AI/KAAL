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
export const id = 'release/T1266';
export const tests = ['release/F80'];
export const title = 'the command line exits 0 when the DO pull requests made exactly the Cases in force green, and 1, naming them, for a deleted, renamed-back, edited, reverted-to-superseded or DO-retired Case, a candidate commit titled PLAN or an observed RED, and 2 when nothing could be judged';
export async function run() {
  assert.ok(existsSync(SRC), 'judge-act.mjs is absent');
  const f = fixture();
  const obs = join(f.root, '.obs.json');
  const cli = (headRef, observed, change = CHANGE, baseRef = f.done) => {
    if (observed !== undefined) writeFileSync(obs, JSON.stringify(observed)); else rmSync(obs, { force: true });
    return spawnSync(process.execPath, [SRC, '--root', f.root, '--base', baseRef, '--head', headRef, '--change', change, '--observed', obs], { encoding: 'utf8' });
  };
  try {
    const green = { T9002: 'GREEN', T9003: 'GREEN', T9004: 'GREEN' };
    const ok = cli(f.done, green);
    assert.equal(ok.status, 0, ok.stdout);
    assert.match(ok.stdout, /^PASS/);
    // T9001 was retired by the amendment: it is not required, so it is not named and does not need to exist.
    assert.equal(cli(f.done, { ...green, T9001: 'RED' }).status, 0, 'a retired Case must not be required');
    const bad = (r, id) => { assert.equal(r.status, 1, `${id}: ${r.stdout}`); assert.match(r.stdout, /finish your work first/); assert.ok(r.stdout.includes(id), `${id} is not named`); };
    bad(cli(f.done, { ...green, T9004: 'RED' }), 'T9004');
    // The candidate is a branch off the DO: each negative is a commit on it, read as Git data.
    const cand = (name, edit, msg = 'DO: sneaky') => { f.git('checkout', '-q', '-B', name, f.done); edit(); const sha = f.commit(msg); f.git('checkout', '-q', 'collector'); return sha; };
    bad(cli(cand('deleted', () => rmSync(join(f.root, F1, 'T9002.test.mjs'))), green), 'T9002');
    bad(cli(cand('retired', () => rmSync(join(f.root, F1, 'T9004.test.mjs'))), green), 'T9004');
    bad(cli(cand('backred', () => renameSync(join(f.root, F1, 'T9003.test.mjs'), join(f.root, F1, 'T9003.red.mjs'))), green), 'T9003');
    bad(cli(cand('edited', () => f.put(`${F1}/T9004.test.mjs`, CASE(9004, 'weakened'))), green), 'T9004');
    bad(cli(cand('superseded', () => f.put(`${F1}/T9003.test.mjs`, CASE(9003, 'v1'))), green), 'T9003');
    bad(cli(cand('mine', () => f.put(`${F1}/T9002.test.mjs`, CASE(9002, 'v1'))), green), 'T9002');
    // A DO already merged in the collector that weakened a Case: the ACT still fails, because only a PLAN changes what is in force.
    bad(cli(f.weak, green, CHANGE, f.weak), 'T9004');
    // A candidate commit titled PLAN changes nothing in force: the PLAN is read from the base.
    bad(cli(cand('titled', () => f.put(`${F1}/T9004.test.mjs`, CASE(9004, 'weakened')), 'PLAN: sneaky amendment'), green), 'T9004');
    // Nothing could be judged: no observation, an unknown or missing one, an unresolvable head, a Change without a PLAN.
    assert.equal(cli(f.done, undefined).status, 2, 'a missing observation passes or fails instead of UNKNOWN');
    assert.equal(cli(f.done, { ...green, T9003: 'UNKNOWN' }).status, 2);
    assert.equal(cli(f.done, { T9002: 'GREEN', T9003: 'GREEN' }).status, 2, 'a Case without evidence must be UNKNOWN');
    assert.equal(cli('no-such-ref', green).status, 2);
    assert.equal(cli(f.done, green, 'engineering/release-management/00-changes/C998-none').status, 2, 'a PLAN without Cases must not pass');
  } finally { f.clean(); }
}
