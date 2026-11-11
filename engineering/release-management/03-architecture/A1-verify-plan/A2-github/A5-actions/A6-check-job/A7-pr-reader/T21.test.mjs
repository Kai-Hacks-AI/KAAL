// Case release/T21 tests: release/A7
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
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

  // Input the reader cannot read is reported as unreadable, never dropped: the judgment then answers UNKNOWN with a Recovery.
  const good = { path: '01-intent/I1-x/I1.md', text: '---\nid: release/I1\n---\n# x' };
  const broken = {
    'a malformed node id': { path: '02-requirements/F9-x/F9.md', text: '---\nid: F999\nserves: []\n---\n' },
    'a node of an unknown kind': { path: '02-requirements/Z1-x/Z1.md', text: '---\nid: release/Z1\n---\n' },
    'front matter that cannot be parsed': { path: '02-requirements/F9-x/F9.md', text: '---\nid: release/F9\n  - broken\n---\n' },
    'a Case without an id': { path: '02-requirements/F1-y/T3.red.mjs', text: "export const tests = ['release/F1'];" },
    'a Case without tests': { path: '02-requirements/F1-y/T3.red.mjs', text: "export const id = 'release/T3';" },
  };
  for (const [what, file] of Object.entries(broken)) {
    const unreadable = readTree([good, file]);
    assert.ok(unreadable.unreadable, `${what} is unreadable`);
    const result = await judge(unreadable);
    assert.equal(result.verdict, 'UNKNOWN', what);
    assert.ok(result.findings.every((f) => f.status === 'unknown' && f.recovery), what);
  }
  const scratch = mkdtempSync(join(tmpdir(), 'verify-plan-reader-'));
  writeFileSync(join(scratch, 'file.md'), 'x');
  assert.ok(readTreeFromDisk(join(scratch, 'file.md')).unreadable, 'a path that is not a folder is unreadable');
  assert.ok(readTreeFromDisk(join(scratch, 'missing')).unreadable, 'a missing folder is unreadable');
});
