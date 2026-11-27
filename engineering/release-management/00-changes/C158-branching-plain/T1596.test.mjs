// Case release/T1596 tests: release/C158. A verdict that does not apply is never verification evidence. An entry answers `not-applicable` and writes no kaal-control record, for an ordinary Change in the synchronization entry and for a pull request an entry does not judge; a verdict that applies still writes its record, so the Case is not vacuous.
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const LINEAGE = join(repo, 'engineering/release-management/05-src/lineage');
export const id = 'release/T1596';
export const tests = ['release/C158'];
export const title = 'a Branching verdict that does not apply answers not-applicable and writes no record, so it cannot count as positive verification evidence';
export async function run() {
  const boundary = { x: 'real', run: '1', sha: 'a'.repeat(40) };
  const sync = await import(pathToFileURL(join(LINEAGE, 'judge-synchronization.mjs')).href);
  const sha = (c) => c.repeat(40);
  const ordinary = { defaultBranch: 'main', lineage: 'kaal/release/x', defaultTip: sha('a'), lineageTip: sha('b'), head: sha('c'), merged: null, marker: null, onLineageTip: true, carriesDefault: false, markerOnDefault: false, adopted: [], advances: false, incorporated: sha('d'), expected: { clean: true, tree: 'T', conflicts: [] }, differing: [] };
  const na = await sync.check(ordinary, { boundary });
  assert.equal(na.kind, 'not-applicable', 'an ordinary Change is not a synchronization');
  assert.equal(na.record, null, 'a verdict that does not apply writes no record');
  assert.notEqual(na.verdict, 'PASS', 'a verdict that does not apply is not a PASS');
  const valid = { ...ordinary, merged: sha('a'), onLineageTip: true, carriesDefault: true, markerOnDefault: true, advances: true };
  const pass = await sync.check(valid, { boundary });
  assert.equal(pass.kind, 'pass', 'a valid synchronization passes');
  assert.equal(pass.record?.verdict, 'PASS', 'a verdict that applies writes its record');
  // The command line: a pull request the entry does not judge prints no record and does not run the check.
  const { cli } = await import(pathToFileURL(join(LINEAGE, 'lib/answer.mjs')).href);
  const lines = [];
  const rc = await cli({ label: 'x', check: async () => { throw new Error('must not run'); }, applies: () => 'not this one', read: () => ({}), argv: ['--head', 'h', '--base-ref', 'main'], env: { KAAL_DEFAULT: 'main', GITHUB_RUN_ID: '1', GITHUB_SHA: sha('a') }, out: (l) => lines.push(l) });
  assert.equal(rc, 0);
  assert.ok(!lines.some((l) => l.startsWith('kaal-control')), 'a pull request that is not judged prints no record');
  // The command line: a verdict that does not apply, run by the entry, prints no record either.
  const lines2 = [];
  await cli({ label: 'y', check: (f, o) => sync.check(f, o), applies: () => true, read: () => ordinary, argv: ['--head', 'h', '--base-ref', 'kaal/release/x'], env: { KAAL_DEFAULT: 'main', GITHUB_RUN_ID: '1', GITHUB_SHA: sha('a') }, out: (l) => lines2.push(l) });
  assert.ok(!lines2.some((l) => l.startsWith('kaal-control')), 'a verdict that does not apply prints no record');
}
