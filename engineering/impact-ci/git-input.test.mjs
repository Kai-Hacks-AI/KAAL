import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readTargetSnapshot, authorityFromGit } from './git-input.mjs';
import { fixture } from './full-fixtures.mjs';
import { establishFullMatrix } from './full-policy.mjs';
import { execute } from 'kaal-hosting';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
  const revision = await execute('git', ['rev-parse', 'HEAD'], { cwd: root });
  assert.equal(revision.status, 0);
  const head = revision.stdout.trim();
  const raw = await execute('git', ['cat-file', 'commit', head], { cwd: root });
  assert.equal(raw.status, 0);
  const headers = raw.stdout.split('\n\n')[0].split('\n');
  const tree = headers.find(l => l.startsWith('tree ')).slice(5);
  const parents = headers.filter(l => l.startsWith('parent ')).map(l => l.slice(7));
  const f = fixture('push', 'main');
  const context = { ...f.context, baseSha: head, headSha: head, testedSha: head,
    governanceSha: head, publicationSha: head, testedTreeSha: tree, parents };
  assert.ok(await authorityFromGit(root, context));
  await assert.rejects(authorityFromGit(root, { ...context, testedTreeSha: 'f'.repeat(40) }), /proof differs/);
  await assert.rejects(authorityFromGit(root, { ...context, parents: ['f'.repeat(40)] }), /proof differs/);
});
test('depth-one checkout preserves commit parent proof without reading parent objects', async () => {
  const temporary = mkdtempSync(join(tmpdir(), 'kaal-full-proof-'));
  try {
    const cloned = await execute('git', ['clone', '--quiet', '--no-local', '--depth=1', root, temporary], { cwd: root });
    assert.equal(cloned.status, 0, cloned.stderr);
    const shallow = await execute('git', ['rev-parse', '--is-shallow-repository'], { cwd: temporary });
    assert.equal(shallow.stdout.trim(), 'true');
    const revision = await execute('git', ['rev-parse', 'HEAD'], { cwd: temporary });
    const head = revision.stdout.trim();
    const raw = await execute('git', ['cat-file', 'commit', head], { cwd: temporary });
    const headers = raw.stdout.split('\n\n')[0].split('\n');
    const tree = headers.find(l => l.startsWith('tree ')).slice(5);
    const parents = headers.filter(l => l.startsWith('parent ')).map(l => l.slice(7));
    assert.ok(parents.length > 0, 'the fixture must have actual recorded parents');
    const missingParent = await execute('git', ['cat-file', '-e', `${parents[0]}^{commit}`], { cwd: temporary });
    assert.notEqual(missingParent.status, 0, 'fixture must not silently become a full-history clone');
    const f = fixture('push', 'main');
    const context = { ...f.context, baseSha: head, headSha: head, testedSha: head, governanceSha: head,
      publicationSha: head, testedTreeSha: tree, parents };
    assert.ok(await authorityFromGit(temporary, context));
    await assert.rejects(authorityFromGit(temporary, { ...context, parents: [] }), /proof differs/);
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});
