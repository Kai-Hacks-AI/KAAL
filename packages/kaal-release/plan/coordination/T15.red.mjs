// Case coordination/T15 tests: F9
import assert from 'node:assert/strict';
import { bad, byTarget, collector, coordinate, declaration, facts, ok, promotionOf, request, syncInto } from './fixtures.mjs';
export const id = 'coordination/T15';
export const tests = ['coordination/F9'];
export const title = 'entries carry their layer; what is ready is listed nearest the outcome first, a dependent after what it depends on, and the publishing layer is reported as not modelled';
export async function run() {
  const state = facts({
    collectors: [collector('col-a'), collector('col-d', 2)],
    requests: [
      promotionOf(80, 'col-a', { review: null, autoMerge: false }),
      request(81, { base: 'col-a', change: 'c/C81', review: null, autoMerge: false }),
      request(83, { base: 'col-d', change: 'c/C83', checks: [ok('build'), bad('fresh')] }),
      syncInto(82, 'col-d', 'c/C83'),
    ],
  });
  const result = await coordinate(state, declaration());
  const layers = { '#80': 'promotion', '#81': 'integration', '#82': 'development', '#83': 'integration' };
  for (const [target, layer] of Object.entries(layers)) assert.equal(byTarget(result, target)?.layer, layer, `${target} is not in the ${layer} layer`);
  const ranks = ['#80', '#81', '#82', '#83'].map((t) => byTarget(result, t).rank);
  assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b), 'the entries are not listed promotion, integration, development, then the dependent');
  assert.equal(byTarget(result, '#83').action, 'WAIT');
  assert.ok(byTarget(result, '#82').rank < byTarget(result, '#83').rank, 'a dependent is listed before what it depends on');
  assert.ok(result.notJudged.some((n) => /publishing/i.test(n)), 'the publishing layer is not reported as not modelled');
}
