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
// A collector made in a scratch repository: main, a PLAN that adds two RED Cases, a SYNC from main, a DO that turns them GREEN.
const CHANGE = 'engineering/release-management/00-changes/C999-demo';
const CASE = (n, body = 'ok') => `export const id = 'x/T${n}';\nexport const tests = [];\nexport const title = 't';\nexport async function run() { /* ${body} */ }\n`;
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'c103-'));
  const git = (...a) => execFileSync('git', ['-C', root, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { encoding: 'utf8' });
  const put = (p, t) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), t); };
  git('init', '-q', '-b', 'main');
  put('README.md', 'x\n'); git('add', '-A'); git('commit', '-q', '-m', 'main');
  git('checkout', '-q', '-b', 'collector');
  put(`${CHANGE}/C999.md`, '# plan\n'); put(`${CHANGE}/T9001.red.mjs`, CASE(9001)); put(`${CHANGE}/T9002.red.mjs`, CASE(9002));
  git('add', '-A'); git('commit', '-q', '-m', 'PLAN');
  const plan = git('rev-parse', 'HEAD').trim();
  git('checkout', '-q', 'main'); put('later.md', 'y\n'); git('add', '-A'); git('commit', '-q', '-m', 'main moves');
  git('checkout', '-q', 'collector'); git('merge', '-q', '--no-ff', '-m', 'SYNC', 'main');
  mkdirSync(join(root, 'engineering/release-management/02-requirements/F1-x'), { recursive: true });
  git('mv', `${CHANGE}/T9001.red.mjs`, 'engineering/release-management/02-requirements/F1-x/T9001.test.mjs');
  git('mv', `${CHANGE}/T9002.red.mjs`, 'engineering/release-management/02-requirements/F1-x/T9002.test.mjs');
  put('engineering/release-management/02-requirements/F1-x/T9003.test.mjs', CASE(9003));
  git('add', '-A'); git('commit', '-q', '-m', 'DO');
  const done = git('rev-parse', 'HEAD').trim();
  return { root, git, put, plan, done, clean: () => rmSync(root, { recursive: true, force: true }) };
}
const F1 = 'engineering/release-management/02-requirements/F1-x';
export const id = 'release/T1265';
export const tests = ['release/A71'];
export const title = 'plannedCases returns the Cases of the merged PLAN with their fingerprints from the base, through a SYNC and after the DO moved them, and headCases finds them wherever the DO put them';
export async function run() {
  assert.ok(existsSync(SRC), 'judge-act.mjs is absent');
  const { plannedCases, headCases } = await load();
  const f = fixture();
  try {
    const fromPlan = plannedCases(f.root, f.plan, CHANGE);
    assert.deepEqual(fromPlan.map((c) => c.id), ['T9001', 'T9002']);
    const fromDone = plannedCases(f.root, f.done, CHANGE);
    assert.deepEqual(fromDone, fromPlan, 'the planned Cases move with the DO or the SYNC');
    assert.deepEqual(plannedCases(f.root, f.done, 'engineering/release-management/00-changes/C998-none'), [], 'a folder with no PLAN has no planned Cases');
    const h = headCases(f.root, f.done);
    assert.equal(h.T9001.path, `${F1}/T9001.test.mjs`);
    assert.equal(h.T9001.green, true);
    assert.equal(h.T9001.fingerprint, fromPlan[0].fingerprint, 'the renamed Case is the same Case');
    assert.ok(h.T9003, 'a Case that the PLAN did not add is listed too');
    const red = headCases(f.root, f.plan);
    assert.equal(red.T9001.green, false, 'a .red.mjs is not green');
  } finally { f.clean(); }
}
