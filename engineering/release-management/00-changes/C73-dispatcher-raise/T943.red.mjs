// Case release/T943 tests: release/C73
import assert from 'node:assert/strict';
import { load, fakeApi, R } from './fixtures.mjs';
export const id = 'release/T943';
export const tests = ['release/C73'];
export const title = 'the facts of a collector are read by GET alone: the collectors by name, how far each is ahead of main, what merged into it and what is open from it';
export async function run() {
  const g = await load('gather.mjs'), d = await load('decide.mjs');
  assert.equal(typeof g.listCollectors, 'function', 'gather.mjs has no listCollectors');
  assert.equal(typeof g.gatherFacts, 'function', 'gather.mjs has no gatherFacts');
  const C = 'kaal/release/small-thing';
  const api = fakeApi({
    [`GET repos/${R}/git/matching-refs/heads/kaal/`]: [{ ref: `refs/heads/${C}` }, { ref: 'refs/heads/kaal/release' }, { ref: 'refs/heads/kaal/controls/other-thing' }, { ref: 'refs/heads/kaal/a/b/c' }],
    [`GET repos/${R}/compare/main...${C}`]: { ahead_by: 3 },
    [`GET repos/${R}/pulls?state=closed&base=${C}&per_page=30&sort=updated&direction=desc`]: [
      { number: 5, title: 'DO: x', body: '', merged_at: '2026-11-18T09:00:00Z' },
      { number: 7, title: 'ACT: something small (release/C99)', body: '## Change\n\nrelease/C99 something small\n', merged_at: '2026-11-18T10:00:00Z' },
      { number: 6, title: 'PLAN: closed, never merged', body: '', merged_at: null },
    ],
    [`GET repos/${R}/pulls?state=open&head=Kai-Hacks-AI:${C}&per_page=30`]: [{ number: 31, title: 'PROMOTION: y', base: { ref: 'main' }, head: { ref: C } }],
  });
  assert.deepEqual(await g.listCollectors(api, R), [C, 'kaal/controls/other-thing'], 'the collectors are not the branches kaal/<capability>/<concern>');
  const f = await g.gatherFacts(api, R, C);
  assert.equal(f.collector, C);
  assert.equal(f.aheadOfMain, 3);
  assert.deepEqual(f.merged.map((p) => p.number), [7, 5], 'merged is not the merged pull requests, newest first');
  assert.deepEqual(f.open, [{ number: 31, title: 'PROMOTION: y', base: 'main', head: C }]);
  assert.ok(api.calls.every((c) => c.method === 'GET'), 'a read made a write');
  assert.equal(d.decideRaise(f).reason, 'already-open', 'the gathered facts are not facts the decision understands');
}
