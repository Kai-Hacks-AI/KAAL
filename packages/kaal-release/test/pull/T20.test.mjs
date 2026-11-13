// Case pull/T20 tests: pull/F22
import assert from 'node:assert/strict';
import { bad, collector, declaration, delivery, facts, green, landed, lifecycle, open, ok, running, statusOf, walkCollectors } from './fixtures.mjs';
export const id = 'pull/T20';
export const tests = ['pull/F22'];
export const title = 'a collector qualifies only when every undelivered Change in it has PLAN, DO and ACT landed there and every declared Check check is green on its head; each shortfall is named, and an unreadable fact means not judged, never a pass';
const only = (over) => facts({ collectors: [collector('col-a', over.checks ?? green())], pieces: over.pieces ?? lifecycle('col-a'), deliveries: over.deliveries ?? [] });
const decl = declaration({ collectors: [{ name: 'col-a' }] });
const one = async (over) => statusOf(await walkCollectors(only(over), decl), 'col-a');
export async function run() {
  const complete = await one({});
  assert.equal(complete.status, 'qualifies');
  assert.deepEqual(complete.missing, [], 'a qualifying collector reports missing evidence');
  assert.ok(complete.changes.length === 1 && complete.changes[0].complete === true, 'the Change is not reported complete');

  // a lifecycle phase that has not landed in this collector
  const noAct = await one({ pieces: lifecycle('col-a').filter((p) => p.type !== 'ACT') });
  assert.equal(noAct.status, 'does not qualify');
  assert.ok(noAct.missing.some((m) => /ACT/.test(m) && /c\/col-a/.test(m)), 'the missing ACT of the Change is not named');
  const openDo = await one({ pieces: [...lifecycle('col-a').filter((p) => p.type !== 'DO'), open('#99', 'DO', 'c/col-a', 'col-a')] });
  assert.equal(openDo.status, 'does not qualify', 'a DO that is open counted as landed');
  assert.ok(openDo.missing.some((m) => /DO/.test(m)));
  // a phase landed in another collector is not this collector's evidence
  const elsewhere = await one({ pieces: [...lifecycle('col-a').filter((p) => p.type !== 'PLAN'), landed('#98', 'PLAN', 'c/col-a', 'col-z')] });
  assert.equal(elsewhere.status, 'does not qualify', 'a PLAN landed in another collector counted');

  // the Check phase: a failure fails it, a missing or unfinished check is unknown
  const red = await one({ checks: [ok('build'), bad('suite')] });
  assert.equal(red.status, 'does not qualify');
  assert.ok(red.missing.some((m) => /suite/.test(m)), 'the failing check is not named');
  const absent = await one({ checks: [ok('build')] });
  assert.equal(absent.status, 'not judged', 'a check with no run counted as a pass or a failure');
  assert.ok(absent.missing.some((m) => /suite/.test(m)));
  const pending = await one({ checks: [ok('build'), running('suite')] });
  assert.equal(pending.status, 'not judged', 'a check still running counted');
  assert.equal(statusOf(await walkCollectors(facts({ collectors: [{ name: 'col-a', at: 'x' }], pieces: lifecycle('col-a') }), decl), 'col-a').status, 'not judged', 'a collector with no check evidence qualifies');

  // a failure and an unknown together: the failure is reported
  assert.equal((await one({ checks: [bad('build')] })).status, 'does not qualify');

  // a piece that names no Change is an ambiguity, never guessed
  const orphan = await one({ pieces: [...lifecycle('col-a'), landed('#97', 'DO', undefined, 'col-a')] });
  assert.equal(orphan.status, 'not judged', 'a piece without a Change id was attributed or ignored');
  assert.ok(orphan.missing.some((m) => /#97/.test(m)));

  // what a promotion already delivered is not this promotion's evidence
  const deliveredAll = await one({ deliveries: [delivery('col-a', '2026-11-12T23:00:00Z')] });
  assert.equal(deliveredAll.status, 'does not qualify', 'a collector with nothing new qualified');
  assert.ok(deliveredAll.missing.some((m) => /Change/i.test(m)), 'the absence of an undelivered Change is not named');
  const unplaced = await one({ deliveries: [{ collector: 'col-a', delivered: 'col-a-head' }] });
  assert.equal(unplaced.status, 'not judged', 'a delivery with no landing time was guessed');
  const partlyDelivered = await one({ deliveries: [delivery('col-a', '2026-11-12T01:30:00Z')] });
  assert.equal(partlyDelivered.status, 'does not qualify', 'a Change whose PLAN was already delivered counted as complete');
  assert.ok(partlyDelivered.missing.some((m) => /PLAN/.test(m)));
}
