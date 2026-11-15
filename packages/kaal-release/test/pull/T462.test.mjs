// Case pull/T462 tests: pull/F62
import assert from 'node:assert/strict';
import { script, registryOf, optIn, calm, hot, kaal } from './registration/lib.mjs';
export const id = 'pull/T462';
export const tests = ['pull/F62'];
export const title = 'no accepted registry means everything is judge-pulled, an ad hoc declaration is not an accepted registration, and the legacy next path is held the same way';

export async function run() {
  const mod = await script();
  const registry = await registryOf({ 'packages/kaal-release/kaal-pull.json': optIn('release') });
  const decl = { collectors: [] };
  const report = { qualifiers: ['kaal/release/pull-lane'], next: { collector: 'kaal/release/pull-lane' } };
  const step = (extra) => mod.laneStep({ seat: null, report, declaration: decl, deliveries: [hot('fix-a'), kaal('kaal/release/pull-lane')], pulse: calm, ...extra });

  // Control: the same facts with the accepted registry are auto-pulled.
  assert.equal(step({ registry }).action, 'select', 'the control was not auto-pulled');

  const doubtful = {
    'no registry': undefined,
    'null': null,
    'not accepted': { ...registry, accepted: false },
    'a non-object': 'main',
    'stocks that are not a list': { ...registry, stocks: 'HOTFIX' },
    'routes that are not a list': { ...registry, stocks: [{ name: 'HOTFIX', routes: 'hotfix/*' }] },
    'a stock without routes': { ...registry, stocks: [{ name: 'KAAL' }] },
    'the old per-branch shape (an ad hoc declaration)': { accepted: true, source: 'adhoc', collectors: ['kaal/release/pull-lane'], classRoutes: { HOTFIX: ['hotfix/*'] } },
  };
  for (const [what, bad] of Object.entries(doubtful)) {
    const r = step({ registry: bad });
    assert.equal(r.action, 'judge', `${what} did not fail closed`);
    assert.ok(!r.collector && !r.name, `${what} still named a candidate for opening`);
    assert.ok(r.judgePulled?.length === 2, `${what} did not report every candidate as judge-pulled`);
  }
  // The legacy path (no deliveries) is held the same way.
  const legacy = (extra) => mod.laneStep({ seat: null, report, declaration: decl, pulse: calm, ...extra });
  assert.deepEqual([legacy({ registry }).action, legacy({ registry }).collector], ['open-promotion', 'kaal/release/pull-lane'], 'the legacy path no longer pulls a registered next');
  assert.equal(legacy({}).action, 'judge', 'the legacy path opened a collector without a registry');
  assert.deepEqual(legacy({}).judgePulled, ['kaal/release/pull-lane'], 'the legacy candidate is not judge-pulled');
  // A tree that is not main's tip yields a registry that is not accepted, so the adapter's output fails closed too.
  const nonMain = (await (await import('./registration/lib.mjs')).registration()).discoverRegistrations({ ref: 'kaal/release/pull-lane', files: {} }).registry;
  assert.equal(step({ registry: nonMain }).action, 'judge', 'a registry from a collector tree was used');
  const other = await registryOf({ 'packages/kaal-retro/kaal-pull.json': optIn('retro') });
  assert.equal(legacy({ registry: other }).action, 'judge', 'an unregistered next was opened');
  // The holder's own steps do not need a registration: what is in stays in.
  const held = mod.laneStep({ seat: { collector: 'kaal/release/pull-lane', pr: 1 }, behind: true, report, declaration: decl, pulse: calm });
  assert.equal(held.action, 'open-sync', 'a SYNC for the holder needed a registration');
}
