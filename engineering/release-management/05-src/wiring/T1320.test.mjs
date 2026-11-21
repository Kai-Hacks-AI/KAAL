// Case release/T1320 tests release/D12: the Branching verdict of a pull request is the newest event's, and it judges the merge method
// only when the pull request has auto-merge, by the method it has when the run judges. A pull request without auto-merge is not failed for it.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T1320';
export const tests = ['release/D12'];
export const title = 'Branching: the newest event decides, the merge method is judged only while auto-merge is on and by the method the pull request has when the run judges';

const code = (text) => text.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');

// A run for an older event must not outlive a newer one: one group per pull request, and the older run is cancelled.
export const newestEventDecides = (workflow) => {
  const c = /^concurrency:\n((?:[ ]+.*\n)+)/m.exec(code(workflow));
  return !!c && /group:.*pull_request\.number/.test(c[1]) && /cancel-in-progress:\s*true/.test(c[1]);
};
// The method a verdict judges is the one the pull request has now. The event's copy of it is as old as the event.
export const autoMergeFromEvent = (workflow) => /KAAL_AUTO_MERGE:\s*\$\{\{\s*github\.event\.pull_request\.auto_merge/.test(code(workflow));
export const autoMergeReadAtRun = (workflow) => /gh api [^\n]*pulls\/\$\w+[^\n]*auto_merge/.test(code(workflow)) && /KAAL_AUTO_MERGE=/.test(code(workflow));

const git = (cwd, ...args) => { const r = spawnSync('git', args, { cwd, encoding: 'utf8' }); assert.equal(r.status, 0, r.stderr); return r.stdout.trim(); };

// branching.sh in a scratch clone with a stub checker: freshness and synchronization pass, the merge method fails when it is judged.
function branching(method) {
  const dir = mkdtempSync(join(tmpdir(), 't1320-'));
  try {
    const origin = join(dir, 'origin.git');
    git(dir, 'init', '-q', '--bare', '-b', 'main', origin);
    const work = join(dir, 'work');
    git(dir, 'clone', '-q', origin, work);
    git(work, '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '--allow-empty', '-m', 'c');
    git(work, 'push', '-q', 'origin', 'HEAD:main');
    const head = git(work, 'rev-parse', 'HEAD');
    const stub = join(dir, 'checker.mjs');
    writeFileSync(stub, "const v = process.argv[2]; if (v === 'auto-merge') { console.log('stub: the method ' + process.argv[8] + ' is judged'); process.exit(1); } console.log('stub: ' + v + ' passes');\n");
    const env = { ...process.env, GUARD_HEAD: head, GUARD_BASE_REF: 'main', KAAL_DEFAULT: 'main', KAAL_HEAD_REF: 'x' };
    delete env.KAAL_AUTO_MERGE; delete env.KAAL_RULES; delete env.GITHUB_STEP_SUMMARY;
    if (method !== undefined) env.KAAL_AUTO_MERGE = method;
    const r = spawnSync('bash', [join(repo, 'engineering/github/branching.sh'), stub], { cwd: work, env, encoding: 'utf8' });
    return { code: r.status, out: r.stdout + r.stderr };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

export function run() {
  // Each test can fail: both sides of a sample.
  const grouped = 'name: X\nconcurrency:\n  group: b-${{ github.event.pull_request.number }}\n  cancel-in-progress: true\njobs:\n';
  assert.equal(newestEventDecides(grouped), true);
  assert.equal(newestEventDecides('name: X\njobs:\n'), false);
  assert.equal(newestEventDecides(grouped.replace('true', 'false')), false);
  assert.equal(newestEventDecides(grouped.replace('.number', '.title')), false);
  assert.equal(autoMergeFromEvent('  KAAL_AUTO_MERGE: ${{ github.event.pull_request.auto_merge.merge_method }}'), true);
  assert.equal(autoMergeFromEvent('  # KAAL_AUTO_MERGE: ${{ github.event.pull_request.auto_merge.merge_method }}'), false);
  assert.equal(autoMergeReadAtRun('gh api "repos/$R/pulls/$NUMBER" --jq .auto_merge\necho KAAL_AUTO_MERGE=$M'), true);
  assert.equal(autoMergeReadAtRun('echo KAAL_AUTO_MERGE=$M'), false);

  // The source of the workflow.
  const source = join(repo, 'engineering/release-management/05-src/wiring/workflows/lineage-synchronization.yml');
  assert.ok(existsSync(source), 'the workflow has no source under 05-src/wiring/workflows: it was installed by hand and cannot be corrected where it is made');
  const workflow = readFileSync(source, 'utf8');
  assert.equal(newestEventDecides(workflow), true, 'an older event\'s run can finish after a newer one and leave its failure as the verdict');
  assert.equal(autoMergeFromEvent(workflow), false, 'the verdict judges the auto-merge the event carried, which is older than the run');
  assert.equal(autoMergeReadAtRun(workflow), true, 'the auto-merge is not read from the pull request when the run judges');

  // The check: with auto-merge off the method is not judged; with one it is, and a method that fails fails the check.
  const off = branching(undefined);
  assert.equal(off.code, 0, `a pull request without auto-merge is failed for it: ${off.out}`);
  assert.match(off.out, /stub: freshness passes/);
  assert.doesNotMatch(off.out, /is judged/, 'the method is judged while auto-merge is off');
  const empty = branching('');
  assert.equal(empty.code, 0, 'an empty method is auto-merge off');
  const on = branching('merge');
  assert.equal(on.code, 1, 'the method is not judged while auto-merge is on');
  assert.match(on.out, /stub: the method merge is judged/);
}
