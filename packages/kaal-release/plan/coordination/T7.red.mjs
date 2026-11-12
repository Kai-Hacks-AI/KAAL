// Case coordination/T7 tests: F2, F3, F4
import assert from 'node:assert/strict';
import { coordinate, declaration, facts, request } from './fixtures.mjs';
export const id = 'coordination/T7';
export const tests = ['coordination/F2', 'coordination/F3', 'coordination/F4'];
export const title = 'a missing, contradictory or undeclared fact is reported in notJudged naming it, and no action is guessed from it';
export async function run() {
  const noReview = request(50);
  delete noReview.review;
  const missing = await coordinate(facts({ collectors: [], requests: [noReview] }), declaration({ candidates: [] }));
  assert.ok(missing.notJudged.some((n) => /#50/.test(n) && /review/i.test(n)), 'a request without its review fact is not reported');
  assert.ok(!missing.actions.some((a) => a.target === '#50'), 'an action is guessed for a request without its review fact');

  const noPolicy = declaration();
  delete noPolicy.policy;
  const undeclared = await coordinate(facts(), noPolicy);
  assert.ok(undeclared.notJudged.some((n) => /policy/i.test(n)), 'an undeclared promotion policy is not reported');
  assert.ok(!undeclared.actions.some((a) => a.kind === 'promotion'), 'a promotion action is guessed without a declared policy');

  const unknown = request(51, { title: 'REVERT: Undo a thing' });
  const odd = await coordinate(facts({ collectors: [], requests: [unknown] }), declaration({ candidates: [] }));
  assert.ok(odd.notJudged.some((n) => /#51/.test(n) && /kind|type/i.test(n)), 'a title of an undeclared kind is not reported');
  assert.ok(!odd.actions.some((a) => a.target === '#51'), 'an action is guessed for a request of an undeclared kind');
}
