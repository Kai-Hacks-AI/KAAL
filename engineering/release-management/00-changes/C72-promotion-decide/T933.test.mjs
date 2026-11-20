// Case release/T933 tests: release/C72
import assert from 'node:assert/strict';
import { load, facts, act } from './fixtures.mjs';
export const id = 'release/T933';
export const tests = ['release/C72'];
export const title = 'a collector whose ACT merged, that is ahead of main with no PROMOTION open, is to be raised, with the title and the Change id of the ACT';
export async function run() {
  const m = await load('decide.mjs');
  assert.equal(typeof m.decideRaise, 'function', 'decide.mjs has no decideRaise');
  const d = m.decideRaise(facts());
  assert.equal(d.action, 'raise', JSON.stringify(d));
  assert.equal(d.head, 'kaal/release/small-thing');
  assert.equal(d.base, 'main');
  assert.equal(d.title, 'PROMOTION: something small, 4L retrospective (release/C99)');
  assert.match(d.body, /^## Change\n\nrelease\/C99 something small\n/, 'the body does not carry the Change of the ACT');
  assert.ok(d.body.includes('#7'), 'the body does not name the ACT that made it ready');
  const d2 = m.decideRaise(facts({ merged: [act(9, 'release/C5 other')] }));
  assert.match(d2.body, /release\/C5 other/, 'the Change id is not read from this ACT');
}
