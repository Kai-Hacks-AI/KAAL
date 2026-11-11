// Case release/T20 tests: release/A6
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
export const id = 'release/T20';
export const tests = ['release/A6'];
export const title = 'the job named verify Plan reports a green status for PASS, including accepted RED, and a red status for FAIL and UNKNOWN';
const root = join(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const check = join(root, '05-src/plan/check.mjs');
const scratch = mkdtempSync(join(tmpdir(), 'verify-plan-'));
const repo = join(root, '../..');
const scope = 'engineering/release-management/';
const own = { commits: [{ sha: 'a1', message: 'release/C1 PLAN: x\n\nDriven-by: release/C1' }], files: [{ filename: `${scope}00-changes/C1-verify-plan/C1.md`, status: 'modified' }] };
const pr = (title, over = {}) => { const file = join(scratch, `pr-${Math.random()}.json`); writeFileSync(file, JSON.stringify({ title, body: '', ...own, ...over })); return file; };
const evidence = (rows) => { const file = join(scratch, `ev-${Math.random()}.json`); writeFileSync(file, JSON.stringify(rows)); return file; };
const run = (...args) => spawnSync('node', [check, ...args], { encoding: 'utf8' });
const red = [{ case: 'release/T29', target: 'release/G1', result: 'failed', reason: 'assertion' }];
test(`${id} ${title}`, () => {
  const plan = ['--pr', pr('release/C1 PLAN: x'), '--repo', repo];
  const green = run(...plan, '--evidence', evidence(red));
  assert.equal(green.status, 0, green.stdout);
  assert.match(green.stdout, /^PASS/);
  const failing = run(...plan, '--evidence', evidence([{ ...red[0], reason: 'unconditional' }]));
  assert.equal(failing.status, 1, failing.stdout);
  assert.match(failing.stdout, /Recovery:/);
  const unknown = run(...plan);
  assert.equal(unknown.status, 2, unknown.stdout);
  assert.match(unknown.stdout, /^UNKNOWN/);
  assert.equal(run('--pr', pr('release/C1 DO: x'), '--tree', root).status, 3);
  assert.equal(run('--pr', join(scratch, 'missing.json'), '--tree', root).status, 2);
  // The adapter hands the judge only the PLAN the pull request names: a valid tree of another change, or files outside the capability, is UNKNOWN.
  const evidenceFile = evidence(red);
  for (const [what, args] of [
    ['a title that names a change the tree does not hold', ['--pr', pr('release/C99 PLAN: x', { commits: [{ sha: 'a1', message: 'x\n\nDriven-by: release/C99' }] })]],
    ['a commit driven by another change', ['--pr', pr('release/C1 PLAN: x', { commits: [{ sha: 'a1', message: 'x\n\nDriven-by: release/C2' }] })]],
    ['one commit with the trailer and one without', ['--pr', pr('release/C1 PLAN: x', { commits: [own.commits[0], { sha: 'b2', message: 'release/C1 DO: y' }] })]],
    ['a commit with two trailers', ['--pr', pr('release/C1 PLAN: x', { commits: [{ sha: 'a1', message: 'x\n\nDriven-by: release/C1\nDriven-by: release/C1' }] })]],
    ['no commit trailer', ['--pr', pr('release/C1 PLAN: x', { commits: [] })]],
    ['a changed file outside the capability', ['--pr', pr('release/C1 PLAN: x', { files: [{ filename: 'packages/other/index.mjs', status: 'modified' }] })]],
  ]) {
    const result = run(...args, '--repo', repo, '--evidence', evidenceFile);
    assert.equal(result.status, 2, `${what}: ${result.stdout}`);
    assert.match(result.stdout, /^UNKNOWN/, what);
    assert.match(result.stdout, /Recovery/, what);
  }
  assert.equal(run('--pr', pr('release/C1 PLAN: x'), '--evidence', evidenceFile).status, 2, 'no repository given');
  // The capability folder is found from the Change the title names, so any capability is judged.
  const change = (folder, id) => { const dir = join(scratch, 'repo', folder, '00-changes', 'C1-x'); mkdirSync(dir, { recursive: true }); writeFileSync(join(dir, 'C1.md'), `---\nid: ${id}\ntitle: x\n---\n`); };
  change('engineering/demo', 'demo/C1');
  const demo = (over = {}) => pr('demo/C1 PLAN: x', { commits: [{ sha: 'd1', message: 'x\n\nDriven-by: demo/C1' }], files: [{ filename: 'engineering/demo/00-changes/C1-x/C1.md', status: 'added' }], ...over });
  const located = run('--pr', demo(), '--repo', join(scratch, 'repo'), '--evidence', evidenceFile);
  assert.equal(located.status, 1, `a Change of another capability is judged: ${located.stdout}`);
  assert.doesNotMatch(located.stdout, /^UNKNOWN/);
  assert.equal(run('--pr', demo({ files: [{ filename: 'engineering/release-management/README.md', status: 'modified' }] }), '--repo', join(scratch, 'repo')).status, 2, 'a file outside the located capability');
  change('engineering/other', 'demo/C1');
  assert.equal(run('--pr', demo(), '--repo', join(scratch, 'repo')).status, 2, 'two folders hold the same Change');
  // A merge commit brings changes that were admitted elsewhere and carries no trailer; it is not judged for one.
  const merged = pr('release/C1 PLAN: x', { commits: [...own.commits, { sha: 'm1', message: "Merge branch 'main'", parents: ['p1', 'p2'] }] });
  assert.equal(run('--pr', merged, '--repo', repo, '--evidence', evidenceFile).status, 0, 'a merge commit is skipped');
  // An artificial baseline cannot qualify the plan of an unrelated capability as RED.
  writeFileSync(join(scratch, 'repo/engineering/demo/T1.red.mjs'), "export const id = 'demo/T1';\nexport const tests = ['demo/C1'];\nexport async function run({ judge }) { if ((await judge({})).verdict !== 'FAIL') throw Object.assign(new Error('accepted'), { code: 'ERR_ASSERTION', operator: 'strictEqual' }); }\n");
  rmSync(join(scratch, 'repo/engineering/other'), { recursive: true });
  const stand = run('--pr', demo(), '--repo', join(scratch, 'repo'), '--execute');
  assert.match(stand.stdout, /F1\/6[^\n]*no meaningful observed RED/, stand.stdout);
  // The check can execute the Cases of the located folder itself.
  // The scratch plan holds a Case that is not red, so the executed evidence cannot qualify it; the real tree is not used because its own Cases change with every PLAN.
  assert.equal(stand.status, 1, stand.stdout);
  // Input that exists but cannot be read gives UNKNOWN with a Recovery, never a crash.
  const notAFolder = join(scratch, 'file.txt');
  writeFileSync(notAFolder, 'x');
  for (const [what, args] of [['a tree that is a file', ['--pr', pr('release/C1 PLAN: x'), '--repo', notAFolder]], ['evidence that is a folder', [...plan, '--evidence', scratch]]]) {
    const result = run(...args);
    assert.equal(result.status, 2, `${what}: ${result.stdout}${result.stderr}`);
    assert.match(result.stdout, /^UNKNOWN/, what);
    assert.match(result.stdout, /Recovery|again/, what);
  }
});
