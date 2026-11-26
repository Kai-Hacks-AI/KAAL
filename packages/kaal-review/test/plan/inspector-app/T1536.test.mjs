// Case review/T1536 tests: review/F33. No App decides on what it raised.
import assert from 'node:assert/strict';
import { declaration, kinds, load } from './lib.mjs';
export const id = 'review/T1536';
export const tests = ['review/F33'];
export const title = 'a set of declarations in which only the Approver approves and none raises and approves is in, and an Inspector that approves, a Dispatcher that approves, an App that raises and approves and a declaration without abilities are each out with their own finding';
export async function run() {
  const { judgeApps } = await load();
  const inspector = declaration('inspector', ['post-checks', 'read-contents', 'read-pull-requests']);
  const dispatcher = declaration('dispatcher', ['raise-pull-requests', 'read-contents']);
  const approver = declaration('approver', ['approve-pull-requests', 'read-pull-requests']);
  assert.deepEqual(judgeApps([inspector, dispatcher, approver]), { verdict: 'in', findings: [] });
  assert.deepEqual(judgeApps([inspector, dispatcher]), { verdict: 'in', findings: [] }, 'an absent Approver is not a finding');

  const out = (apps, kind, why) => { const v = judgeApps(apps); assert.equal(v.verdict, 'out', why); assert.ok(kinds(v).includes(kind), `${why}: expected ${kind}, got ${kinds(v)}`); };
  out([declaration('inspector', [...inspector.abilities, 'approve-pull-requests']), dispatcher, approver], 'approves-beyond-approver', 'an Inspector that approves');
  out([inspector, declaration('dispatcher', [...dispatcher.abilities, 'approve-pull-requests']), approver], 'approves-beyond-approver', 'a Dispatcher that approves');
  out([inspector, dispatcher, declaration('approver', ['approve-pull-requests', 'raise-pull-requests'])], 'raises-and-approves', 'an App that raises and approves');
  out([inspector, declaration('someone', ['raise-pull-requests', 'approve-pull-requests'])], 'raises-and-approves', 'an unnamed App that raises and approves');
  out([inspector, { app: 'x', name: 'x', owner: 'review', purpose: 'p' }], 'no-abilities', 'a declaration without abilities');
  assert.equal(judgeApps('not a list').verdict, 'out', 'a malformed set must be out, not an exception');
  assert.equal(judgeApps(undefined).verdict, 'out', 'a missing set must be out, not an exception');
}
