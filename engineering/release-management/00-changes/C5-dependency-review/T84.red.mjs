// Case release/T84 tests: release/G24
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T84';
export const tests = ['release/G24'];
export const title = 'gap release/G24 is closed: the control asks for no ruleset line and is bound through the aggregates';
export function run() {
  const needs = JSON.parse(read(join(cap, '00-changes/C5-dependency-review/ruleset-needs.json'), 'ruleset-needs.json'));
  assert.deepEqual(needs.per_control_contexts, [], 'the control asks for a ruleset line of its own');
  const aggregates = (needs.bound_through ?? []).map((b) => b.aggregate).sort();
  assert.deepEqual(aggregates, ['guard Integration', 'guard Promotion'], 'the aggregates of the two places are not named');
}
