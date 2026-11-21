// Case release/T1321 tests release/I63 and release/CTL32: the promoting ruleset source holds the merge queue of the default branch, which lands a promotion by squash,
// one entry at a time, and no other ruleset source holds a queue.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RS = join(repo, 'engineering/release-management/05-src/wiring/rulesets');
export const id = 'release/T1321';
export const tests = ['release/I63', 'release/CTL32'];
export const title = 'the promoting ruleset source holds the merge queue of the default branch (squash, one entry at a time), no other ruleset source holds one, and the table of controls says so';

export const queues = (ruleset) => (ruleset.rules ?? []).filter((r) => r.type === 'merge_queue');
// The queue as the live promotion ruleset has it (captured in release/C34): what it lands by, how it builds and how long it waits.
export const asLive = (q) => q.parameters.merge_method === 'SQUASH' && q.parameters.grouping_strategy === 'ALLGREEN'
  && q.parameters.max_entries_to_build === 1 && q.parameters.min_entries_to_merge === 1 && q.parameters.max_entries_to_merge === 1
  && q.parameters.min_entries_to_merge_wait_minutes === 0 && q.parameters.check_response_timeout_minutes === 60;

export function run() {
  // Each test can fail: both sides of a sample.
  const q = { type: 'merge_queue', parameters: { merge_method: 'SQUASH', grouping_strategy: 'ALLGREEN', max_entries_to_build: 1, min_entries_to_merge: 1, max_entries_to_merge: 1, min_entries_to_merge_wait_minutes: 0, check_response_timeout_minutes: 60 } };
  assert.equal(queues({ rules: [q, { type: 'deletion' }] }).length, 1);
  assert.equal(queues({ rules: [{ type: 'deletion' }] }).length, 0);
  assert.equal(asLive(q), true);
  assert.equal(asLive({ ...q, parameters: { ...q.parameters, merge_method: 'MERGE' } }), false);
  assert.equal(asLive({ ...q, parameters: { ...q.parameters, max_entries_to_merge: 5 } }), false);

  const sources = Object.fromEntries(readdirSync(RS).filter((f) => f.endsWith('.json')).map((f) => [f.replace(/\.json$/, ''), JSON.parse(readFileSync(join(RS, f), 'utf8'))]));
  const promoting = queues(sources.promoting);
  assert.equal(promoting.length, 1, 'the promoting source does not hold exactly one merge queue: a promotion lands outside the queue');
  assert.equal(asLive(promoting[0]), true, 'the queue of the promoting source is not the queue the live promotion ruleset has');
  assert.deepEqual(sources.promoting.conditions.ref_name.include, ['~DEFAULT_BRANCH'], 'the promoting source is not on the default branch');
  for (const [name, ruleset] of Object.entries(sources)) if (name !== 'promoting') assert.equal(queues(ruleset).length, 0, `the ${name} source holds a merge queue`);

  const controls = readFileSync(join(RS, 'controls.md'), 'utf8');
  const row = controls.split('\n').find((l) => /^\|\s*promoting\s*\|/.test(l));
  assert.ok(row && /merge_queue/.test(row), 'the promoting row of the table of controls does not list the merge queue');
  assert.doesNotMatch(controls.split('\n')[2] ?? '', /merge queue/, 'the table still says the merge queue is enforced by the old rulesets');
}
