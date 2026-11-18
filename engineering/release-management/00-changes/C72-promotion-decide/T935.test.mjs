// Case release/T935 tests: release/C72
import assert from 'node:assert/strict';
import { load, facts, act } from './fixtures.mjs';
export const id = 'release/T935';
export const tests = ['release/C72'];
export const title = 'a SYNC after the ACT does not undo it, a PLAN, DO or another ACT-less merge after it does, and only the newest non-SYNC counts';
export async function run() {
  const m = await load('decide.mjs');
  assert.equal(typeof m.decideRaise, 'function', 'decide.mjs has no decideRaise');
  const sync = { number: 12, title: 'SYNC: bring main into the collector', body: '' };
  assert.equal(m.decideRaise(facts({ merged: [sync, act()] })).action, 'raise', 'a SYNC after the ACT hides it');
  assert.equal(m.decideRaise(facts({ merged: [sync, sync, act()] })).action, 'raise');
  const plan = { number: 13, title: 'PLAN: another change (release/C98)', body: '## Change\n\nrelease/C98 another\n' };
  assert.equal(m.decideRaise(facts({ merged: [plan, act()] })).reason, 'not-ready', 'a PLAN after the ACT does not make it unready');
  assert.equal(m.decideRaise(facts({ merged: [sync, plan, act()] })).reason, 'not-ready');
  assert.equal(m.decideRaise(facts({ merged: [act(20, 'release/C100 newer'), plan] })).action, 'raise', 'the newest non-SYNC is an ACT');
}
