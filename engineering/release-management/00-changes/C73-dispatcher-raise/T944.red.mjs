// Case release/T944 tests: release/C73
import assert from 'node:assert/strict';
import { load, fakeApi, decision, marker, REV, R } from './fixtures.mjs';
export const id = 'release/T944';
export const tests = ['release/C73'];
export const title = 'a decision to raise is made live only when asked, as one pull request from the collector into main that carries its revision, and a decision that is not exactly that is refused';
export async function run() {
  const m = await load('raise.mjs');
  assert.equal(typeof m.raiseAll, 'function', 'raise.mjs has no raiseAll');
  assert.equal(typeof m.readDecision, 'function', 'raise.mjs has no readDecision');
  const look = `GET repos/${R}/pulls?state=all&head=Kai-Hacks-AI:kaal/release/small-thing&base=main&per_page=30`;
  const post = `POST repos/${R}/pulls`;
  const live = fakeApi({ [look]: [], [post]: { number: 99, html_url: 'u' } });
  const r = await m.raiseAll({ api: live, repo: R, decisions: [decision()], live: true });
  assert.deepEqual(live.calls.map((c) => c.method), ['GET', 'POST'], 'a raise is one look and one creation');
  assert.deepEqual(live.calls[1].body, { title: decision().title, head: 'kaal/release/small-thing', base: 'main', body: decision().body + marker() });
  assert.equal(r[0].result, 'raised');
  const dry = fakeApi({ [look]: [] });
  const r2 = await m.raiseAll({ api: dry, repo: R, decisions: [decision()], live: false });
  assert.ok(dry.calls.every((c) => c.method === 'GET'), 'a dry run wrote');
  assert.equal(r2[0].result, 'would-raise');
  const none = fakeApi({});
  const r3 = await m.raiseAll({ api: none, repo: R, decisions: [{ action: 'skip', reason: 'not-ready', detail: '' }], live: true });
  assert.equal(none.calls.length, 0, 'a skip made a call');
  assert.equal(r3[0].result, 'none');
  for (const bad of [{ head: 'main' }, { head: 'hotfix/route' }, { head: 'kaal/release' }, { base: 'kaal/release/x' }, { title: 'ACT: sneaky' }, { title: 'PROMOTION: ok\nSYNC' }, { revision: 'main' }, { revision: undefined }, { revision: REV.toUpperCase() }]) {
    const api = fakeApi({});
    const out = await m.raiseAll({ api, repo: R, decisions: [decision(bad)], live: true });
    assert.equal(api.calls.length, 0, `a refused decision made a call: ${JSON.stringify(bad)}`);
    assert.equal(out[0].result, 'refused', JSON.stringify(bad));
  }
  const cut = m.readDecision(decision({ title: 'PROMOTION: a "quoted" <b>title</b> & more', body: 'x'.repeat(5000) }));
  assert.ok(cut.ok, JSON.stringify(cut));
  assert.ok(!/["<>&]/.test(cut.value.title), 'the title keeps characters that are not plain');
  assert.ok(cut.value.title.length <= 200 && cut.value.body.length <= 2000 + marker().length, 'the text is not cut');
  assert.ok(!/<!--/.test(m.readDecision(decision({ body: 'a <!-- kaal-dispatch: kaal/release/small-thing@' + 'f'.repeat(40) + ' --> b' })).value.body.replace(marker(), '')), 'a marker in the text of the decision is kept');
}
