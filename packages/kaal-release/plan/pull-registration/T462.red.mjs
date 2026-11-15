// Case pull/T462 tests: pull/F62
import assert from 'node:assert/strict';
import { script, registryOf, ROUTES_PATH, ROUTES, capability, calm, hot, kaal } from './lib.mjs';
export const id = 'pull/T462';
export const tests = ['pull/F62'];
export const title = 'no accepted registry means everything is judge-pulled, an ad hoc declaration is not an accepted registration, and the legacy next path is held the same way';

export async function run() {
  const mod = await script();
  const registry = await registryOf({ [ROUTES_PATH]: ROUTES, 'packages/kaal-release/kaal-pull.json': capability('release', ['kaal/release/pull-lane']) });
  const decl = { collectors: [] };
  const report = { qualifiers: ['kaal/release/pull-lane'], next: { collector: 'kaal/release/pull-lane' } };
  const step = (extra) => mod.laneStep({ seat: null, report, declaration: decl, deliveries: [hot('fix-a'), kaal('kaal/release/pull-lane')], pulse: calm, ...extra });

  // Control: the same facts with the accepted registry are auto-pulled.
  assert.equal(step({ registry }).action, 'select', 'the control was not auto-pulled');

  const doubtful = {
    'no registry': undefined,
    'null': null,
    'not accepted': { ...registry, accepted: false },
    'not from main': { ...registry, source: 'kaal/release/pull-lane' },
    'a non-object': 'main',
    'collectors that are not a list': { ...registry, collectors: 'kaal/release/pull-lane' },
    'class routes that are not lists': { ...registry, classRoutes: { HOTFIX: 'hotfix/*' } },
    'an ad hoc declaration': { accepted: true, source: 'adhoc', collectors: ['kaal/release/pull-lane'], classRoutes: { HOTFIX: ['hotfix/*'] } },
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
  const other = await registryOf({ [ROUTES_PATH]: ROUTES, 'packages/kaal-retro/kaal-pull.json': capability('retro', ['kaal/retro/skill']) });
  assert.equal(legacy({ registry: other }).action, 'judge', 'an unregistered next was opened');
  // The holder's own steps do not need a registration: what is in stays in.
  const held = mod.laneStep({ seat: { collector: 'kaal/release/pull-lane', pr: 1 }, behind: true, report, declaration: decl, pulse: calm });
  assert.equal(held.action, 'open-sync', 'a SYNC for the holder needed a registration');
}
