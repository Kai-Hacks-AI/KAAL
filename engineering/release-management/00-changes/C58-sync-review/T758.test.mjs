// Case release/T758 tests: release/C58
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const SRC = join(repo, 'engineering/release-management/05-src/sync-review');
export const id = 'release/T758';
export const tests = ['release/C58'];
export const title = 'the facts read from real Git make verify Sync pass a pure merge and fail a resolved conflict, an altered merge, an extra commit and a merge of a state the base already holds, and UNKNOWN for a head it cannot read';
export async function run() {
  const { gatherFacts, reasonOf } = await import(pathToFileURL(join(SRC, 'facts.mjs')).href);
  const { verifySync } = await import(pathToFileURL(join(SRC, 'verify.mjs')).href);
  const dir = mkdtempSync(join(tmpdir(), 'kaal-t758-'));
  const git = (args) => { const r = spawnSync('git', args, { cwd: dir, encoding: 'utf8' }); return { status: r.status ?? 2, stdout: r.stdout ?? '', stderr: r.stderr ?? '' }; };
  const must = (args) => { const r = git(args); assert.equal(r.status, 0, `git ${args.join(' ')}: ${r.stderr}`); return r.stdout.trim(); };
  const put = (file, text) => writeFileSync(join(dir, file), text);
  const commit = (message) => { must(['add', '-A']); must(['commit', '-q', '-m', message]); return must(['rev-parse', 'HEAD']); };
  const REASON = '## Change\n\nrelease/C1 x\n\n## Reason\n\n<!-- why -->\nto unblock development\n\n---\n_footer_';
  try {
    must(['init', '-q', '-b', 'main']);
    must(['config', 'user.name', 't']); must(['config', 'user.email', 't@example.com']); must(['config', 'commit.gpgsign', 'false']);
    put('a.txt', 'a\n'); put('shared.txt', 'one\n'); commit('main 1');
    must(['branch', 'collector']);
    put('main-only.txt', 'm\n'); put('shared.txt', 'main side\n'); commit('main 2');
    must(['checkout', '-q', 'collector']);
    put('own.txt', 'own\n'); commit('collector change');
    const tip = must(['rev-parse', 'HEAD']);
    const facts = (head, over = {}) => gatherFacts({ git, baseRef: 'kaal/release/x', baseTipRef: 'refs/heads/collector', mainRef: 'refs/heads/main', headSha: head, currentHead: head, body: REASON, ...over });

    assert.equal(reasonOf(REASON), 'to unblock development', 'the Reason chapter is read without comments or footer');
    assert.equal(reasonOf('## Change\n\nx\n'), null);
    assert.equal(reasonOf('## Reason\n\n<!<!-- a -->-- b -->\nreal\n'), 'real', 'a comment built around another is removed too');
    assert.equal(reasonOf('## Reason\n\n<!<!-- a -->--\n'), '', 'a Reason that is only a comment is empty');

    // a pure SYNC of main into the collector, whose conflict-free parts merge on their own
    must(['checkout', '-q', '-b', 'pure', 'collector']);
    const mainTip = must(['rev-parse', 'main']);
    const m = git(['merge', '--no-ff', '-q', '-m', 'SYNC', mainTip]);
    // shared.txt changed on main only: a clean merge
    assert.equal(m.status, 0, `the pure merge is clean: ${m.stderr}${m.stdout}`);
    const pure = must(['rev-parse', 'HEAD']);
    const pureVerdict = verifySync(facts(pure));
    assert.equal(pureVerdict.outcome, 'PASS', JSON.stringify(pureVerdict.reasons));
    assert.equal(pureVerdict.analyzed.base.tip, tip);

    // a merge that was altered after the merge: the tree is no longer git's clean merge
    must(['checkout', '-q', '-b', 'altered', 'collector']);
    must(['merge', '--no-ff', '--no-commit', '-q', mainTip]);
    put('smuggled.txt', 'not from main\n');
    must(['add', '-A']); must(['commit', '-q', '-m', 'SYNC with a change']);
    const altered = verifySync(facts(must(['rev-parse', 'HEAD'])));
    assert.equal(altered.outcome, 'FAIL');
    assert.ok(altered.reasons.some((r) => r.code === 'tree-differs-from-clean-merge'));

    // a commit on top of the merge: more than the merge is added
    must(['checkout', '-q', '-b', 'extra', 'pure']);
    put('extra.txt', 'x\n'); commit('on top');
    const extra = verifySync(facts(must(['rev-parse', 'HEAD'])));
    assert.equal(extra.outcome, 'FAIL');
    assert.ok(extra.reasons.some((r) => r.code === 'extra-commits'));
    assert.ok(extra.reasons.some((r) => r.code === 'not-a-merge-commit'));

    // a merge that needed a resolution: both sides changed the same lines
    must(['checkout', '-q', 'collector']);
    put('shared.txt', 'collector side\n'); commit('collector edits shared');
    const tip2 = must(['rev-parse', 'HEAD']);
    must(['checkout', '-q', '-b', 'resolved', 'collector']);
    const conflict = git(['merge', '--no-ff', '-q', '-m', 'SYNC', mainTip]);
    assert.equal(conflict.status, 1, 'the merge conflicts');
    put('shared.txt', 'resolved by hand\n'); commit('SYNC resolved');
    const resolved = verifySync(facts(must(['rev-parse', 'HEAD']), { baseTipRef: 'refs/heads/collector' }));
    assert.equal(resolved.analyzed.base.tip, tip2);
    assert.equal(resolved.outcome, 'FAIL');
    assert.ok(resolved.reasons.some((r) => r.code === 'merge-conflicts'));

    // a merge of a state the base already holds does not advance
    must(['checkout', '-q', 'pure']);
    must(['branch', '-f', 'collector', 'pure']);
    // 'pure' already holds main's tip, so a merge commit of it with main adds nothing the base lacks
    must(['checkout', '-q', '-b', 'stale', 'pure']);
    const noop = must(['commit-tree', '-p', 'pure', '-p', mainTip, '-m', 'SYNC again', 'pure^{tree}']);
    const stale = verifySync(facts(noop));
    assert.equal(stale.outcome, 'FAIL');
    assert.ok(stale.reasons.some((r) => r.code === 'does-not-advance'));

    // no reason, a moved head, and a head that cannot be read
    assert.ok(verifySync(facts(pure, { body: '## Change\n\nx\n' })).reasons.some((r) => r.code === 'no-reason'));
    assert.ok(verifySync(facts(pure, { currentHead: 'f'.repeat(40) })).reasons.some((r) => r.code === 'head-moved'));
    const unreadable = verifySync(facts('0'.repeat(40)));
    assert.equal(unreadable.outcome, 'UNKNOWN');
    assert.equal(unreadable.passes, false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
