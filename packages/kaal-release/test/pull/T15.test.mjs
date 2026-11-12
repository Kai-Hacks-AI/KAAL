// Case pull/T15 tests: pull/F19 (a gap that bears on a judgment)
import assert from 'node:assert/strict';
import { declaration, facts, flow, lifecycle, promotion, pullPromotion, statuses } from './fixtures.mjs';
export const id = 'pull/T15';
export const tests = ['pull/F19'];
export const title = 'a gap that bears on one of the six judgments makes that judgment UNKNOWN, prevents READY and any action to proceed, and names the judgment and why; an unmappable declaration of relevance fails safe';
const ready = () => ({ pieces: [...lifecycle(), promotion(20)] });
export async function run() {
  // the baseline is READY, so every change below is caused by the gap alone
  assert.equal((await pullPromotion(facts(ready()), declaration(), flow())).verdict, 'READY');

  const cases = [
    // a piece of a Change judged here: the lifecycle cannot be judged
    { name: 'a piece of the Change in the collector', gap: { subject: '#10', missing: 'its landing time was not read' }, judgment: 'lifecycle' },
    // a check the declaration assigns to an owner: that owner's judgment
    { name: 'a check with a declared owner', gap: { subject: 'guard', missing: 'its conclusion was not read' }, judgment: 'protection' },
    // the collector itself
    { name: 'the collector', gap: { subject: 'col-a', missing: 'its distance to the target was not compared' }, judgment: 'sequencing' },
    // the supplier says which judgment it bears on
    { name: 'a gap that declares what it affects', gap: { subject: 'some record', missing: 'unread', affects: 'validation' }, judgment: 'validation' },
  ];
  for (const { name, gap, judgment } of cases) {
    for (const where of ['facts', 'flow']) {
      const result = await pullPromotion(
        facts({ ...ready(), ...(where === 'facts' ? { gaps: [gap] } : {}) }), declaration(), flow(where === 'flow' ? { notJudged: [gap] } : {}));
      assert.equal(result.verdict, 'NOT JUDGED', `${name} (${where}): a relevant gap did not stop READY`);
      assert.equal(statuses(result)[judgment], 'UNKNOWN', `${name} (${where}): ${judgment} is not UNKNOWN`);
      assert.ok(result.judgments.find((j) => j.id === judgment).missing.includes(gap.subject), `${name} (${where}): the missing subject is not named`);
      assert.ok(!['OPEN', 'REVIEW', 'LAND'].includes(result.next.action), `${name} (${where}): an action to proceed is recommended on missing evidence`);
      const entry = result.notJudged.find((n) => n.subject === gap.subject);
      assert.ok(entry && entry.blocking === true && entry.affects === judgment, `${name} (${where}): the gap is not reported as blocking ${judgment}`);
    }
  }

  // a declaration of relevance that names no judgment cannot be mapped: it fails safe instead of being ignored
  const stray = await pullPromotion(facts({ ...ready(), gaps: [{ subject: 'x', missing: 'y', affects: 'nonsense' }] }), declaration(), flow());
  assert.equal(stray.verdict, 'NOT JUDGED', 'a gap with an unknown judgment was ignored');
  assert.equal(statuses(stray).attribution, 'UNKNOWN');

  // an unknown never overrides a failure: a failing judgment still blocks
  const blocked = await pullPromotion(facts({ pieces: [...lifecycle().slice(0, 2), promotion(20)], gaps: [{ subject: 'col-a', missing: 'z' }] }), declaration(), flow());
  assert.equal(blocked.verdict, 'BLOCKED');
}
