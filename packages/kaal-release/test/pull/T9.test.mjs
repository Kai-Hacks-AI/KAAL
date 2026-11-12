// Case pull/T9 tests: pull/F11
import assert from 'node:assert/strict';
import { allGreen, bad, declaration, facts, flow, landed, ok, promotion, pullPromotion, lifecycle } from './fixtures.mjs';
export const id = 'pull/T9';
export const tests = ['pull/F11'];
export const title = 'the same inputs give byte-identical output, whatever the order of pieces, checks and evidence';
export async function run() {
  const pieces = [...lifecycle(), landed(30, 'PLAN', { into: 'main', change: 'c/C9' }), promotion(20, 'col-a', { checks: [ok('guard'), bad('suite'), ok('build'), ok('fresh'), ok('stranger')] })];
  const a = await pullPromotion(facts({ pieces }), declaration(), flow());
  const reversed = [...pieces].reverse().map((p) => ({ ...p, checks: [...p.checks].reverse() }));
  const b = await pullPromotion(facts({ pieces: reversed }), declaration(), flow());
  assert.equal(JSON.stringify(b), JSON.stringify(a), 'the order of the evidence changes the output');
  assert.equal(JSON.stringify(await pullPromotion(facts({ pieces }), declaration(), flow())), JSON.stringify(a), 'the same inputs give different output');
  assert.ok(!/generatedAt|runAt|elapsed/.test(JSON.stringify(a)), 'the output holds the time of the run');
}
