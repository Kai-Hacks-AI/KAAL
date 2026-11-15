// Case pull/T463 tests: pull/F63
import assert from 'node:assert/strict';
import { script, registryOf, ROUTES_PATH, ROUTES, capability, calm, ok, hot, wire, kaal } from './lib.mjs';
export const id = 'pull/T463';
export const tests = ['pull/F63'];
export const title = 'with a registry that covers the stock every agreed rule still holds: class order, non-preemption, UNKNOWN, the pulse guard, and no approval or merge';

export async function run() {
  const mod = await script();
  const registry = await registryOf({ [ROUTES_PATH]: ROUTES, 'packages/kaal-release/kaal-pull.json': capability('release') });
  const decl = { collectors: [{ name: 'kaal/release/a', value: 1, size: 1, unit: 'u' }, { name: 'kaal/release/b', value: 9, size: 1, unit: 'u' }] };
  const step = (deliveries, extra = {}) => mod.laneStep({ seat: null, report: { qualifiers: [], next: { collector: null } }, declaration: decl, deliveries, pulse: calm, registry, ...extra });

  // Class order and C9 inside KAAL.
  assert.deepEqual([step([kaal('kaal/release/b'), wire(), hot()]).action, step([kaal('kaal/release/b'), wire(), hot()]).class], ['select', 'HOTFIX'], 'HOTFIX did not come first');
  assert.equal(step([kaal('kaal/release/a'), kaal('kaal/release/b')]).collector, 'kaal/release/b', 'value density no longer chooses inside KAAL');
  // UNKNOWN does not block a known eligible lower class and is reported.
  const u = step([hot('fix-a', { out: 'UNKNOWN' }), wire()]);
  assert.deepEqual([u.action, u.class, u.unknown], ['select', 'WIRE', ['fix-a']], 'UNKNOWN changed');
  // A stock item that is not GREEN (OUT FAIL) is not ready, is not pulled, and is not judge-pulled either.
  const f = step([hot('fix-a', { out: 'FAIL' }), kaal('kaal/release/b')]);
  assert.equal(f.action, 'open-promotion', 'FAIL blocked a lower class');
  assert.ok(!f.judgePulled?.length, 'a FAIL candidate was reported as judge-pulled');
  // Non-preemption.
  const held = mod.laneStep({ seat: { collector: 'kaal/release/a', pr: 1 }, behind: false, requalification: 'PASS', report: {}, declaration: decl, deliveries: [hot()], pulse: calm, registry });
  assert.equal(held.action, 'ready-for-cpo', 'an eligible HOTFIX preempted the holder');
  // The pulse guard and the cap.
  assert.equal(step([hot()], { pulse: { ...calm, open: [{ type: 'WIRE', collector: 'hooks' }] } }).action, 'wait', 'an open delivery did not hold the selection');
  assert.equal(step([hot()], { pulse: { ...calm, attempts: 2 } }).action, 'judge', 'the cap did not hold the selection');
  assert.equal(step([hot()], { pulse: undefined }).action, 'judge', 'an invalid pulse did not fail closed');
  // Two eligible registered HOTFIXes are still a judgment.
  assert.equal(step([hot('fix-a'), hot('fix-b')]).action, 'judge', 'two HOTFIXes were ordered');
  // No result mentions an approval or a merge.
  for (const r of [step([hot()]), step([kaal('kaal/release/b')]), step([kaal('kaal/retro/x')]), step('x')])
    assert.ok(!/approv|merge/i.test(JSON.stringify(r)), 'a result mentions an approval or a merge');
  // Without a registry nothing in a free-seat step is opened, so the C11 Cases that omit it are updated in the DO, never skipped.
  assert.notEqual(mod.laneStep({ seat: null, report: {}, declaration: decl, deliveries: [hot()], pulse: calm }).action, 'select', 'a candidate was auto-pulled with no registry');
}
