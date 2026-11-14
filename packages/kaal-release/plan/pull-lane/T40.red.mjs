// Case pull/T40 tests: pull/F39
import assert from 'node:assert/strict';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join } from 'node:path';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'pull/T40';
export const tests = ['pull/F39', 'pull/F41'];
export const title = 'a freed seat pulls next in the existing PROMOTION and SYNC shapes, only the holder is synced and only when behind, and FAIL or UNKNOWN never passes';

export async function run() {
  const mod = await import(pathToFileURL(join(repo, 'packages/kaal-release/skills/kaal-release/scripts/pull-promotion.mjs')).href);
  assert.equal(typeof mod.laneStep, 'function', 'laneStep is not exported');
  const { laneStep } = mod;
  const rep = (names, next = names[0]) => ({ qualifiers: names, next: next ? { collector: next } : { collector: null, judged: names, reason: 'judged' } });
  const hold = { collector: 'col-a', pr: 10 };

  let r = laneStep({ seat: null, report: rep(['col-a', 'col-b'], 'col-b') });
  assert.deepEqual([r.action, r.collector], ['open-promotion', 'col-b'], 'a free seat did not pull next');
  assert.deepEqual([r.type, r.chapters], ['PROMOTION', ['Change', 'Why now']], 'the PROMOTION does not use the existing template');
  r = laneStep({ seat: null, report: rep(['col-a', 'col-b'], null) });
  assert.equal(r.action, 'judge', 'a judged next opened a PROMOTION');
  assert.deepEqual(r.judged, ['col-a', 'col-b'], 'the candidates were not named');
  r = laneStep({ seat: null, report: rep([]) });
  assert.equal(r.action, 'wait', 'an empty lane did not wait');

  r = laneStep({ seat: hold, behind: true, report: rep(['col-a', 'col-b']) });
  assert.deepEqual([r.action, r.collector], ['open-sync', 'col-a'], 'the holder behind main was not synced');
  assert.deepEqual([r.type, r.chapters], ['SYNC', ['Change', 'Reason']], 'the SYNC does not use the existing template');
  r = laneStep({ seat: hold, behind: false, requalification: undefined, report: rep(['col-a', 'col-b']) });
  assert.equal(r.action, 'wait', 'a current holder without a result did not wait');
  r = laneStep({ seat: hold, behind: false, requalification: 'PASS', report: rep(['col-a']) });
  assert.deepEqual([r.action, r.collector], ['ready-for-cpo', 'col-a'], 'PASS was not ready for the CPO');
  // FAIL: the others are ranked with the pull/C9 rule on the subset; the report's next (the failed holder) is not used.
  const unit = 'Cases added';
  const decl = (rows) => ({ collectors: rows.map(([name, value, size, u = unit]) => ({ name, ...(value === undefined ? {} : { value }), ...(size === undefined ? {} : { size }), ...(u ? { unit: u } : {}) })) });
  const fail = (rows, names = rows.map((x) => x[0])) => laneStep({ seat: hold, behind: false, requalification: 'FAIL', report: rep(names, 'col-a'), declaration: decl(rows) });
  r = fail([['col-a', 9, 1], ['col-b', 6, 2], ['col-c', 4, 2]]);
  assert.deepEqual([r.action, r.collector], ['open-promotion', 'col-b'], 'the failed original next was pulled again or the best alternative was not');
  r = fail([['col-a', 9, 1], ['col-b', 1, 1], ['col-c', 8, 1]]);
  assert.equal(r.collector, 'col-c', 'the alternatives were not ranked by value density');
  r = fail([['col-a', 9, 1], ['col-b', 5, 1]]);
  assert.deepEqual([r.action, r.collector], ['open-promotion', 'col-b'], 'a single remaining qualifier was not pulled');
  r = fail([['col-a', 9, 1], ['col-b', 2, 1], ['col-c', 4, 2]]);
  assert.equal(r.action, 'judge', 'a tie among the alternatives was picked');
  assert.deepEqual(r.judged, ['col-b', 'col-c']);
  r = fail([['col-a', 9, 1], ['col-b', 5, undefined], ['col-c', 4, 2]]);
  assert.equal(r.action, 'judge', 'an alternative with a missing size was compared');
  assert.deepEqual(r.judged, ['col-b', 'col-c']);
  r = fail([['col-a', 9, 1], ['col-b', 5, 1, 'IFPUG FP 4.3'], ['col-c', 4, 2, 'COSMIC CFP']]);
  assert.equal(r.action, 'judge', 'alternatives of different units were compared');
  r = fail([['col-a', 9, 1]]);
  assert.equal(r.action, 'wait', 'FAIL with no remaining qualifier did not wait');
  r = laneStep({ seat: hold, behind: false, requalification: 'UNKNOWN', report: rep(['col-a']) });
  assert.equal(r.action, 'wait', 'UNKNOWN passed');
}
