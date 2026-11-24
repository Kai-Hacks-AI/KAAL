// Case release/T934 tests: release/C72
import assert from 'node:assert/strict';
import { load, facts, act } from './fixtures.mjs';
export const id = 'release/T934';
export const tests = ['release/C72'];
export const title = 'each reason to skip is named: not a collector, already open, nothing to promote, not ready, no Change id';
export async function run() {
  const m = await load('decide.mjs');
  assert.equal(typeof m.decideRaise, 'function', 'decide.mjs has no decideRaise');
  const why = (f) => { const d = m.decideRaise(f); assert.equal(d.action, 'skip', JSON.stringify(d)); return d; };
  assert.equal(why(facts({ collector: 'hotfix/route' })).reason, 'not-a-collector');
  assert.equal(why(facts({ collector: 'kaal/release' })).reason, 'not-a-collector');
  const open = why(facts({ open: [{ number: 31, title: 'PROMOTION: x', base: 'main', head: 'kaal/release/small-thing' }] }));
  assert.equal(open.reason, 'already-open');
  assert.ok(String(open.detail).includes('31'), 'the open PROMOTION is not named');
  assert.equal(why(facts({ aheadOfMain: 0 })).reason, 'nothing-to-promote');
  assert.equal(why(facts({ merged: [] })).reason, 'not-ready');
  assert.equal(why(facts({ merged: [{ number: 4, title: 'DO: something small', body: '' }, act()] })).reason, 'not-ready');
  assert.equal(why(facts({ merged: [{ number: 8, title: 'ACT: x', body: 'no change section' }] })).reason, 'no-change-id');
  const d = m.decideRaise(facts({ open: [{ number: 40, title: 'SYNC: y', base: 'kaal/release/small-thing', head: 'sync/x' }] }));
  assert.equal(d.action, 'raise', 'an open pull request into the collector is not a PROMOTION and must not hide the decision');
}
