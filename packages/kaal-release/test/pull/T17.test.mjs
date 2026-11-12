// Case pull/T17 tests: pull/F19 on the representation analyze Flow actually emits (a gap is a string)
import assert from 'node:assert/strict';
import { collector, declaration, facts, flow, landed, lifecycle, promotion, pullPromotion, statuses } from './fixtures.mjs';
export const id = 'pull/T17';
export const tests = ['pull/F19'];
export const title = 'gaps in the representation analyze Flow emits, prose strings in facts.gaps and in notJudged, are neither dropped nor misclassified: relevant ones make their judgment UNKNOWN, ones outside the collector stay visible, and prose whose relevance cannot be established fails safe unless the declaration classifies it';
const ready = () => ({
  collectors: [collector('col-a'), collector('col-b')],
  pieces: [...lifecycle(), promotion(20), landed(190, 'PROMOTION', { change: 'c/C7', into: 'main', from: 'col-b' })],
});
// the wording follows what the supplier and the Script of analyze Flow report in their own Cases (coordination/T14, T15, T18, T20, T21)
const prose = {
  piece: '#10 names no Change in its body',
  distance: 'col-a: the distance to the target could not be compared',
  truncated: 'the list of open pieces was truncated: more exist than were read',
  provenance: '#190 has no recorded provenance, so its delivery is not known',
  publishing: 'the publishing layer is not modelled',
};
export async function run() {
  assert.equal((await pullPromotion(facts(ready()), declaration(), flow())).verdict, 'READY');
  for (const where of ['facts', 'flow']) {
    const judge = (decl, ...gaps) => pullPromotion(where === 'facts' ? facts({ ...ready(), gaps }) : facts(ready()), decl, where === 'facts' ? flow() : flow({ notJudged: gaps }));
    // relevant by what the prose names: a piece of the Change judged here, the collector itself
    let r = await judge(declaration(), prose.piece);
    assert.equal(r.verdict, 'NOT JUDGED', `${where}: a string gap about a piece of the Change did not stop READY`);
    assert.equal(statuses(r).lifecycle, 'UNKNOWN');
    r = await judge(declaration(), prose.distance);
    assert.equal(statuses(r).sequencing, 'UNKNOWN', `${where}: a string gap about the collector did not make sequencing UNKNOWN`);
    // a gap about something outside this collector stays visible and does not block
    r = await judge(declaration(), prose.provenance);
    assert.equal(r.verdict, 'READY', `${where}: a gap about another collector's piece blocked`);
    assert.deepEqual(r.notJudged.map((n) => [n.text, n.blocking]), [[prose.provenance, false]], `${where}: the outside gap was dropped or altered`);
    // prose that names nothing known cannot be classified: it fails safe, it is not guessed to be unrelated
    for (const text of [prose.truncated, prose.publishing]) {
      r = await judge(declaration(), text);
      assert.equal(r.verdict, 'NOT JUDGED', `${where}: an unclassifiable gap was treated as unrelated: ${text}`);
      assert.equal(statuses(r).attribution, 'UNKNOWN');
      assert.ok(r.notJudged.some((n) => n.text === text && n.blocking === true), `${where}: the gap is not reported as blocking`);
    }
    // the consumer's declaration is the one place that says a prose limitation is unrelated; the truncation stays blocking
    const declared = declaration({}, { gapRules: [{ match: '^the publishing layer is not modelled', affects: null, reason: 'a limitation of the model' }] });
    r = await judge(declared, prose.publishing);
    assert.equal(r.verdict, 'READY', `${where}: a gap the declaration classifies as unrelated blocked`);
    assert.equal(r.notJudged[0].blocking, false);
    r = await judge(declared, prose.publishing, prose.truncated);
    assert.equal(r.verdict, 'NOT JUDGED', `${where}: declaring one limitation hid another gap`);
    // every gap is accounted for exactly once, in the order given
    r = await judge(declared, ...Object.values(prose));
    assert.deepEqual(r.notJudged.map((n) => n.text), Object.values(prose), `${where}: a gap was dropped, duplicated or reordered`);
    // an entry that is neither a string nor a structured gap is not silently skipped
    r = await judge(declaration(), 42);
    assert.equal(r.verdict, 'NOT JUDGED', `${where}: a malformed gap was ignored`);
  }
}
