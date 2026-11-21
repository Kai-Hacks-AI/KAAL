// Case release/T1315 (release/C114): the newest event of a pull request decides its Branching verdict, and the verdict
// judges the auto-merge the pull request has when the run judges, not the auto-merge its event carried.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T1315';
export const tests = ['release/D2'];
export const title = 'Branching: the newest event decides, and auto-merge is read when the run judges';

const code = (text) => text.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');

// A run for an older event must not outlive a newer one: one group per pull request, and the older run is cancelled.
export const newestEventDecides = (workflow) => {
  const c = /^concurrency:\n((?:[ ]+.*\n)+)/m.exec(code(workflow));
  return !!c && /group:.*pull_request\.number/.test(c[1]) && /cancel-in-progress:\s*true/.test(c[1]);
};
// The auto-merge a verdict judges is the one the pull request has now. The event's copy of it is as old as the event.
export const autoMergeFromEvent = (workflow) => /KAAL_AUTO_MERGE:\s*\$\{\{\s*github\.event\.pull_request\.auto_merge/.test(code(workflow));
export const autoMergeReadAtRun = (workflow) => /gh api [^\n]*pulls\/\$\w+[^\n]*auto_merge/.test(code(workflow)) && /KAAL_AUTO_MERGE=/.test(code(workflow));

export function run() {
  // Each test can fail: both sides of a sample.
  const grouped = 'name: X\nconcurrency:\n  group: b-${{ github.event.pull_request.number }}\n  cancel-in-progress: true\njobs:\n';
  assert.equal(newestEventDecides(grouped), true);
  assert.equal(newestEventDecides('name: X\njobs:\n'), false);
  assert.equal(newestEventDecides(grouped.replace('true', 'false')), false);
  assert.equal(newestEventDecides(grouped.replace('.number', '.title')), false);
  assert.equal(autoMergeFromEvent('  KAAL_AUTO_MERGE: ${{ github.event.pull_request.auto_merge.merge_method }}'), true);
  assert.equal(autoMergeFromEvent('  # KAAL_AUTO_MERGE: ${{ github.event.pull_request.auto_merge.merge_method }}'), false);
  assert.equal(autoMergeReadAtRun('gh api "repos/$R/pulls/$NUMBER" --jq .auto_merge\necho KAAL_AUTO_MERGE=$M'), true);
  assert.equal(autoMergeReadAtRun('echo KAAL_AUTO_MERGE=$M'), false);

  const workflow = readFileSync(join(repo, '.github/workflows/lineage-synchronization.yml'), 'utf8');
  assert.equal(newestEventDecides(workflow), true, 'an older event\'s run can finish after a newer one and leave its failure as the verdict');
  assert.equal(autoMergeFromEvent(workflow), false, 'the verdict judges the auto-merge the event carried, which is older than the run');
  assert.equal(autoMergeReadAtRun(workflow), true, 'the auto-merge is not read from the pull request when the run judges');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) { run(); console.log('GREEN'); }
