// Case pull/T49 tests: pull/F48
import assert from 'node:assert/strict';
import { declaration, script, NEW, entry } from './lib.mjs';
export const id = 'pull/T49';
export const tests = ['pull/F48'];
export const title = 'declaring does not weaken any rule: a candidate with no concluding ACT, no executed Case or no DO still does not qualify';

export async function run() {
  const ev = declaration.evidence;
  assert.ok(ev.act.files.some((p) => /concluding-act/.test(p)), 'the concluding ACT pattern was removed');
  assert.deepEqual(ev.act.headings, ['Liked', 'Learned', 'Lacked', 'Longed For'], 'the 4L headings were changed');
  assert.ok(ev.plan.length >= 2 && ev.do.length >= 1 && ev.act.history.length >= 2, 'a PLAN, DO or history pattern was removed');
  for (const name of NEW) assert.ok(entry(name), `${name} is not declared, so nothing can be checked about it`);
  // A declared candidate with a PLAN only is reported as not qualifying and says what is missing.
  const { walkCollectors } = await script();
  const name = 'kaal/guard/registration';
  const facts = { collectors: [{ name, at: 'h1', delta: [{ path: 'engineering/guard/00-changes/C143-registration/change.md', status: 'added' }], tree: ['engineering/guard/00-changes/C143-registration/change.md'], history: [{ id: 'c1', paths: ['engineering/guard/00-changes/C143-registration/change.md'] }], texts: {}, executions: [] }] };
  const r = walkCollectors(facts, { ...declaration, collectors: [entry(name)] });
  assert.notEqual(r.collectors[0].status, 'qualifies', 'a PLAN-only collector qualified');
  assert.ok(r.collectors[0].missing.length > 0, 'the report does not say what is missing');
}
