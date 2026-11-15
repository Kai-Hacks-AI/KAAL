// Case pull/T46 tests: pull/F45
import assert from 'node:assert/strict';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { registry } from './fixtures.mjs';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'pull/T46';
export const tests = ['pull/F45'];
export const title = 'one admission lane for every class: a selection cannot duplicate an open delivery, is held by the trigger, the cap and an invalid pulse, and without deliveries the step is unchanged';

export async function run() {
  const raw = await import(pathToFileURL(join(repo, 'packages/kaal-release/skills/kaal-release/scripts/pull-promotion.mjs')).href);
  const mod = { ...raw, laneStep: (st) => raw.laneStep({ registry, ...st }) };
  const calm = { open: [], closed: [], trigger: 't1', attempts: 0, cap: 2 };
  const report = { qualifiers: ['kaal/release/a', 'kaal/release/b'], next: { collector: 'kaal/release/b' } };
  // Regression: without deliveries the approved results hold.
  let r = mod.laneStep({ seat: null, report, pulse: calm });
  assert.deepEqual([r.action, r.collector, r.type], ['open-promotion', 'kaal/release/b', 'PROMOTION'], 'a free seat no longer pulls next');
  r = mod.laneStep({ seat: { collector: 'kaal/release/a', pr: 1 }, behind: true, report, pulse: calm });
  assert.deepEqual([r.action, r.type], ['open-sync', 'SYNC'], 'a behind holder is no longer synced');
  assert.equal(mod.laneStep({ seat: null, report }).action, 'judge', 'a missing pulse no longer fails closed');

  const ok = { stock: 'PASS', in: 'PASS' };
  const hot = { class: 'HOTFIX', source: 'hotfix/fix-a', name: 'fix-a', ...ok };
  const kaal = { class: 'KAAL', source: 'kaal/release/b', name: 'kaal/release/b', ...ok };
  const sel = (deliveries, pulse, extra = {}) => mod.laneStep({ seat: null, report, declaration: { collectors: [] }, deliveries, pulse, ...extra });

  // A selection is made when the lane is free.
  assert.deepEqual([sel([hot], calm).action, sel([hot], calm).name], ['select', 'fix-a'], 'a HOTFIX was not selected on a free lane');
  // It cannot duplicate or pass an open delivery: any open PROMOTION, HOTFIX or WIRE occupies the lane.
  for (const open of [{ type: 'HOTFIX', collector: 'fix-a' }, { type: 'HOTFIX', collector: 'fix-z' }, { type: 'WIRE', collector: 'hooks' }, { type: 'PROMOTION', collector: 'kaal/release/z' }]) {
    assert.equal(sel([hot], { ...calm, open: [open] }).action, 'wait', `a HOTFIX was selected while ${open.type} ${open.collector} was open`);
    assert.equal(sel([kaal], { ...calm, open: [open] }).action, 'wait', `a collector was opened while ${open.type} ${open.collector} was open`);
  }
  // A SYNC is independent of an open delivery.
  const behind = mod.laneStep({ seat: { collector: 'kaal/release/a', pr: 1 }, behind: true, report, deliveries: [hot], pulse: { ...calm, open: [{ type: 'HOTFIX', collector: 'fix-z' }] } });
  assert.equal(behind.action, 'open-sync', 'an open HOTFIX blocked the holder SYNC');
  // The trigger, the cap and an invalid pulse hold a selection too.
  const closed = [{ type: 'HOTFIX', collector: 'fix-z', trigger: 't1' }];
  assert.equal(sel([hot], { ...calm, closed }).action, 'wait', 'a HOTFIX was selected twice under one trigger');
  assert.equal(sel([hot], { ...calm, closed, trigger: 't2' }).action, 'select', 'a new trigger did not allow the selection');
  assert.equal(sel([hot], { ...calm, attempts: 2 }).action, 'judge', 'the cap did not hold a HOTFIX selection');
  for (const bad of [undefined, { ...calm, open: 'x' }, { ...calm, cap: 0 }, { ...calm, trigger: '' }])
    assert.equal(sel([hot], bad).action, 'judge', 'an invalid pulse did not fail closed for a HOTFIX');
  // A KAAL collector whose OUT is not PASS is not eligible, even though the report names it as next.
  assert.equal(sel([{ ...kaal, stock: 'FAIL' }], calm).action, 'wait', 'a KAAL collector with a failed OUT was still pulled');
  for (const out of [sel([hot], calm), sel([kaal], calm), sel([{ ...hot, stock: 'UNKNOWN' }, kaal], calm)])
    assert.ok(!/approv|merge/i.test(JSON.stringify(out)), 'a result mentions an approval or a merge');
}
