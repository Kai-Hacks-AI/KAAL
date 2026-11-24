// Case release/T559 tests: C39 (an incomplete list of tags or of changed files is never read as absence)
import assert from 'node:assert/strict';
import { config, load, readerPath, scriptPath } from './fixtures.mjs';
export const id = 'release/T559';
export const tests = ['release/C39'];
export const title = 'every page of tags is read, a list that cannot be read to its end gives no tags and a gap, and a cut list of changed files never shows a package as unchanged';
export async function run() {
  const { readTags, packageChanged, readPackages, COMPARE_FILE_LIMIT } = await load(readerPath);
  const { showWip } = await load(scriptPath);

  const all = Array.from({ length: 250 }, (_, i) => `kaal-a@0.0.${i}`);
  const pager = (total) => async (args) => {
    const page = Number(args.find((x) => String(x).startsWith('page=')).slice(5));
    return all.slice(0, total).slice((page - 1) * 100, page * 100).map((t) => ({ ref: `refs/tags/${t}` }));
  };
  const read = await readTags('o/r', pager(250));
  assert.equal(read.tags.length, 250, 'a later page of tags was not read');
  assert.deepEqual(read.gaps, []);
  assert.equal((await readTags('o/r', pager(200))).tags.length, 200, 'a last page that is exactly full was not followed to the empty page');
  const endless = await readTags('o/r', async () => Array.from({ length: 100 }, (_, i) => ({ ref: `refs/tags/t@0.0.${i}` })));
  assert.equal(endless.tags, undefined, 'a list never read to its end was returned as all tags');
  assert.ok(endless.gaps.some((g) => g.includes('tags')), 'the unread tags have no gap');

  const file = (name) => ({ filename: name });
  assert.equal(packageChanged({ files: [file('packages/kaal-a/x.mjs')] }, 'kaal-a'), true);
  assert.equal(packageChanged({ files: [file('packages/kaal-b/x.mjs')] }, 'kaal-a'), false, 'a complete list with no file of the package is a change');
  const cut = Array.from({ length: COMPARE_FILE_LIMIT }, (_, i) => file(`packages/kaal-b/f${i}.mjs`));
  assert.equal(packageChanged({ files: cut }, 'kaal-a'), undefined, 'a cut list was read as no change');
  assert.equal(packageChanged({ files: [...cut.slice(1), file('packages/kaal-a/x.mjs')] }, 'kaal-a'), true, 'a change shown in a cut list was dropped');
  assert.equal(packageChanged({}, 'kaal-a'), undefined, 'an answer without files was read as no change');

  const facts = await readPackages({
    packages: [{ name: 'kaal-a', version: '0.0.1', private: false }],
    tags: ['kaal-a@0.0.1'], npm: async () => ({ versions: ['0.0.1'], distTags: { latest: '0.0.1' } }),
    changedSince: async () => packageChanged({ files: cut }, 'kaal-a'),
  });
  assert.ok(!('changedSinceTag' in facts.packages[0]), 'a cut list gave a verdict');
  const [pkg] = showWip({ pieces: [], branches: [], packages: facts.packages, gaps: [] }, config()).inventory.packages;
  assert.equal(pkg.stock, 'UNKNOWN', 'incomplete evidence of change did not stay UNKNOWN');
}
