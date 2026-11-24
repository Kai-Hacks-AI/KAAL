// Case release/T853 tests: release/C65
import assert from 'node:assert/strict';
import { pureSync, load } from './fixtures.mjs';
export const id = 'release/T853';
export const tests = ['release/C65'];
export const title = 'approve Sync runs without reading any Git object of the candidate, refuses a verdict it does not know, and approves only the head and base tip the verdict judged, as GitHub says they are now';
const H = 'c'.repeat(40), T = 'a'.repeat(40);
const verdict = (over = {}) => ({ control: 'verify Sync', outcome: 'PASS', passes: true, reasons: [], analyzed: { base: { ref: 'kaal/release/x', tip: T }, head: H, parents: [T, 'b'.repeat(40)], mergeTree: 'd'.repeat(40), added: [H] }, ...over });
export async function run() {
  const { readVerdict, decideApproveNow } = await load('approve.mjs');
  assert.equal(typeof readVerdict, 'function', 'approve.mjs has no readVerdict');
  // the verdict is data: only a verdict of verify Sync with full commit names is read, and only what approve needs is kept
  assert.deepEqual(readVerdict(verdict()), { outcome: 'PASS', passes: true, analyzed: { head: H, base: { ref: 'kaal/release/x', tip: T } } });
  for (const bad of [null, undefined, 'PASS', {}, verdict({ control: 'other' }), verdict({ analyzed: { head: 'main', base: { ref: 'kaal/x', tip: T } } }), verdict({ analyzed: { head: H, base: { ref: 'kaal/x', tip: 'abc' } } }), verdict({ analyzed: { head: H, base: { ref: 7, tip: T } } }), verdict({ analyzed: null })]) assert.equal(readVerdict(bad), null, `a verdict that is not one: ${JSON.stringify(bad)}`);
  const live = { head: H, baseTip: T };
  const ask = (over = {}) => decideApproveNow({ verdict: verdict(), live, currentHead: H, mode: 'on', approvedAtHead: false, ...over });
  assert.equal(ask().action, 'approve');
  assert.equal(ask({ mode: undefined }).action, 'would-approve', 'a dry run stays the default');
  assert.equal(ask({ mode: 'ON' }).action, 'would-approve', 'only exactly on approves');
  assert.equal(ask({ verdict: verdict({ outcome: 'FAIL', passes: false }) }).action, 'skip');
  assert.equal(ask({ verdict: verdict({ analyzed: { base: { ref: 'main', tip: T }, head: H } }) }).action, 'skip', 'never into main');
  assert.equal(ask({ live: undefined }).action, 'skip');
  assert.equal(ask({ live: { head: H } }).action, 'skip', 'no base tip read');
  assert.equal(ask({ live: { head: 'f'.repeat(40), baseTip: T } }).action, 'skip', 'the head moved');
  assert.equal(ask({ live: { head: H, baseTip: 'e'.repeat(40) } }).action, 'skip', 'the base moved');
  assert.equal(ask({ approvedAtHead: true }).action, 'skip');

  const { approve, verify } = await load('cli.mjs');
  const w = pureSync();
  try {
    assert.equal(verify(w.env(), w.deps()), 0);
    const earlier = w.outs.verdict;
    const live2 = (extra = {}) => w.env({ KAAL_VERDICT: earlier, KAAL_SYNC_APPROVE: 'on', ...extra });
    // no Git object of the candidate is read: git is a tripwire, and the approval is attached to the head
    w.reset();
    assert.equal(approve(live2(), w.deps({ git: w.noGit })), 0);
    assert.equal(w.outs.approval, 'approved');
    assert.equal(w.posted(/pulls\/7\/reviews/).length, 1);
    assert.ok(w.posted(/pulls\/7\/reviews/)[0].includes(`commit_id=${w.head}`), 'the approval is pinned to the head');
    assert.ok(w.calls.some((c) => /git\/ref\/heads\/kaal\/release\/x$/.test(c)), 'the base tip is read through the API');
    w.reset();
    assert.equal(approve(w.env({ KAAL_VERDICT: earlier }), w.deps({ git: w.noGit })), 0);
    assert.equal(w.outs.approval, 'would-approve');
    assert.equal(w.posted(/pulls\/7\/reviews/).length, 0, 'a dry run approves nothing');
    // a verdict that is not verify Sync's, however well formed otherwise, approves nothing
    for (const forged of ['', 'not json', '{"outcome":"PASS","passes":true}', JSON.stringify({ ...JSON.parse(earlier), control: 'x' }), JSON.stringify({ ...JSON.parse(earlier), analyzed: { ...JSON.parse(earlier).analyzed, head: 'HEAD' } })]) {
      w.reset();
      assert.equal(approve(live2({ KAAL_VERDICT: forged }), w.deps({ git: w.noGit })), 0);
      assert.equal(w.outs.approval, 'skipped', `forged verdict ${forged.slice(0, 30)}`);
      assert.equal(w.posted(/pulls\/7\/reviews/).length, 0);
    }
    // the head moved while the verdict was on its way, or the base did: no approval
    w.state.head = 'f'.repeat(40);
    w.reset();
    assert.equal(approve(live2(), w.deps({ git: w.noGit })), 0);
    assert.equal(w.posted(/pulls\/7\/reviews/).length, 0, 'a moved head is not approved');
    w.state.head = w.head; w.state.baseTip = 'e'.repeat(40);
    w.reset();
    assert.equal(approve(live2(), w.deps({ git: w.noGit })), 0);
    assert.equal(w.posted(/pulls\/7\/reviews/).length, 0, 'a moved base is not approved');
    assert.equal(w.outs.approval, 'skipped');
  } finally {
    w.done();
  }
}
