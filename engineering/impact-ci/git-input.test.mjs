import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readTargetSnapshot, authorityFromGit } from './git-input.mjs';
import { fixture } from './full-fixtures.mjs';
import { establishFullMatrix } from './full-policy.mjs';
import { execute } from 'kaal-hosting';
const root = process.cwd();
test('offline source adapter reads exact committed target bytes, not mutable working tree', async () => {
  const head = await execute('git', ['rev-parse', 'HEAD'], { cwd: root });
  assert.equal(head.status, 0);
  const revision = head.stdout.trim();
  const s = await readTargetSnapshot(root, revision), f = fixture();
  assert.ok(establishFullMatrix({ ...f.context, baseSha: revision, parents: [revision, f.context.headSha] }, s));
});
test('mutable refs and option-like revision inputs are refused', async () => {
  await assert.rejects(readTargetSnapshot(root, 'HEAD'), /immutable/);
  await assert.rejects(readTargetSnapshot(root, '--help'), /immutable/);
});
test('fixture-only candidate SHA cannot masquerade as proven Git execution bytes', async () => {
  await assert.rejects(authorityFromGit(root, fixture().context), /unavailable|unknown/);
});
test('Git adapter accepts actual object facts and discriminates altered tree/parent facts', async () => {
  const result = await execute('git', ['show', '-s', '--format=%H%n%T%n%P', 'HEAD'], { cwd: root });
  assert.equal(result.status, 0);
  const [head, tree, parents] = result.stdout.trim().split('\n');
  const f = fixture('push', 'main');
  const context = { ...f.context, baseSha: head, headSha: head, testedSha: head,
    governanceSha: head, publicationSha: head, testedTreeSha: tree, parents: parents.split(' ') };
  assert.ok(await authorityFromGit(root, context));
  await assert.rejects(authorityFromGit(root, { ...context, testedTreeSha: 'f'.repeat(40) }), /proof differs/);
  await assert.rejects(authorityFromGit(root, { ...context, parents: ['f'.repeat(40)] }), /proof differs/);
});
