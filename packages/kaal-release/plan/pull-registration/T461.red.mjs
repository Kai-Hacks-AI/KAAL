// Case pull/T461 tests: pull/F61
import assert from 'node:assert/strict';
import { script, registryOf, ROUTES_PATH, ROUTES, capability, calm, hot, wire, kaal, neutral, ok } from './lib.mjs';
export const id = 'pull/T461';
export const tests = ['pull/F61'];
export const title = 'every GREEN item of a registered stock is auto-pulled, whether or not its destination IN has passed; a GREEN item outside any registered stock is judge-pulled: reported, never selected, still open to judgment';

export async function run() {
  const mod = await script();
  const registry = await registryOf({ [ROUTES_PATH]: ROUTES, 'packages/kaal-release/kaal-pull.json': capability('release') });
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
  // Stock membership: any branch under a registered scope is a stock item, with no per-branch opt-in; GREEN makes it pullable.
  r = step([kaal('kaal/release/other')]);
  assert.deepEqual([r.action, r.collector], ['open-promotion', 'kaal/release/other'], 'a GREEN item of the registered stock was not pulled');
  // Not GREEN at the exact head: a stock item, but not ready, so not pulled.
  for (const out of ['FAIL', 'UNKNOWN']) assert.notEqual(step([kaal('kaal/release/wip', { out })]).action, 'open-promotion', `a stock item with OUT ${out} was pulled`);
  // The destination IN is applied after the pull, never a precondition of it.
  for (const i of ['UNKNOWN', 'FAIL', undefined]) assert.equal(step([kaal('kaal/release/pull-lane', { in: i })]).action, 'open-promotion', `an IN of ${i} blocked the pull`);
  // One capability's stock does not enroll another's, and class routes do not enroll KAAL.
  assert.equal(step([kaal('kaal/releasex/y')]).action, 'judge', 'a name sharing a prefix but outside the scope was enrolled');
  assert.equal(step([kaal('hotfix/fix-a')]).action, 'judge', 'a class route enrolled a KAAL collector');
  assert.equal(step([{ ...hot('fix-a'), source: 'hotfix/' }]).action !== 'select', true, 'an empty route remainder was selected');
  // Unregistered HOTFIX/WIRE when no class route is accepted.
  const noRoutes = await registryOf({ 'packages/kaal-release/kaal-pull.json': capability('release') });
  r = mod.laneStep({ seat: null, report: {}, declaration: decl, deliveries: [hot('fix-a'), kaal('kaal/release/pull-lane')], pulse: calm, registry: noRoutes });
  assert.deepEqual([r.action, r.collector], ['open-promotion', 'kaal/release/pull-lane'], 'a HOTFIX without an accepted route blocked the registered collector');
  assert.deepEqual(r.judgePulled, ['fix-a'], 'the HOTFIX without a route is not judge-pulled');
  // Host-neutral: a consumer's own classes and route scopes work with no KAAL names, so the package hardcodes none.
  const own = (c, over = {}) => ({ class: c, source: `${c === 'URGENT' ? 'urg' : 'rt'}/${over.name ?? 'x'}`, name: over.name ?? 'x', ...ok, ...over });
  const stepOwn = (deliveries) => mod.laneStep({ seat: null, report: {}, declaration: decl, deliveries, pulse: calm, registry: neutral });
  r = stepOwn([own('URGENT', { name: 'a' })]);
  assert.deepEqual([r.action, r.class], ['select', 'URGENT'], "a consumer's own class on its own route was not auto-pulled");
  assert.equal(stepOwn([{ ...own('ROUTINE', { name: 'one' }), source: 'rt/one/a' }]).action, 'select', 'a route scope did not cover its member');
  r = stepOwn([own('ROUTINE', { name: 'two' })]);
  assert.deepEqual([r.action, r.judgePulled], ['judge', ['two']], 'a source outside the route scope was covered');
  assert.equal(stepOwn([{ ...own('URGENT', { name: 'a' }), source: 'rt/a' }]).action, 'judge', "a source outside the class's routes was auto-pulled");
  assert.equal(stepOwn([{ class: 'HOTFIX', source: 'hotfix/x', name: 'x', ...ok }]).action, 'judge', 'a KAAL class name was built into the package');
}
