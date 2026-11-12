// Case coordination/T14 tests: F10
import assert from 'node:assert/strict';
import { byTarget, coordinate, declaration, facts, request } from './fixtures.mjs';
export const id = 'coordination/T14';
export const tests = ['coordination/F10'];
export const title = 'a hotfix is an exceptional route outside the pair, a request of the fallback type is reported and not classified';
export async function run() {
  const hotfix = request(70, { type: 'HOTFIX', base: 'main', head: 'hot-1', change: 'c/C70', review: null, autoMerge: false });
  const plain = request(71, { type: 'DEFAULT' });
  const result = await coordinate(facts({ requests: [hotfix, plain] }), declaration());
  const entry = byTarget(result, '#70');
  assert.equal(entry.action, 'REVIEW PR', 'a hotfix does not get its next action');
  assert.equal(entry.route, 'exceptional', 'a hotfix is not marked as an exceptional route');
  const promotion = result.actions.find((a) => a.action === 'OPEN PR' && a.target === 'col-a' && a.kind === 'promotion');
  assert.ok(promotion && promotion.status === 'ready', 'a hotfix occupies the promotion lane');
  assert.ok(result.notJudged.some((n) => /hotfix/i.test(n) && /route/i.test(n)), 'the unmodelled hotfix route is not reported');
  assert.ok(result.notJudged.some((n) => /#71/.test(n) && /template|default|fallback/i.test(n)), 'a fallback request is not reported');
  assert.ok(!byTarget(result, '#71'), 'an action is guessed for a request of the fallback type');
}
