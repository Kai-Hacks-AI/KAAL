// Case release/T948 tests: release/C73
import assert from 'node:assert/strict';
import { load, fakeApi, decision, R } from './fixtures.mjs';
export const id = 'release/T948';
export const tests = ['release/C73'];
export const title = 'the seat is a policy: by default none is raised while a pull request into main is open and at most one in a run, and a larger capacity allows that many open at once';
export async function run() {
  const s = await load('seat.mjs'), g = await load('gather.mjs');
  assert.equal(typeof s.oneAtATime, 'function', 'seat.mjs has no oneAtATime');
  assert.equal(typeof s.readCapacity, 'function', 'seat.mjs has no readCapacity');
  assert.equal(typeof g.openPromotions, 'function', 'gather.mjs has no openPromotions');
  const a = decision({ head: 'kaal/release/a-thing' }), b = decision({ head: 'kaal/release/b-thing' }), c = decision({ head: 'kaal/release/c-thing' }), skip = { action: 'skip', reason: 'not-ready', detail: '' };
  const raised = (x) => x.filter((d) => d.action === 'raise').length;
  const one = s.oneAtATime({ decisions: [skip, a, b], openPromotions: [] });
  assert.equal(raised(one), 1, 'two PROMOTIONs raised in one run');
  assert.equal(one[1].action, 'raise', 'the first ready collector is not the one raised');
  assert.equal(one[2].reason, 'seat-taken');
  const taken = s.oneAtATime({ decisions: [a, b], openPromotions: [{ number: 40 }] });
  assert.ok(taken.every((d) => d.action === 'skip' && d.reason === 'seat-taken'), 'a PROMOTION was raised while another is open');
  assert.ok(String(taken[0].detail).includes('40'), 'the open PROMOTION is not named');
  assert.deepEqual(s.oneAtATime({ decisions: [skip], openPromotions: [] }), [skip], 'a skip changed');
  assert.equal(raised(s.oneAtATime({ decisions: [a, b, c], openPromotions: [], capacity: 2 })), 2, 'a capacity of two did not allow two');
  assert.equal(raised(s.oneAtATime({ decisions: [a, b, c], openPromotions: [{ number: 40 }], capacity: 2 })), 1, 'the open ones did not count against the capacity');
  assert.equal(raised(s.oneAtATime({ decisions: [a, b], openPromotions: [{ number: 40 }, { number: 41 }], capacity: 2 })), 0);
  for (const [v, want] of [[undefined, 1], ['', 1], ['1', 1], ['3', 3], ['0', 1], ['-2', 1], ['two', 1], ['2.5', 1], ['999', 1]]) assert.equal(s.readCapacity(v), want, `capacity ${JSON.stringify(v)}`);
  const api = fakeApi({ [`GET repos/${R}/pulls?state=open&base=main&per_page=50`]: [
    { number: 40, title: 'PROMOTION: x', head: { ref: 'kaal/release/x-thing' }, base: { ref: 'main' } },
    { number: 41, title: 'WIRE: y', head: { ref: 'wire/y' }, base: { ref: 'main' } },
    { number: 42, title: 'PROMOTION: z', head: { ref: 'hotfix/z' }, base: { ref: 'main' } } ] });
  assert.deepEqual((await g.openPromotions(api, R)).map((p) => p.number), [40, 41, 42], 'an open pull request into main is not counted: any PR into main holds a place');
  assert.ok(api.calls.every((c) => c.method === 'GET'));
}
