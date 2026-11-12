// Case pull/T16 tests: pull/F19 (a gap that bears on no judgment)
import assert from 'node:assert/strict';
import { declaration, facts, flow, lifecycle, promotion, pullPromotion } from './fixtures.mjs';
export const id = 'pull/T16';
export const tests = ['pull/F19'];
export const title = 'a gap that bears on no judgment, such as a limitation of the model, stays visible as not blocking and does not prevent READY; no gap is dropped, and a blocking one is not hidden among them';
export async function run() {
  const unrelated = [{ subject: 'publishing', missing: 'not modelled' }, { subject: 'release/C99', missing: 'a hotfix route is not read' }];
  const base = { pieces: [...lifecycle(), promotion(20)] };
  for (const where of ['facts', 'flow']) {
    const result = await pullPromotion(facts({ ...base, ...(where === 'facts' ? { gaps: unrelated } : {}) }), declaration(), flow(where === 'flow' ? { notJudged: unrelated } : {}));
    assert.equal(result.verdict, 'READY', `${where}: an unrelated limitation prevented READY`);
    assert.ok(result.judgments.every((j) => j.status === 'PASS' && j.missing.length === 0), `${where}: a judgment was touched by an unrelated gap`);
    for (const gap of unrelated) {
      const entries = result.notJudged.filter((n) => n.subject === gap.subject);
      assert.equal(entries.length, 1, `${where}: ${gap.subject} is dropped or duplicated`);
      assert.equal(entries[0].blocking, false);
      assert.equal(entries[0].affects, null);
      assert.equal(entries[0].missing, gap.missing, 'the gap lost what it says is missing');
    }
  }

  // visible and blocking are told apart in one verdict: the relevant one blocks, the unrelated one stays visible
  const mixed = await pullPromotion(facts({ ...base, gaps: [...unrelated, { subject: 'guard', missing: 'unread' }] }), declaration(), flow());
  assert.equal(mixed.verdict, 'NOT JUDGED');
  assert.deepEqual(mixed.notJudged.filter((n) => n.blocking).map((n) => n.subject), ['guard']);
  assert.deepEqual(mixed.notJudged.filter((n) => !n.blocking).map((n) => n.subject).sort(), ['publishing', 'release/C99']);
}
