// Case release/T754 tests: release/C58
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const MODULE = join(repo, 'engineering/release-management/05-src/sync-review/verify.mjs');
export const id = 'release/T754';
export const tests = ['release/C58'];
export const title = 'verify Sync passes only a pure merge of main at its exact head, fails with every false condition named, and is UNKNOWN for a fact it cannot read';
const A = 'a'.repeat(40), M = 'b'.repeat(40), H = 'c'.repeat(40), T = 'd'.repeat(40);
const good = () => ({
  base: { ref: 'kaal/release/x', tip: A },
  head: { sha: H, parents: [A, M], tree: T },
  currentHead: H,
  merge: { clean: true, tree: T },
  secondParentOnMain: true,
  advances: true,
  added: [H],
  reason: 'to unblock development',
});
export async function run() {
  assert.ok(existsSync(MODULE), 'verify.mjs is absent');
  const { verifySync } = await import(pathToFileURL(MODULE).href);
  const pass = verifySync(good());
  assert.equal(pass.control, 'verify Sync');
  assert.equal(pass.outcome, 'PASS');
  assert.equal(pass.passes, true);
  assert.deepEqual(pass.reasons, []);
  assert.deepEqual(pass.analyzed, { base: { ref: 'kaal/release/x', tip: A }, head: H, parents: [A, M], mergeTree: T, added: [H] });
  for (const ref of ['kaal/release/x', 'hotfix/a', 'wire/a']) assert.equal(verifySync({ ...good(), base: { ref, tip: A } }).outcome, 'PASS', `${ref} is an integration base`);
  const cases = {
    'not-integration-base': (f) => { f.base.ref = 'main'; },
    'not-a-merge-commit': (f) => { f.head.parents = [A]; },
    'first-parent-not-base-tip': (f) => { f.head.parents = [M, A]; },
    'second-parent-not-on-main': (f) => { f.secondParentOnMain = false; },
    'does-not-advance': (f) => { f.advances = false; },
    'merge-conflicts': (f) => { f.merge = { clean: false, tree: null }; },
    'tree-differs-from-clean-merge': (f) => { f.head.tree = 'e'.repeat(40); },
    'extra-commits': (f) => { f.added = [H, 'f'.repeat(40)]; },
    'no-reason': (f) => { f.reason = ''; },
    'head-moved': (f) => { f.currentHead = '9'.repeat(40); },
  };
  for (const [code, mutate] of Object.entries(cases)) {
    const f = good(); mutate(f);
    const r = verifySync(f);
    assert.equal(r.outcome, 'FAIL', `${code} does not fail`);
    assert.equal(r.passes, false);
    assert.ok(r.reasons.some((x) => x.code === code && typeof x.detail === 'string' && x.detail), `${code} is not named with a detail`);
  }
  const two = good(); two.advances = false; two.reason = null;
  assert.deepEqual(verifySync(two).reasons.map((x) => x.code).sort(), ['does-not-advance', 'no-reason'], 'every false condition is named');
  for (const missing of ['merge', 'secondParentOnMain', 'advances', 'added', 'head', 'base']) {
    const f = good(); delete f[missing];
    const r = verifySync(f);
    assert.equal(r.outcome, 'UNKNOWN', `${missing} missing is not UNKNOWN`);
    assert.equal(r.passes, false);
  }
  assert.equal(verifySync(undefined).outcome, 'UNKNOWN');
  assert.equal(verifySync(null).passes, false);
}
