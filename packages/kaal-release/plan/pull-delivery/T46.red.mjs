// Case pull/T46 tests: pull/F45
import assert from 'node:assert/strict';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join } from 'node:path';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'pull/T46';
export const tests = ['pull/F45'];
export const title = 'without deliveries the step is unchanged, and a KAAL selection stays under the pulse guard and mentions no approval or merge';

export async function run() {
  const mod = await import(pathToFileURL(join(repo, 'packages/kaal-release/skills/kaal-release/scripts/pull-promotion.mjs')).href);
  const calm = { open: [], closed: [], trigger: 't1', attempts: 0, cap: 2 };
  const report = { qualifiers: ['kaal/release/a', 'kaal/release/b'], next: { collector: 'kaal/release/b' } };
  // Regression: without deliveries the approved results hold.
  let r = mod.laneStep({ seat: null, report, pulse: calm });
  assert.deepEqual([r.action, r.collector, r.type], ['open-promotion', 'kaal/release/b', 'PROMOTION'], 'a free seat no longer pulls next');
  r = mod.laneStep({ seat: { collector: 'kaal/release/a', pr: 1 }, behind: true, report, pulse: calm });
  assert.deepEqual([r.action, r.type], ['open-sync', 'SYNC'], 'a behind holder is no longer synced');
  assert.equal(mod.laneStep({ seat: null, report }).action, 'judge', 'a missing pulse no longer fails closed');
  // With deliveries, a KAAL selection is held by the pulse.
  const kaal = { class: 'KAAL', source: 'kaal/release/b', name: 'kaal/release/b', out: 'PASS', in: 'PASS' };
  const decl = { collectors: [] };
  const withKaal = (pulse) => mod.laneStep({ seat: null, report, declaration: decl, deliveries: [kaal], pulse });
  assert.deepEqual([withKaal(calm).action, withKaal(calm).collector], ['open-promotion', 'kaal/release/b'], 'a KAAL selection was not made through deliveries');
  assert.equal(withKaal({ ...calm, open: [{ type: 'PROMOTION', collector: 'kaal/release/z' }] }).action, 'wait', 'an open PROMOTION did not hold the KAAL selection');
  assert.equal(withKaal({ ...calm, attempts: 2 }).action, 'judge', 'the cap did not hold the KAAL selection');
  assert.equal(withKaal(undefined).action, 'judge', 'a missing pulse did not fail closed with deliveries');
  // A KAAL collector whose OUT is not PASS is not eligible, even though the report names it as next.
  const notReady = mod.laneStep({ seat: null, report, declaration: decl, deliveries: [{ ...kaal, out: 'FAIL' }], pulse: calm });
  assert.equal(notReady.action, 'wait', 'a KAAL collector with a failed OUT was still pulled');
  const hot = { class: 'HOTFIX', source: 'hotfix/a', name: 'a', out: 'PASS', in: 'PASS' };
  for (const out of [withKaal(calm), mod.laneStep({ seat: null, report, deliveries: [hot, kaal], pulse: calm }), mod.laneStep({ seat: null, report, deliveries: [{ ...hot, out: 'UNKNOWN' }, kaal], pulse: calm })])
    assert.ok(!/approv|merge/i.test(JSON.stringify(out)), 'a result mentions an approval or a merge');
}
