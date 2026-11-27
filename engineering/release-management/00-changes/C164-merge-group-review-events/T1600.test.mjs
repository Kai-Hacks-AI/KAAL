// Case release/T1600 tests: release/C164. The judgment of a merge group's required checks is one pure function: waiting while a required context has no run or one not completed, red as soon as one completed without success, green only when every required context succeeded. Neutral and skipped count as success, and the judged context itself is left out.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const FILE = join(repo, 'engineering/release-management/05-src/merge-group/group-state.mjs');
export const id = 'release/T1600';
export const tests = ['release/C164'];
export const title = "the judgment of a merge group's required checks is one pure function: waiting, red or green";
export async function run() {
  assert.ok(existsSync(FILE), 'group-state.mjs is absent');
  const { groupState } = await import(pathToFileURL(FILE).href);
  assert.equal(typeof groupState, 'function', 'it exports no groupState');
  const run1 = (name, status, conclusion) => ({ name, status, conclusion });
  const required = ['Engineering', 'Workspaces', 'Change Isolation (review)'];
  const state = (runs) => groupState({ required, runs, self: 'Change Isolation (review)' }).state;
  assert.equal(state([]), 'waiting', 'no run is waiting');
  assert.equal(state([run1('Engineering', 'completed', 'success')]), 'waiting', 'a missing required context is waiting');
  assert.equal(state([run1('Engineering', 'completed', 'success'), run1('Workspaces', 'in_progress', null)]), 'waiting', 'an unfinished required context is waiting');
  assert.equal(state([run1('Engineering', 'completed', 'failure'), run1('Workspaces', 'in_progress', null)]), 'red', 'a failed required context is red even while another is pending');
  assert.equal(state([run1('Engineering', 'completed', 'success'), run1('Workspaces', 'completed', 'skipped')]), 'green', 'skipped counts as success and the judged context is left out');
  assert.equal(state([run1('Engineering', 'completed', 'neutral'), run1('Workspaces', 'completed', 'success')]), 'green', 'neutral counts as success');
  assert.equal(state([run1('Engineering', 'completed', 'cancelled'), run1('Workspaces', 'completed', 'success')]), 'red', 'cancelled is not success');
  assert.throws(() => groupState({ required: [], runs: [], self: 'x' }), /no other required check/, 'a group with nothing to wait for cannot be judged');
}
