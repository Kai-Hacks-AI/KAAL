// Case release/T558 tests: C39 (the reader: branches, tags, npmjs, and what it could not read)
import assert from 'node:assert/strict';
import { load, readerPath } from './fixtures.mjs';
export const id = 'release/T558';
export const tests = ['release/C39'];
export const title = 'the reader lists every branch, reads package tags and npmjs for each package including private ones, takes @kaihacksai/<name>@<version> (and a still unscoped <name>@<version>) from a tag, and names a gap for what it could not read';
export async function run() {
  const { readBranches, readPackages, parseTag } = await load(readerPath);
  assert.deepEqual(parseTag('kaal-core@0.0.1'), { name: 'kaal-core', version: '0.0.1' });
  assert.deepEqual(parseTag('@kaihacksai/kaal-guard@0.0.4-rc.2'), { name: '@kaihacksai/kaal-guard', version: '0.0.4-rc.2' }, 'a scoped package name is split wrongly');
  assert.equal(parseTag('v1.0.0'), null, 'a tag that is no <package>@<version> is a package tag');

  const pages = { '': { names: ['a', 'b'], next: 'c1' }, c1: { names: ['c'], next: null } };
  const gh = async (args) => { const after = (args.find((x) => String(x).startsWith('after=')) ?? 'after=').slice(6); const p = pages[after]; return { nodes: p.names.map((name) => ({ name })), next: p.next }; };
  const { branches, gaps } = await readBranches('o/r', gh);
  assert.deepEqual(branches.map((b) => b.name), ['a', 'b', 'c'], 'a later page of branches is dropped');
  assert.deepEqual(gaps, []);
  const failing = await readBranches('o/r', async () => { throw new Error('gateway'); }).then(() => 'read', (e) => e.message);
  assert.match(failing, /gateway/, 'a failed read is not reported');

  const pkgs = [{ name: 'kaal-a', version: '0.0.1', private: true }, { name: 'kaal-b', version: '0.0.1', private: false }, { name: 'kaal-c', version: '0.0.1', private: false }];
  const out = await readPackages({ packages: pkgs, tags: ['kaal-a@0.0.1', 'kaal-c@0.0.1', 'other-tag'], npm: async (name) => (name === 'kaal-a' ? null : { versions: ['0.0.1'], distTags: { latest: '0.0.1' } }), changedSince: async (name) => name === 'kaal-c' });
  assert.equal(out.packages[0].published, null, 'a never-published private package was not read as unpublished');
  assert.deepEqual(out.packages[0].tags, ['0.0.1']);
  assert.deepEqual(out.packages[1].published, { versions: ['0.0.1'], distTags: { latest: '0.0.1' } }, 'every published version and dist-tag is read, not latest alone');
  assert.ok(!('changedSinceTag' in out.packages[1]), 'a package with no tag was compared with a tag');
  assert.deepEqual(out.packages[2].tags, ['0.0.1']);
  assert.equal(out.packages[2].changedSinceTag, true, 'the package-specific comparison was not read');
  assert.deepEqual(out.packages[1].tags, [], 'a tag of another package was attached');
  const lost = await readPackages({ packages: pkgs, tags: undefined, npm: async () => { throw new Error('npmjs down'); }, changedSince: async () => undefined });
  assert.ok(lost.gaps.some((g) => g.includes('npmjs')) && lost.gaps.some((g) => g.includes('tags')), 'what could not be read is not named');
  assert.ok(!('published' in lost.packages[0]) && !('tags' in lost.packages[0]), 'an unread fact was filled in');
}
