// Case release/T949 tests: release/I40
import assert from 'node:assert/strict';
import { load, fakeApi, decision, marker, refused422, REV, R } from './fixtures.mjs';
export const id = 'release/T949';
export const tests = ['release/I40'];
export const title = 'raising is idempotent per collector revision: a retried or overlapping run never makes a second PROMOTION for the same state, also in the race between the look and the creation, and any other failure is not swallowed';
export async function run() {
  const m = await load('raise.mjs');
  assert.equal(typeof m.raiseAll, 'function', 'raise.mjs has no raiseAll');
  const C = 'kaal/release/small-thing';
  const look = `GET repos/${R}/pulls?state=all&head=Kai-Hacks-AI:${C}&base=main&per_page=30`;
  const post = `POST repos/${R}/pulls`;
  const ref = `GET repos/${R}/git/ref/heads/${C}`, tipAt = { object: { sha: REV } }, made = { number: 8, html_url: 'u', head: { sha: REV } };
  const posts = (api) => api.calls.filter((c) => c.method === 'POST').length;
  // 1. the look finds a PROMOTION of this revision, open, closed or merged: nothing is made
  for (const state of ['open', 'closed']) {
    const api = fakeApi({ [look]: [{ number: 7, state, body: 'x' + marker() }], [ref]: tipAt });
    const r = await m.raiseAll({ api, repo: R, decisions: [decision()], live: true });
    assert.equal(r[0].result, 'already-raised', state);
    assert.equal(posts(api), 0, `a PROMOTION that was ${state} was made again`);
  }
  // 2. the collector moved on: another revision is a new state and is raised
  const moved = fakeApi({ [look]: [{ number: 7, state: 'closed', body: 'x' + marker(C, 'f'.repeat(40)) }], [ref]: tipAt, [post]: made });
  assert.equal((await m.raiseAll({ api: moved, repo: R, decisions: [decision()], live: true }))[0].result, 'raised');
  // 3. the race: the look found nothing, yet the other run won the creation; the refusal of a second open PROMOTION is the answer, not a failure
  const raced = fakeApi({ [look]: [], [ref]: tipAt, [post]: () => { throw refused422(); } });
  const r3 = await m.raiseAll({ api: raced, repo: R, decisions: [decision()], live: true });
  assert.equal(r3[0].result, 'exists');
  assert.equal(posts(raced), 1, 'a refused creation was tried again');
  // 4. two overlapping runs against a GitHub that keeps one open pull request per head and base
  const prs = [];
  const gh = async (method, path, body) => {
    await new Promise((res) => setTimeout(res, 5));
    if (method === 'GET' && path.includes('git/ref')) return tipAt;
    if (method === 'GET') return prs.map((p) => ({ number: p.number, state: 'open', body: p.body }));
    if (prs.some((p) => p.head === body.head && p.base === body.base)) throw refused422();
    prs.push({ number: prs.length + 1, head: body.head, base: body.base, body: body.body });
    return { number: prs.length, html_url: 'u', head: { sha: REV } };
  };
  const both = await Promise.all([1, 2, 3].map(() => m.raiseAll({ api: gh, repo: R, decisions: [decision()], live: true })));
  assert.equal(prs.length, 1, 'overlapping runs made more than one PROMOTION');
  assert.deepEqual(both.map((x) => x[0].result).sort(), ['exists', 'exists', 'raised']);
  // 5. a run that made the PROMOTION and lost the answer is retried: the look finds it
  const retry = await m.raiseAll({ api: gh, repo: R, decisions: [decision()], live: true });
  assert.equal(retry[0].result, 'already-raised');
  assert.equal(prs.length, 1);
  // 6. any other failure is not swallowed
  for (const err of [Object.assign(new Error('Validation Failed: head is not a branch'), { status: 422 }), Object.assign(new Error('Server Error'), { status: 502 })]) {
    const api = fakeApi({ [look]: [], [ref]: tipAt, [post]: () => { throw err; } });
    await assert.rejects(() => m.raiseAll({ api, repo: R, decisions: [decision()], live: true }), /./, 'a failure was swallowed');
  }
}
