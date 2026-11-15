// Case pull/T432 tests: pull/F52
import assert from 'node:assert/strict';
export const id = 'pull/T432';
export const tests = ['pull/F52', 'pull/F53'];
export const title = 'the adapter builds stock items from registered stock and derives IN only once a delivery PR exists';

export async function run() {
  const mod = await import('../../../../engineering/release-management/05-src/pull-promotion/gather.mjs');
  // The class routes come from the Engineering-owned kaal-pull.json (pull/C14), never from the adapter.
  const naming = { 'hotfix/': 'HOTFIX', 'wire/': 'WIRE', 'kaal/': 'KAAL' };
  const done = (sha, name, conclusion = 'success') => ({ sha, name, status: 'completed', conclusion });
  const heads = ['hotfix/x', 'wire/y', 'kaal/a/b', 'feature/z', 'claude/t', 'hotfix/'].map((ref, i) => ({ ref, sha: `s${i}` }));
  const f0 = mod.toFacts({ heads, prs: [], checks: [], destination: { required: [] }, naming, registrations: [], stocks: { 'cap-a': ['hotfix/x', 'wire/y', 'kaal/a/b'] } });
  assert.deepEqual(f0.candidates.map((c) => [c.class, c.id, c.name, c.revision, c.stock]), [['HOTFIX', 'hotfix/x', 'x', 's0', 'cap-a'], ['WIRE', 'wire/y', 'y', 's1', 'cap-a'], ['KAAL', 'kaal/a/b', 'a/b', 's2', 'cap-a']], 'only branches of registered stock are items');
  const issue = mod.toFacts({ heads, prs: [{ number: 5, base: 'main', head: { ref: 'hotfix/x', sha: 's0' } }], issues: [{ number: 9, title: 'kaal/z' }], checks: [], destination: { required: [] }, naming, registrations: [], stocks: { 'cap-a': ['hotfix/x'] } });
  assert.deepEqual(issue.candidates.map((c) => c.id), ['hotfix/x'], 'an issue or a PR became a stock item');
  const alt = mod.toFacts({ heads, prs: [], checks: [], destination: { required: [] }, naming: { 'feature/': 'KAAL' }, registrations: [], stocks: { 'cap-a': ['feature/z'] } });
  assert.deepEqual(alt.candidates.map((c) => c.id), ['feature/z'], 'the adapter used a literal prefix');
  const inn = (prs, checks, destination) => {
    const f = mod.toFacts({ heads: [{ ref: 'wire/y', sha: 'h' }], prs, checks, destination, naming, registrations: [], stocks: { 'cap-a': ['wire/y'] } });
    return f.verdicts.find((v) => v.side === 'in' && v.candidate === 'wire/y');
  };
  const pr = (sha) => [{ number: 1, base: 'main', head: { ref: 'wire/y', sha } }];
  const req = { required: ['A', 'B'] };
  assert.equal(inn([], [done('h', 'A'), done('h', 'B')], req)?.verdict ?? 'UNKNOWN', 'UNKNOWN', 'no delivery PR means no IN verdict');
  assert.equal(inn([], [], req), undefined, 'an IN verdict was invented before the pull');
  assert.equal(inn(pr('old'), [done('h', 'A'), done('h', 'B')], req)?.verdict ?? 'UNKNOWN', 'UNKNOWN', 'a PR at another revision');
  assert.equal(inn(pr('h'), [done('h', 'A'), done('h', 'B')], undefined)?.verdict ?? 'UNKNOWN', 'UNKNOWN', 'unreadable required checks');
  assert.equal(inn(pr('h'), [done('h', 'A'), done('h', 'B')], req).verdict, 'PASS');
  assert.equal(inn(pr('h'), [done('h', 'A'), done('h', 'B', 'failure')], req).verdict, 'FAIL');
  assert.equal(inn(pr('h'), [done('h', 'A')], req)?.verdict ?? 'UNKNOWN', 'UNKNOWN', 'a required context missing');
  assert.equal(inn(pr('h'), [done('h', 'A'), done('other', 'B')], req)?.verdict ?? 'UNKNOWN', 'UNKNOWN', 'a run at another revision');
  assert.equal(inn(pr('h'), [done('h', 'A')], { required: ['A'] }).verdict, 'PASS', 'a different required list, a different result');
}
