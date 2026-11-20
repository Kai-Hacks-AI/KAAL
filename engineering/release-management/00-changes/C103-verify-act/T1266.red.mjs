// Case release/T1266 tests: release/F80
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
export const id = 'release/T1266';
export const tests = ['release/F80'];
export const title = 'the command line exits 0 for a DO that made exactly the planned Cases green and 1, naming them, for a deleted, renamed-back or edited Case or an observed RED, and 2 when nothing could be judged';
export async function run() {
  assert.ok(existsSync(SRC), 'judge-act.mjs is absent');
  const f = fixture();
  const obs = join(f.root, '.obs.json');
  const cli = (headRef, observed, change = CHANGE) => {
    if (observed !== undefined) writeFileSync(obs, JSON.stringify(observed)); else rmSync(obs, { force: true });
    return spawnSync(process.execPath, [SRC, '--root', f.root, '--base', f.done, '--head', headRef, '--change', change, '--observed', obs], { encoding: 'utf8' });
  };
  try {
    const green = { T9001: 'GREEN', T9002: 'GREEN', T9003: 'GREEN' };
    const ok = cli(f.done, green);
    assert.equal(ok.status, 0, ok.stdout);
    assert.match(ok.stdout, /^PASS/);
    const bad = (r, id, re) => { assert.equal(r.status, 1, `${id}: ${r.stdout}`); assert.match(r.stdout, /finish your work first/); assert.ok(r.stdout.includes(id), `${id} is not named`); if (re) assert.match(r.stdout, re); };
    bad(cli(f.done, { ...green, T9002: 'RED' }), 'T9002');
    // The candidate is a branch off the DO: each negative is a commit on it, read as Git data.
    const cand = (name, edit) => { f.git('checkout', '-q', '-B', name, f.done); edit(); f.git('add', '-A'); f.git('commit', '-q', '-m', name); const sha = f.git('rev-parse', 'HEAD').trim(); f.git('checkout', '-q', 'collector'); return sha; };
    bad(cli(cand('deleted', () => rmSync(join(f.root, F1, 'T9001.test.mjs'))), green), 'T9001');
    bad(cli(cand('backred', () => renameSync(join(f.root, F1, 'T9002.test.mjs'), join(f.root, F1, 'T9002.red.mjs'))), green), 'T9002');
    bad(cli(cand('edited', () => f.put(`${F1}/T9001.test.mjs`, CASE(9001, 'weakened'))), green), 'T9001');
    // Nothing could be judged: no observation, an unknown one, an unresolvable head, a PLAN without Cases.
    assert.equal(cli(f.done, undefined).status, 2, 'a missing observation passes or fails instead of UNKNOWN');
    assert.equal(cli(f.done, { ...green, T9001: 'UNKNOWN' }).status, 2);
    assert.equal(cli('no-such-ref', green).status, 2);
    assert.equal(cli(f.done, green, 'engineering/release-management/00-changes/C998-none').status, 2, 'a PLAN without Cases must not pass');
  } finally { f.clean(); }
}
