// Case release/T950 tests: release/I40
import assert from 'node:assert/strict';
import { load, fakeApi, decision, REV, R } from './fixtures.mjs';
export const id = 'release/T950';
export const tests = ['release/I40'];
export const title = 'a PROMOTION is raised only for the exact revision that was evaluated: the tip is read right before the write, a collector that has moved is refused and left to the next decision, and a collector that moves during the write is reported, never hidden';
export async function run() {
  const m = await load('raise.mjs');
  assert.equal(typeof m.raiseAll, 'function', 'raise.mjs has no raiseAll');
  const C = 'kaal/release/small-thing', NEW = 'f'.repeat(40);
  const look = `GET repos/${R}/pulls?state=all&head=Kai-Hacks-AI:${C}&base=main&per_page=30`;
  const ref = `GET repos/${R}/git/ref/heads/${C}`, post = `POST repos/${R}/pulls`;
  // 1. the branch moved between the decision and the write: no write, in a live and in a dry run
  for (const live of [true, false]) {
    const api = fakeApi({ [look]: [], [ref]: { object: { sha: NEW } } });
    const r = await m.raiseAll({ api, repo: R, decisions: [decision()], live });
    assert.equal(r[0].result, 'moved', `live ${live}`);
    assert.ok(api.calls.every((c) => c.method === 'GET'), 'a collector that moved was raised');
  }
  // 2. the tip is read after the look and before the write, so it is the last thing known before the POST
  const order = fakeApi({ [look]: [], [ref]: { object: { sha: REV } }, [post]: { number: 9, html_url: 'u', head: { sha: REV } } });
  await m.raiseAll({ api: order, repo: R, decisions: [decision()], live: true });
  assert.deepEqual(order.calls.map((c) => `${c.method} ${c.path.includes('git/ref') ? 'ref' : c.path.includes('/pulls?') ? 'look' : 'pulls'}`), ['GET look', 'GET ref', 'POST pulls']);
  // 3. the branch moved during the write: the pull request that exists is reported with both revisions, nothing is hidden or repaired by a second write
  const during = fakeApi({ [look]: [], [ref]: { object: { sha: REV } }, [post]: { number: 9, html_url: 'u', head: { sha: NEW } } });
  const r3 = await m.raiseAll({ api: during, repo: R, decisions: [decision()], live: true });
  assert.equal(r3[0].result, 'raised-moved');
  assert.equal(r3[0].number, 9);
  assert.equal(r3[0].evaluated, REV);
  assert.equal(r3[0].found, NEW);
  assert.equal(during.calls.filter((c) => c.method !== 'GET').length, 1, 'a moved collector was answered with a second write');
  // 4. a collector that was deleted or cannot be read is not raised
  const gone = fakeApi({ [look]: [], [ref]: () => { throw Object.assign(new Error('Not Found'), { status: 404 }); } });
  const r4 = await m.raiseAll({ api: gone, repo: R, decisions: [decision()], live: true });
  assert.equal(r4[0].result, 'moved');
  assert.ok(gone.calls.every((c) => c.method === 'GET'));
  // 5. the decision step puts the tip it evaluated into the decision as its revision
  const d = await load('dispatch.mjs');
  assert.equal(typeof d.withRevision, 'function', 'dispatch.mjs has no withRevision');
  assert.equal(d.withRevision({ action: 'raise', head: C }, { tip: REV }).revision, REV);
  assert.equal(d.withRevision({ action: 'skip', reason: 'x' }, { tip: REV }).revision, undefined);
}
