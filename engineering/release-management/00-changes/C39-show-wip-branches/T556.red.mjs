// Case release/T556 tests: C39 (the package rule: not on npmjs)
import assert from 'node:assert/strict';
import { config, load, scriptPath } from './fixtures.mjs';
export const id = 'release/T556';
export const tests = ['release/C39'];
export const title = 'a package on main that is not on npmjs has 0.0.1 as next and main holds stock for it, a private one with a note; an unread fact is UNKNOWN';
export async function run() {
  const { showWip } = await load(scriptPath);
  const facts = {
    pieces: [], branches: [], gaps: [],
    packages: [
      { name: 'kaal-a', version: '0.0.1', private: false, published: null, tags: [] },
      { name: 'kaal-b', version: '0.0.1', private: true, published: null, tags: [] },
      { name: 'kaal-c', version: '0.0.1', private: false },
      { name: 'kaal-d', version: '0.0.1', private: false, published: null },
    ],
  };
  const [a, b, c, d] = showWip(facts, config()).inventory.packages;
  assert.deepEqual([a.state, a.next, a.stock], ['unpublished', '0.0.1', true]);
  assert.ok(!a.note, 'a public package carries a note');
  assert.equal(b.state, 'unpublished');
  assert.match(b.note ?? '', /private/, 'a private package has no note saying so');
  assert.equal(c.state, 'UNKNOWN'); assert.equal(c.stock, 'UNKNOWN');
  assert.match(c.reason, /published/, 'the unread npmjs fact is not named');
  assert.equal(d.state, 'UNKNOWN', 'unread tags were taken as none');
  assert.match(d.reason, /tags/);
}
