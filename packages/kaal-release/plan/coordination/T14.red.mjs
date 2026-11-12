// Case coordination/T14 tests: F10
import assert from 'node:assert/strict';
import { byTarget, analyzeFlow, declaration, facts, piece } from './fixtures.mjs';
export const id = 'coordination/T14';
export const tests = ['coordination/F10'];
export const title = 'a hotfix is the expedite class outside the pair and its WIP limit, a piece of the fallback type is reported and not classified';
export async function run() {
  const hotfix = piece(70, { type: 'HOTFIX', into: 'main', from: 'hot-1', change: 'c/C70', review: null, landsOnApproval: false });
  const plain = piece(71, { type: 'DEFAULT' });
  const result = await analyzeFlow(facts({ pieces: [hotfix, plain] }), declaration());
  const entry = byTarget(result, '#70');
  assert.equal(entry.action, 'REVIEW', 'a hotfix does not get its next action');
  assert.equal(entry.class, 'expedite', 'a hotfix is not marked as the expedite class');
  const promotion = result.actions.find((a) => a.action === 'OPEN' && a.target === 'col-a' && a.kind === 'promotion');
  assert.ok(promotion && promotion.status === 'ready', 'a hotfix occupies the promotion lane');
  assert.ok(result.notJudged.some((n) => /hotfix/i.test(n) && /route/i.test(n)), 'the unmodelled hotfix route is not reported');
  assert.ok(result.notJudged.some((n) => /#71/.test(n) && /template|default|fallback/i.test(n)), 'a fallback piece is not reported');
  assert.ok(!byTarget(result, '#71'), 'an action is guessed for a piece of the fallback type');
}
