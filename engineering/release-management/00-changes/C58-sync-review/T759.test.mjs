// Case release/T759 tests: release/C58
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const SRC = join(repo, 'engineering/release-management/05-src/sync-review');
export const id = 'release/T759';
export const tests = ['release/C58'];
export const title = 'approve Sync reads the head and the base again and does not approve a head whose base moved, and review Sync fails visibly, after labelling and explaining, when no eligible reviewer exists';
const BODY = '## Change\n\nrelease/C1 x\n\n## Reason\n\nto unblock development\n';
export async function run() {
  const load = (f) => import(pathToFileURL(join(SRC, f)).href);
  const { approve, review, verify } = await load('cli.mjs');
  const { decideApproveNow } = await load('approve.mjs');
  const { chooseReviewer, ownersOf } = await load('review.mjs');

  // the pure parts
  assert.equal(chooseReviewer({ owners: ['kaihacksai'], author: 'someone' }), 'kaihacksai');
  assert.equal(chooseReviewer({ owners: ['kaihacksai'], author: 'KaiHacksAI' }), null, 'the author is not eligible, whatever the case');
  assert.equal(chooseReviewer({ owners: ['kaihacksai'], fallback: 'cpo', author: 'kaihacksai' }), 'cpo', 'the fallback takes over');
  assert.equal(chooseReviewer({ owners: ['org/team'], author: 'a' }), null, 'a team is not a person to ask');
  assert.equal(chooseReviewer({ owners: [], author: 'a' }), null);
  assert.deepEqual(ownersOf('# c\n* @a @org/t\n/x @b\n'), ['a', 'org/t']);
  assert.deepEqual(ownersOf(null), []);
  const H = 'c'.repeat(40);
  const verdict = (over = {}) => ({ control: 'verify Sync', outcome: 'PASS', passes: true, reasons: [], analyzed: { base: { ref: 'kaal/release/x', tip: 'a'.repeat(40) }, head: H, parents: ['a'.repeat(40), 'b'.repeat(40)], mergeTree: 'd'.repeat(40), added: [H], ...over }, ...over.top });
  const live = { head: H, baseTip: 'a'.repeat(40) };
  const ask = (over = {}) => decideApproveNow({ verdict: verdict(), live, currentHead: H, mode: 'on', approvedAtHead: false, ...over });
  assert.equal(ask().action, 'approve');
  assert.equal(ask({ live: undefined }).action, 'skip', 'a head and base that were not read now do not approve');
  assert.equal(ask({ live: { ...live, baseTip: 'e'.repeat(40) } }).action, 'skip', 'the base moved with the head unchanged');
  assert.equal(ask({ live: { ...live, head: 'f'.repeat(40) } }).action, 'skip', 'the head moved');
  assert.equal(ask({ mode: undefined }).action, 'would-approve', 'dry run stays the default');

  // against real Git, with GitHub stood in for
  const dir = mkdtempSync(join(tmpdir(), 'kaal-t759-'));
  const git = (args) => { const r = spawnSync('git', args, { cwd: dir, encoding: 'utf8' }); return { status: r.status ?? 2, stdout: r.stdout ?? '', stderr: r.stderr ?? '' }; };
  const must = (args) => { const r = git(args); assert.equal(r.status, 0, `git ${args.join(' ')}: ${r.stderr}`); return r.stdout.trim(); };
  const put = (file, text) => writeFileSync(join(dir, file), text);
  const commit = (m) => { must(['add', '-A']); must(['commit', '-q', '-m', m]); return must(['rev-parse', 'HEAD']); };
  try {
    must(['init', '-q', '-b', 'main']);
    must(['config', 'user.name', 't']); must(['config', 'user.email', 't@example.com']); must(['config', 'commit.gpgsign', 'false']);
    put('a.txt', 'a\n'); put('s.txt', 's\n'); commit('main 1');
    must(['branch', 'collector']);
    put('m.txt', 'm\n'); const mainTip = commit('main 2');
    must(['checkout', '-q', 'collector']);
    put('own.txt', 'own\n'); commit('collector change');
    must(['checkout', '-q', '-b', 'sync', 'collector']);
    must(['merge', '--no-ff', '-q', '-m', 'SYNC', mainTip]);
    const head = must(['rev-parse', 'HEAD']);
    const point = () => { must(['update-ref', 'refs/kaal/base', must(['rev-parse', 'collector'])]); must(['update-ref', 'refs/remotes/origin/main', must(['rev-parse', 'main'])]); must(['update-ref', 'refs/kaal/pr', head]); };
    point();
    const state = { head, baseTip: must(['rev-parse', 'collector']), author: 'author', requested: [], codeowners: '* @kaihacksai\n', body: BODY };
    const calls = [], outs = {}, logs = [], errors = [];
    const api = (args) => {
      const a = args.join(' ');
      calls.push(a);
      if (/-X (POST|DELETE)/.test(a)) return '{}';
      if (/git\/ref\/heads\/kaal\/release\/x$/.test(a)) return JSON.stringify({ object: { sha: state.baseTip } });
      if (/pulls\/7$/.test(a)) return JSON.stringify({ head: { sha: state.head }, base: { ref: 'kaal/release/x' }, title: 'SYNC: x', body: state.body, user: { login: state.author }, requested_reviewers: state.requested.map((login) => ({ login })) });
      if (/issues\/7\/labels/.test(a)) return '[]';
      return '';
    };
    const deps = (over = {}) => ({ git, api, codeowners: () => state.codeowners, out: (n, v) => { outs[n] = v; }, summary() {}, log: (l) => logs.push(l), error: (t, l) => errors.push(`${t}: ${l}`), ...over });
    const env = (extra = {}) => ({ KAAL_REPO: 'o/r', KAAL_PR: '7', KAAL_BASE: 'kaal/release/x', KAAL_HEAD: head, KAAL_BODY: BODY, KAAL_DEFAULT: 'main', ...extra });
    const posted = (re) => calls.filter((c) => /-X POST/.test(c) && re.test(c));
    const reset = () => { calls.length = 0; logs.length = 0; errors.length = 0; };

    // verify passes the pure SYNC, and that verdict is what approve and review are handed
    assert.equal(verify(env(), deps()), 0);
    const earlier = outs.verdict;
    assert.equal(JSON.parse(earlier).outcome, 'PASS');

    // nothing moved: approve approves exactly this head when switched on, and only says so otherwise
    reset();
    assert.equal(approve(env({ KAAL_VERDICT: earlier, KAAL_SYNC_APPROVE: 'on' }), deps()), 0);
    assert.equal(posted(/pulls\/7\/reviews/).length, 1);
    assert.ok(posted(/pulls\/7\/reviews/)[0].includes(`commit_id=${head}`));
    reset();
    approve(env({ KAAL_VERDICT: earlier }), deps());
    assert.equal(posted(/pulls\/7\/reviews/).length, 0, 'a dry run approves nothing');
    assert.ok(logs.some((l) => l.includes('would-approve')));

    // the head is unchanged and the base moved: no approval on the old verdict
    must(['checkout', '-q', 'collector']);
    put('later.txt', 'later\n'); commit('collector moved on');
    point(); state.baseTip = must(['rev-parse', 'collector']);
    reset();
    approve(env({ KAAL_VERDICT: earlier, KAAL_SYNC_APPROVE: 'on' }), deps());
    assert.equal(posted(/pulls\/7\/reviews/).length, 0, 'a moved base is not approved');
    assert.ok(logs.some((l) => l.includes('skip')), logs.join(' | '));
    // and review Sync, reading the facts again, puts it in front of a person
    reset();
    assert.equal(review(env({ KAAL_VERDICT: earlier }), deps()), 0);
    assert.equal(posted(/labels/).length, 1);
    assert.equal(posted(/requested_reviewers/).length, 1);

    // review Sync with nobody to ask: it labels and explains, then fails visibly
    const failing = JSON.stringify({ control: 'verify Sync', outcome: 'FAIL', passes: false, reasons: [{ code: 'merge-conflicts', detail: 'd' }], analyzed: { head } });
    state.author = 'kaihacksai';
    reset();
    assert.equal(review(env({ KAAL_VERDICT: failing }), deps()), 1, 'the author is the only Code Owner: red, not quiet');
    assert.equal(posted(/labels/).length, 1, 'it still labels');
    assert.equal(posted(/issues\/7\/comments/).length, 1, 'it still explains');
    assert.ok(posted(/issues\/7\/comments/)[0].includes('No reviewer could be requested'));
    assert.equal(posted(/requested_reviewers/).length, 0);
    assert.equal(errors.length, 1);
    assert.ok(errors[0].includes('CODEOWNERS') && errors[0].includes('KAAL_SYNC_REVIEWER'), 'the failure says what to do');
    state.codeowners = '* @org/team\n';
    reset();
    assert.equal(review(env({ KAAL_VERDICT: failing }), deps()), 1, 'a team alone is nobody to ask');
    state.codeowners = null;
    reset();
    assert.equal(review(env({ KAAL_VERDICT: failing }), deps()), 1, 'no CODEOWNERS file');
    // a fallback person turns it into a request
    state.codeowners = '* @kaihacksai\n';
    reset();
    assert.equal(review(env({ KAAL_VERDICT: failing, KAAL_SYNC_REVIEWER: 'cpo' }), deps()), 0);
    assert.equal(posted(/requested_reviewers/).length, 1);
    assert.ok(posted(/requested_reviewers/)[0].includes('reviewers[]=cpo'));
    // another author: the Code Owner is asked
    state.author = 'someone';
    reset();
    assert.equal(review(env({ KAAL_VERDICT: failing }), deps()), 0);
    assert.ok(posted(/requested_reviewers/)[0].includes('reviewers[]=kaihacksai'));
    // a request that GitHub refuses is a failure, not a log line
    reset();
    assert.throws(() => review(env({ KAAL_VERDICT: failing }), deps({ api: (args) => { if (args.join(' ').includes('requested_reviewers')) throw new Error('gh api failed'); return api(args); } })));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
