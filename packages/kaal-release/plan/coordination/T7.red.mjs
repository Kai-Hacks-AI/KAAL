// Case coordination/T7 tests: F2, F3, F4
import assert from 'node:assert/strict';
import { byTarget, collector, analyzeFlow, declaration, facts, piece, syncInto } from './fixtures.mjs';
export const id = 'coordination/T7';
export const tests = ['coordination/F2', 'coordination/F3', 'coordination/F4'];
export const title = 'a missing, contradictory or undeclared fact is reported in notJudged naming it, and no action is guessed from it';
export async function run() {
  const noReview = piece(50);
  delete noReview.review;
  const missing = await analyzeFlow(facts({ collectors: [], pieces: [noReview] }), declaration({ promotions: [] }));
  assert.ok(missing.notJudged.some((n) => /#50/.test(n) && /review/i.test(n)), 'a piece without its review fact is not reported');
  assert.ok(!missing.actions.some((a) => a.target === '#50'), 'an action is guessed for a piece without its review fact');

  const noPolicy = declaration();
  delete noPolicy.policy;
  const undeclared = await analyzeFlow(facts(), noPolicy);
  assert.ok(undeclared.notJudged.some((n) => /policy/i.test(n)), 'an undeclared promotion policy is not reported');
  assert.ok(!undeclared.actions.some((a) => a.kind === 'promotion'), 'a promotion action is guessed without a declared policy');

  const noPairs = declaration();
  delete noPairs.promotions;
  const unpaired = await analyzeFlow(facts(), noPairs);
  assert.ok(unpaired.notJudged.some((n) => /promotions|pairs/i.test(n)), 'undeclared promotion pairs are not reported');
  assert.ok(!unpaired.actions.some((a) => a.kind === 'promotion'), 'a promotion action is guessed without declared pairs');

  const unknown = piece(51, { type: 'REVERT' });
  const odd = await analyzeFlow(facts({ collectors: [], pieces: [unknown] }), declaration({ promotions: [] }));
  assert.ok(odd.notJudged.some((n) => /#51/.test(n) && /type/i.test(n)), 'a piece of an undeclared type is not reported');
  assert.ok(!odd.actions.some((a) => a.target === '#51'), 'an action is guessed for a piece of an undeclared type');

  const stray = syncInto(52, 'col-x', 'c/C99');
  const unsettled = await analyzeFlow(facts({ collectors: [collector('col-a'), collector('col-x', 1)], pieces: [stray] }), declaration());
  assert.ok(unsettled.notJudged.some((n) => /#52/.test(n) && /purpose/i.test(n)), 'a sync that matches no pair and no blocked Change is not reported');
  const entry = byTarget(unsettled, '#52');
  assert.ok(!entry || entry.purpose == null, 'a purpose is guessed for a sync that matches no pair and no blocked Change');
}
