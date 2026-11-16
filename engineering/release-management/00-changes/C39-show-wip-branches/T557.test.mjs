// Case release/T557 tests: C39 (the package rule: tags against npmjs)
import assert from 'node:assert/strict';
import { config, load, scriptPath } from './fixtures.mjs';
export const id = 'release/T557';
export const tests = ['release/C39'];
export const title = 'a tag equal to what npmjs has is current, any other tag is coming (a -rc.N one a release candidate), changes of the package itself after its tag are stock, not commits of the repository, a version published under any dist-tag counts as published, and no tag says nothing about advance';
export async function run() {
  const { showWip } = await load(scriptPath);
  const p = (name, o) => ({ name, version: '0.0.2', private: false, published: { versions: ['0.0.1'], distTags: { latest: '0.0.1' } }, ...o });
  const facts = {
    pieces: [], branches: [], gaps: [],
    packages: [
      p('current', { tags: ['0.0.1'], changedSinceTag: false }),
      p('beyond', { tags: ['0.0.1'], changedSinceTag: true }),
      p('unknown-beyond', { tags: ['0.0.1'] }),
      p('rc', { tags: ['0.0.1', '0.0.2-rc.1'], changedSinceTag: false }),
      p('tagged', { tags: ['0.0.1', '0.0.2'], changedSinceTag: false }),
      p('notag', { tags: [] }),
      p('othertag', { published: { versions: ['0.0.1', '0.0.2'], distTags: { latest: '0.0.1', next: '0.0.2' } }, tags: ['0.0.2'], changedSinceTag: false }),
      p('prerelease', { published: { versions: ['0.0.2-rc.1'], distTags: { next: '0.0.2-rc.1' } }, tags: ['0.0.2-rc.1'], changedSinceTag: false }),
    ],
  };
  const by = Object.fromEntries(showWip(facts, config()).inventory.packages.map((x) => [x.name, x]));
  assert.deepEqual([by.current.state, by.current.stock], ['current', false], 'a tag equal to npmjs and main not beyond it is not stock');
  assert.deepEqual([by.beyond.state, by.beyond.stock], ['current', true], 'changes of this package after its tag are stock');
  assert.deepEqual([by['unknown-beyond'].state, by['unknown-beyond'].stock], ['current', 'UNKNOWN'], 'an unread advance was guessed');
  assert.deepEqual([by.rc.state, by.rc.stock], ['coming', true]);
  assert.deepEqual(by.rc.coming, [{ tag: '0.0.2-rc.1', kind: 'release candidate' }], 'the release candidate is not named as coming');
  assert.deepEqual(by.tagged.coming, [{ tag: '0.0.2', kind: 'tagged, not on npmjs' }], 'a plain tag npmjs does not have is not coming');
  assert.deepEqual([by.notag.state, by.notag.stock], ['current', 'UNKNOWN'], 'no tag says where current ended, nothing may be guessed from package.json');
  assert.match(by.notag.reason, /no tag/);
  assert.deepEqual([by.othertag.state, by.othertag.stock], ['current', false], 'npmjs latest alone was taken as the published version: a version under another dist-tag is published too');
  assert.deepEqual([by.prerelease.state, by.prerelease.stock], ['current', false], 'a package whose only published version is a prerelease was not read as published');
}
