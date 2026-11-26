// Case engineering/T1561 tests: engineering/F98
import assert from 'node:assert/strict';
import { load, matches } from './fixture.mjs';
export const id = 'engineering/T1561';
export const tests = ['engineering/F98'];
export const title = 'each TYPE is recognised by base and head branch as the Dispatcher and the envelope recognise it today';
export async function run() {
  const d = load();
  const by = Object.fromEntries(d.types.map((t) => [t.type, t]));
  // A pull request is recognised as a TYPE when its base matches a `base` pattern and, where the row has `head`, its head matches one; `notHead` excludes.
  const is = (type, base, head) => { const r = by[type]; return r.base.some((p) => matches(base, p)) && (!r.head || r.head.some((p) => matches(head, p))) && !(r.notHead ?? []).some((p) => matches(head, p)); };
  for (const t of ['PLAN', 'DO', 'ACT']) { assert.ok(is(t, 'kaal/engineering/x', 'claude/y'), `${t} into kaal/`); assert.ok(!is(t, 'main', 'claude/y'), `${t} never into main`); }
  for (const b of ['kaal/engineering/x', 'hotfix/x', 'wire/x']) assert.ok(is('SYNC', b, 'claude/s'), `SYNC into ${b}`);
  assert.ok(!is('SYNC', 'main', 'claude/s'), 'SYNC never into main');
  assert.ok(is('PROMOTION', 'main', 'kaal/engineering/x') && is('PROMOTION', 'main', 'hotfix/x'), 'PROMOTION into main from kaal/ or hotfix/');
  assert.ok(!is('PROMOTION', 'main', 'claude/x'), 'PROMOTION not from a claude/ branch');
  assert.ok(is('HOTFIX', 'hotfix/x', 'claude/f'), 'HOTFIX into hotfix/ from a head not under it');
  assert.ok(!is('HOTFIX', 'hotfix/x', 'hotfix/y'), 'HOTFIX not from a head under hotfix/');
  assert.ok(is('WIRE', 'wire/x', 'claude/w'), 'WIRE into wire/');
}
