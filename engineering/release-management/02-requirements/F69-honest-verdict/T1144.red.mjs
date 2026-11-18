// Case release/T1144 tests: release/F69
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM, draft, loadDraft, green, facts, NOW } from '../../03-architecture/A64-verdict-from-evidence/fixtures.mjs';
export const id = 'release/T1144';
export const tests = ['release/F69'];
export const title = "an earlier closed or merged PROMOTION is shown as a fact and suppresses nothing";
export async function run() {
  const { verdict } = await loadDraft('verdict.mjs');
  const x = verdict(facts({ closedPromotions: [{ number: 5, state: 'closed' }, { number: 6, state: 'merged' }] }), NOW);
  assert.equal(x.verdict, 'raisable');
  assert.deepEqual(x.facts.earlierPromotions, [{ number: 5, state: 'closed' }, { number: 6, state: 'merged' }]);
  assert.ok(!/parked/i.test(JSON.stringify(x)), 'nothing is called parked');
}
