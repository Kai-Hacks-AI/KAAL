// Case pull/T52 tests: pull/F51
import assert from 'node:assert/strict';
import { script, registryOf, ROUTES_PATH, ROUTES, capability, calm, hot, wire, kaal } from './lib.mjs';
export const id = 'pull/T52';
export const tests = ['pull/F51'];
export const title = 'registered candidates are auto-pulled and an eligible unregistered capability is judge-pulled: reported, never selected, still open to judgment';

export async function run() {
  const mod = await script();
  const registry = await registryOf({ [ROUTES_PATH]: ROUTES, 'packages/kaal-release/kaal-pull.json': capability('release', ['kaal/release/pull-lane']) });
  const decl = { collectors: [] };
  const step = (deliveries, extra = {}) => mod.laneStep({ seat: null, report: { qualifiers: [], next: { collector: null, reason: 'none' } }, declaration: decl, deliveries, pulse: calm, registry, ...extra });

  // Registered: auto-pulled.
  let r = step([kaal('kaal/release/pull-lane')]);
  assert.deepEqual([r.action, r.collector], ['open-promotion', 'kaal/release/pull-lane'], 'a registered KAAL collector was not auto-pulled');
  r = step([hot('fix-a')]);
  assert.deepEqual([r.action, r.class, r.name], ['select', 'HOTFIX', 'fix-a'], 'a HOTFIX on an accepted route was not auto-pulled');
  r = step([wire('hooks')]);
  assert.deepEqual([r.action, r.class], ['select', 'WIRE'], 'a WIRE on an accepted route was not auto-pulled');

  // Eligible but unregistered: judge-pulled, never selected, named, alone it is a judgment.
  r = step([kaal('kaal/retro/skill')]);
  assert.equal(r.action, 'judge', 'an unregistered KAAL capability was not left to judgment');
  assert.deepEqual(r.judgePulled, ['kaal/retro/skill'], 'the judge-pulled candidate is not named');
  assert.ok(!r.collector, 'an unregistered capability was named for opening');
  // Next to a registered one it is reported and the registered one is selected.
  r = step([kaal('kaal/retro/skill'), kaal('kaal/release/pull-lane')]);
  assert.deepEqual([r.action, r.collector], ['open-promotion', 'kaal/release/pull-lane'], 'an unregistered capability blocked a registered one');
  assert.deepEqual(r.judgePulled, ['kaal/retro/skill'], 'the unregistered capability is not reported beside the choice');
  // One capability's registration does not enroll another's collector, and class routes do not enroll KAAL.
  assert.equal(step([kaal('kaal/release/other')]).action, 'judge', 'a sibling collector was enrolled by the registration of another');
  assert.equal(step([kaal('hotfix/fix-a')]).action, 'judge', 'a class route enrolled a KAAL collector');
  assert.equal(step([{ ...hot('fix-a'), source: 'hotfix/' }]).action !== 'select', true, 'an empty route remainder was selected');
  // Unregistered HOTFIX/WIRE when no class route is accepted.
  const noRoutes = await registryOf({ 'packages/kaal-release/kaal-pull.json': capability('release', ['kaal/release/pull-lane']) });
  r = mod.laneStep({ seat: null, report: {}, declaration: decl, deliveries: [hot('fix-a'), kaal('kaal/release/pull-lane')], pulse: calm, registry: noRoutes });
  assert.deepEqual([r.action, r.collector], ['open-promotion', 'kaal/release/pull-lane'], 'a HOTFIX without an accepted route blocked the registered collector');
  assert.deepEqual(r.judgePulled, ['fix-a'], 'the HOTFIX without a route is not judge-pulled');
}
