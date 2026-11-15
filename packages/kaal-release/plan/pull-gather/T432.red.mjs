// Case pull/T432 tests: pull/F52
import assert from 'node:assert/strict';
export const id = 'pull/T432';
export const tests = ['pull/F52'];
export const title = 'the adapter maps this installation to declared classes and derives IN from the destination checks';

export async function run() {
  const mod = await import('../../../../engineering/release-management/05-src/pull-promotion/gather.mjs');
  const naming = { 'hotfix/': 'HOTFIX', 'wire/': 'WIRE', 'kaal/': 'KAAL' };
  const done = (sha, name, conclusion = 'success') => ({ sha, name, status: 'completed', conclusion });
  const heads = ['hotfix/x', 'wire/y', 'kaal/a/b', 'feature/z', 'claude/t', 'hotfix/'].map((ref, i) => ({ ref, sha: `s${i}` }));
  const f0 = mod.toFacts({ heads, prs: [], checks: [], destination: { required: [] }, naming, registrations: [] });
  assert.deepEqual(f0.candidates.map((c) => [c.class, c.id, c.name, c.revision]), [['HOTFIX', 'hotfix/x', 'x', 's0'], ['WIRE', 'wire/y', 'y', 's1'], ['KAAL', 'kaal/a/b', 'a/b', 's2']]);
  const inn = (prs, checks, destination) => {
    const f = mod.toFacts({ heads: [{ ref: 'wire/y', sha: 'h' }], prs, checks, destination, naming, registrations: [] });
    return f.verdicts.find((v) => v.side === 'in' && v.candidate === 'wire/y');
  };
  const pr = (sha) => [{ number: 1, base: 'main', head: { ref: 'wire/y', sha } }];
  const req = { required: ['A', 'B'] };
  assert.equal(inn([], [done('h', 'A'), done('h', 'B')], req)?.verdict ?? 'UNKNOWN', 'UNKNOWN', 'no delivery PR');
  assert.equal(inn(pr('old'), [done('h', 'A'), done('h', 'B')], req)?.verdict ?? 'UNKNOWN', 'UNKNOWN', 'a PR at another revision');
  assert.equal(inn(pr('h'), [done('h', 'A'), done('h', 'B')], undefined)?.verdict ?? 'UNKNOWN', 'UNKNOWN', 'unreadable required checks');
  assert.equal(inn(pr('h'), [done('h', 'A'), done('h', 'B')], req).verdict, 'PASS');
  assert.equal(inn(pr('h'), [done('h', 'A'), done('h', 'B', 'failure')], req).verdict, 'FAIL');
  assert.equal(inn(pr('h'), [done('h', 'A')], req)?.verdict ?? 'UNKNOWN', 'UNKNOWN', 'a required context missing');
  assert.equal(inn(pr('h'), [done('h', 'A'), done('other', 'B')], req)?.verdict ?? 'UNKNOWN', 'UNKNOWN', 'a run at another revision');
  assert.equal(inn(pr('h'), [done('h', 'A')], { required: ['A'] }).verdict, 'PASS', 'a different required list, a different result');
}
