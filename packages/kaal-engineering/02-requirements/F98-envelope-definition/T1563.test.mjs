// Case engineering/T1563 tests: engineering/F98
import assert from 'node:assert/strict';
import { load, matches } from './fixture.mjs';
export const id = 'engineering/T1563';
export const tests = ['engineering/F98'];
export const title = 'each TYPE has the routes the Dispatcher and the envelope allow today (eligibility only), WIRE by its head into main, and a route never settles the type';
export async function run() {
  const by = Object.fromEntries(load().types.map((t) => [t.type, t]));
  const is = (type, base, head) => { const r = by[type]; return r.base.some((p) => matches(base, p)) && (!r.head || r.head.some((p) => matches(head, p))) && !(r.notHead ?? []).some((p) => matches(head, p)); };
  for (const t of ['PLAN', 'DO', 'ACT']) { assert.ok(is(t, 'kaal/engineering/x', 'claude/y'), `${t} into kaal/`); assert.ok(!is(t, 'main', 'claude/y'), `${t} never into main`); }
  for (const b of ['kaal/engineering/x', 'hotfix/x', 'wire/x']) assert.ok(is('SYNC', b, 'claude/s'), `SYNC into ${b}`);
  assert.ok(!is('SYNC', 'main', 'claude/s'), 'SYNC never into main');
  assert.ok(is('PROMOTION', 'main', 'kaal/engineering/x') && is('PROMOTION', 'main', 'hotfix/x') && !is('PROMOTION', 'main', 'claude/x'), 'PROMOTION into main from kaal/ or hotfix/');
  assert.ok(is('HOTFIX', 'hotfix/x', 'claude/f') && !is('HOTFIX', 'hotfix/x', 'hotfix/y'), 'HOTFIX into hotfix/ from a head not under it');
  assert.ok(is('WIRE', 'main', 'wire/x') && !is('WIRE', 'wire/x', 'claude/w') && !is('WIRE', 'main', 'claude/x'), 'WIRE from a head wire/ into main, not by a base under wire/');
  for (const t of ['PLAN', 'DO', 'ACT', 'SYNC']) assert.ok(is(t, 'kaal/engineering/x', 'claude/y'), `${t} shares the kaal/ route, so a route never settles the type`);
}
