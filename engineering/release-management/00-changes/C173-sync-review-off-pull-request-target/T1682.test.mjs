// Case release/T1682 tests: release/C173
import assert from 'node:assert/strict';
import { source, jobOf, world } from './fixture.mjs';
export const id = 'release/T1682';
export const tests = ['release/C173'];
export const title = 'approve Sync and review Sync run from the default branch on workflow_run and run nothing of the candidate; approval needs an open pull request of this repository into a collector, wire or hotfix base with the same head, base ref and base sha, and every other state keeps review routing to a person';
export async function run() {
  const act = source('sync-act.yml');
  assert.match(act, /^on:\n {2}workflow_run:\n {4}workflows: \['sync verify'\]\n {4}types: \[completed\]\n/m);
  assert.ok(!/git fetch|refs\/pull|npm |pnpm |yarn /.test(act), 'the acting workflow reads or builds the candidate');
  for (const name of ['approve Sync', 'review Sync']) assert.ok(jobOf(act, name).includes('ref: ${{ github.event.repository.default_branch }}'), `${name} does not check out the default branch`);
  const x = await world();
  try {
    const ok = x.run(x.approve, x.actEnv());
    assert.equal(ok, 0);
    assert.equal(x.w.outs.approval, 'approved', 'the matching revision pair is approved');
    assert.ok(x.w.posted(/pulls\/7\/reviews/)[0].includes(`commit_id=${x.w.head}`));
    const negatives = {
      closed: () => { x.pr.state = 'closed'; },
      fork: () => { x.pr.headRepo = 'fork/r'; },
      'not a lane': () => { x.pr.baseRef = 'main'; },
      retargeted: () => { x.pr.baseRef = 'kaal/release/y'; },
      'head moved': () => { x.w.state.head = 'f'.repeat(40); },
      'base moved': () => { x.w.state.baseTip = 'e'.repeat(40); },
    };
    for (const [name, change] of Object.entries(negatives)) {
      const keep = { ...x.pr }, head = x.w.state.head, tip = x.w.state.baseTip;
      change();
      assert.equal(x.run(x.approve, x.actEnv()), 0, name);
      assert.notEqual(x.w.outs.approval, 'approved', `${name}: approved`);
      assert.equal(x.w.posted(/pulls\/7\/reviews/).length, 0, `${name}: a review was posted`);
      // review still puts a person in front of it
      x.run(x.review, x.actEnv({ KAAL_APPROVAL: x.w.outs.approval }));
      // a retargeted pull request is no longer the SYNC that was judged: review leaves it to the run of the new base, and says so
      if (name === 'retargeted') assert.ok(x.w.logs.some((l) => /no longer a SYNC into the base/.test(l)), 'retargeted: not said');
      else if (name !== 'closed' && name !== 'not a lane' && name !== 'fork') assert.ok(x.w.posted(/labels/).length + x.w.posted(/comments/).length > 0, `${name}: nobody is asked to look`);
      Object.assign(x.pr, keep); x.w.state.head = head; x.w.state.baseTip = tip;
    }
  } finally { x.w.done(); }
}
