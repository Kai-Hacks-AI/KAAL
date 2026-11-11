// Case release/T21 tests: release/A7
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { judge } from '../../../../../../05-src/plan/judge.mjs';
import { readPullRequest, readTree, readTreeFromDisk } from '../../../../../../05-src/plan/reader.mjs';
export const id = 'release/T21';
export const tests = ['release/A7'];
export const title = 'the reader extracts title, body, commits and changed files, and builds the plan model from the tree with each Case found at its folder';
const root = join(dirname(fileURLToPath(import.meta.url)), '../../../../../..');
test(`${id} ${title}`, async () => {
  const pr = readPullRequest({
    title: 'release/C1 PLAN: x', body: 'Driven-by: release/C1',
    commits: [{ sha: 'a1', message: 'release/C1 PLAN: x\n\nDriven-by: release/C1' }],
    files: [{ filename: 'engineering/release-management/README.md', status: 'modified' }],
  });
  assert.equal(pr.title, 'release/C1 PLAN: x');
  assert.equal(pr.body, 'Driven-by: release/C1');
  assert.deepEqual(pr.commits.map((c) => c.sha), ['a1']);
  assert.deepEqual(pr.files.map((f) => f.filename), ['engineering/release-management/README.md']);
  assert.ok(readPullRequest({ title: 'only a title' }).unreadable, 'a pull request without body, commits or files is unreadable');

  const plan = readTree([
    { path: '01-intent/I1-x/I1.md', text: '---\nid: release/I1\ntitle: x\n---\n# x' },
    { path: '02-requirements/F1-y/F1.md', text: '---\nid: release/F1\ntitle: y\nserves: [release/I1]\n---\n# y' },
    { path: '02-requirements/F1-y/T2.red.mjs', text: "export const id = 'release/T2';\nexport const tests = ['release/F1'];" },
    { path: '00-changes/C1-z/C1.md', text: '---\nid: release/C1\ntitle: z\nimplements: [release/I1]\ncloses: [release/G1]\n---\n# z' },
    { path: '00-changes/C1-z/gap.md', text: '| Gap | Target | Baseline | Gap |\n| --- | --- | --- | --- |\n| release/G1 | F1 | none | absent |' },
  ]);
  assert.deepEqual(plan.intents.map((n) => n.id), ['release/I1']);
  assert.deepEqual(plan.requirements[0].serves, ['release/I1']);
  assert.deepEqual(plan.changes[0].closes, ['release/G1']);
  assert.deepEqual(plan.gaps.map((g) => g.id), ['release/G1']);
  assert.deepEqual(plan.cases, [{ id: 'release/T2', tests: ['release/F1'], found: 'release/F1' }]);

  // The real tree of this capability reads, and the judgment of it asks only for evidence it does not hold yet.
  const real = readTreeFromDisk(root);
  assert.ok(real.cases.length >= 24 && real.gaps.length === 9);
  const verdict = await judge({ ...real, evidence: undefined });
  assert.ok(verdict.findings.every((f) => f.rule === 'F1/6' && f.status === 'unknown'), JSON.stringify(verdict.findings));
});
