// Case pull/T40 tests: pull/F39
import assert from 'node:assert/strict';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join } from 'node:path';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'pull/T40';
export const tests = ['pull/F39'];
export const title = 'a freed seat pulls next, only the holder is synced and only when behind, and FAIL or UNKNOWN never passes';

export async function run() {
  const mod = await import(pathToFileURL(join(repo, 'packages/kaal-release/skills/kaal-release/scripts/pull-promotion.mjs')).href);
  assert.equal(typeof mod.laneStep, 'function', 'laneStep is not exported');
  const { laneStep } = mod;
  const rep = (names, next = names[0]) => ({ qualifiers: names, next: next ? { collector: next } : { collector: null, judged: names, reason: 'judged' } });
  const hold = { collector: 'col-a', pr: 10 };

  let r = laneStep({ seat: null, report: rep(['col-a', 'col-b'], 'col-b') });
  assert.deepEqual([r.action, r.collector], ['open-promotion', 'col-b'], 'a free seat did not pull next');
  r = laneStep({ seat: null, report: rep(['col-a', 'col-b'], null) });
  assert.equal(r.action, 'judge', 'a judged next opened a PROMOTION');
  assert.deepEqual(r.judged, ['col-a', 'col-b'], 'the candidates were not named');
  r = laneStep({ seat: null, report: rep([]) });
  assert.equal(r.action, 'wait', 'an empty lane did not wait');

  r = laneStep({ seat: hold, behind: true, report: rep(['col-a', 'col-b']) });
  assert.deepEqual([r.action, r.collector], ['open-sync', 'col-a'], 'the holder behind main was not synced');
  r = laneStep({ seat: hold, behind: false, requalification: undefined, report: rep(['col-a', 'col-b']) });
  assert.equal(r.action, 'wait', 'a current holder without a result did not wait');
  r = laneStep({ seat: hold, behind: false, requalification: 'PASS', report: rep(['col-a']) });
  assert.deepEqual([r.action, r.collector], ['ready-for-cpo', 'col-a'], 'PASS was not ready for the CPO');
  r = laneStep({ seat: hold, behind: false, requalification: 'FAIL', report: rep(['col-a', 'col-b', 'col-c'], 'col-a') });
  assert.equal(r.action, 'open-promotion', 'FAIL did not pull another');
  assert.notEqual(r.collector, 'col-a', 'the failed collector was pulled again');
  assert.ok(['col-b', 'col-c'].includes(r.collector));
  r = laneStep({ seat: hold, behind: false, requalification: 'FAIL', report: rep(['col-a']) });
  assert.equal(r.action, 'judge', 'FAIL with no other candidate was not judged');
  r = laneStep({ seat: hold, behind: false, requalification: 'UNKNOWN', report: rep(['col-a']) });
  assert.equal(r.action, 'wait', 'UNKNOWN passed');
}
