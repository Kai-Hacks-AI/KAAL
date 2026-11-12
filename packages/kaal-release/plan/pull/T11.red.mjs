// Case pull/T11 tests: pull/F12
import assert from 'node:assert/strict';
import { collector, declaration, facts, flow, landed, ok, promotion, pullPromotion } from './fixtures.mjs';
export const id = 'pull/T11';
export const tests = ['pull/F12'];
export const title = 'readiness is not authorization and not a second lane: two ready collectors yield at most one OPEN, a ready collector never marks itself approved, and the declared holds and roles are the only authority';
export async function run() {
  const green = [ok('build'), ok('suite'), ok('guard'), ok('fresh')];
  const state = facts({
    collectors: [collector('col-a', { checks: green }), collector('col-b', { checks: green })],
    pieces: [landed(10), landed(11, 'DO', { into: 'col-b', change: 'c/C2' }), landed(8, 'ACT', { into: 'col-b', change: 'c/C2' })],
  });
  const decl = declaration({ promotions: [{ collector: 'col-a', change: 'c/C1' }, { collector: 'col-b', change: 'c/C2' }] }, {
    increments: [{ collector: 'col-a', change: 'c/C1', carries: ['DO'] }, { collector: 'col-b', change: 'c/C2', carries: ['DO'] }],
    changes: [{ id: 'c/C1', onTarget: ['PLAN', 'DO', 'ACT'] }, { id: 'c/C2', onTarget: ['PLAN', 'DO', 'ACT'] }],
  });
  const lane = flow({ lane: { active: 'col-a' } });
  const a = await pullPromotion(state, decl, lane, 'col-a');
  const b = await pullPromotion(state, decl, lane, 'col-b');
  assert.equal(a.verdict, 'READY');
  assert.equal(b.verdict, 'READY', 'a collector that is not next is not ready');
  const ready = [a, b].filter((r) => r.next.status === 'ready');
  assert.equal(ready.length, 1, 'more than one promotion is ready at once, so the lane limit of one is broken');
  assert.equal(ready[0].next.target, 'col-a', 'the ready one is not the lane\'s');
  assert.equal(b.next.action, 'WAIT');

  // a verdict is an eligibility statement: it never carries an approval, a landing or an authorization
  for (const r of [a, b]) {
    assert.ok(!('approved' in r) && !('authorized' in r) && !('merge' in r), 'the output carries an authorization');
    assert.ok(['author', 'reviewer', 'owner', 'lander', undefined, null].includes(r.next.authority), 'an authority outside the declared roles');
  }
  // an unnamed role cannot be invented: with no roles declared the authority is not guessed
  const bare = await pullPromotion(state, { ...decl, roles: undefined }, lane, 'col-a');
  assert.ok(bare.next.authority === undefined || bare.next.authority === null, 'an authority was invented where none is declared');
  assert.ok(bare.notJudged.some((n) => /roles/.test(JSON.stringify(n))), 'the missing roles are not reported');
}
