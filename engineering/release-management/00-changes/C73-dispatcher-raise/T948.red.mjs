// Case release/T948 tests: release/C73
import assert from 'node:assert/strict';
import { load, fakeApi, decision, R } from './fixtures.mjs';
export const id = 'release/T948';
export const tests = ['release/C73'];
export const title = 'the Dispatcher never raises two PROMOTIONs: none while any pull request into main is open or enqueued, and at most one in a run';
export async function run() {
  const s = await load('seat.mjs'), g = await load('gather.mjs');
  assert.equal(typeof s.oneAtATime, 'function', 'seat.mjs has no oneAtATime');
  assert.equal(typeof g.openPromotions, 'function', 'gather.mjs has no openPromotions');
  const a = decision({ head: 'kaal/release/a-thing' }), b = decision({ head: 'kaal/release/b-thing' }), skip = { action: 'skip', reason: 'not-ready', detail: '' };
  const one = s.oneAtATime({ decisions: [skip, a, b], openPromotions: [] });
  assert.equal(one.filter((d) => d.action === 'raise').length, 1, 'two PROMOTIONs raised in one run');
  assert.equal(one[1].action, 'raise', 'the first ready collector is not the one raised');
  assert.equal(one[2].reason, 'seat-taken');
  const taken = s.oneAtATime({ decisions: [a, b], openPromotions: [{ number: 40 }] });
  assert.ok(taken.every((d) => d.action === 'skip' && d.reason === 'seat-taken'), 'a PROMOTION was raised while another is open');
  assert.ok(String(taken[0].detail).includes('40'), 'the open PROMOTION is not named');
  assert.deepEqual(s.oneAtATime({ decisions: [skip], openPromotions: [] }), [skip], 'a skip changed');
  const api = fakeApi({
    [`GET repos/${R}/pulls?state=open&base=main&per_page=50`]: [
      { number: 40, title: 'PROMOTION: x', head: { ref: 'kaal/release/x-thing' }, base: { ref: 'main' } },
      { number: 41, title: 'WIRE: y', head: { ref: 'wire/y' }, base: { ref: 'main' } },
      { number: 42, title: 'PROMOTION: z', head: { ref: 'hotfix/z' }, base: { ref: 'main' } },
    ],
  });
  const open = await g.openPromotions(api, R);
  assert.deepEqual(open.map((p) => p.number), [40, 41, 42], 'an open pull request into main is not counted: any PR into main holds the seat');
  assert.ok(api.calls.every((c) => c.method === 'GET'));
}
