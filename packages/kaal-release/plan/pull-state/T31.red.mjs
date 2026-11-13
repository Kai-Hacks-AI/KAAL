// Case pull/T31 tests: pull/F32
import assert from 'node:assert/strict';
import { carried, declaration, file, good, retro, statusOf, walkCollectors } from './fixtures.mjs';
export const id = 'pull/T31';
export const tests = ['pull/F32'];
export const title = 'a collector with a scope is qualified only from the work it owns: PLAN, DO, Cases and ACT inside the scope, no delta file outside it, nothing inherited from main for another capability';
const decl = (scope) => declaration({ collectors: [{ name: 'col-a', ...(scope === undefined ? {} : { scope }) }] });
const only = async (collector, scope) => statusOf(await walkCollectors({ collectors: [collector] }, decl(scope)), 'col-a');
export async function run() {
  const own = good('col-a');
  assert.equal((await only(own)).status, 'qualifies', 'without a scope the collector is not judged as before');
  assert.equal((await only(own, ['^plan/', '^src/', '^test/'])).status, 'qualifies', 'a collector with its evidence inside its scope did not qualify');
  // the same facts scoped elsewhere: nothing of the collector is inside the scope
  const elsewhere = await only(own, ['^docs/']);
  assert.equal(elsewhere.status, 'does not qualify', 'evidence outside the scope qualified the collector');
  assert.ok(elsewhere.missing.some((m) => /scope/.test(m)), 'the empty scope is not named');
  // a delta file outside the scope: owned work the scope does not cover
  const outside = await only(own, ['^plan/', '^src/', '^test/T1']);
  assert.equal(outside.status, 'does not qualify', 'delta files outside the scope were ignored');
  assert.ok(outside.missing.some((m) => /scope/.test(m) && m.includes('test/T2.test.mjs')), 'the delta file outside the scope is not named');
  // PLAN, DO and Cases inherited from main, in the tree and outside the scope, never count
  const inherited = good('col-a', { delta: [file('docs/note.md', 'added')], history: [{ id: 'col-a-head', paths: ['docs/note.md'] }], tree: [...good('col-a').tree, 'docs/note.md'] });
  assert.equal((await only(inherited, ['^docs/'])).status, 'does not qualify', 'evidence inherited from main qualified a collector whose scope holds none');
  // PLAN and DO inside the scope but carried from main still count (F26), and the scope bounds what is read
  assert.equal((await only(carried('col-a'), ['^plan/', '^src/', '^test/'])).status, 'qualifies');
  assert.equal((await only(carried('col-a'), ['^test/', '^plan/x/00-changes\\.md$'])).status, 'does not qualify', 'PLAN and DO outside the scope counted');
  // an ACT outside the scope is not the collector's ACT
  assert.equal((await only(own, ['^plan/x/(requirements|testing)', '^src/', '^test/'])).status, 'does not qualify');
  // an empty or malformed scope is not judged, naming the scope
  for (const bad of [[], 'plan', [1], {}]) {
    const r = await only(own, bad);
    assert.equal(r.status, 'not judged', `scope ${JSON.stringify(bad)} did not make the collector not judged`);
    assert.ok(r.missing.some((m) => /scope/.test(m)), 'the malformed scope is not named');
  }
  void retro;
}
