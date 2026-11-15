// Case pull/T460 tests: pull/F60
import assert from 'node:assert/strict';
import { registration, ROUTES_PATH, ROUTES, capability, main } from './lib.mjs';
export const id = 'pull/T460';
export const tests = ['pull/F60'];
export const title = "a capability registers its stock on main; KAAL's adapter normalizes it, and a bad scope, class routes in a capability file, duplicates and bad JSON invalidate only their own file";

export async function run() {
  const { discoverRegistrations } = await registration();
  assert.equal(typeof discoverRegistrations, 'function', 'discoverRegistrations is not exported');
  const good = { [ROUTES_PATH]: ROUTES, 'packages/kaal-release/kaal-pull.json': capability('release') };
  let r = discoverRegistrations(main(good));
  assert.equal(r.accepted, true, 'a valid tree was not accepted');
  assert.equal(r.source, 'main', 'the source is not main');
  assert.deepEqual(r.classRoutes, { HOTFIX: ['hotfix/*'], WIRE: ['wire/*'] }, 'the class routes were not read');
  assert.deepEqual(r.stocks, ['kaal/release/*'], 'the registered stock was not read');
  assert.ok(!('collectors' in r), 'the adapter still enumerates collector branches');
  assert.deepEqual(r.problems, [], 'a valid tree has problems');
  // The normalized, host-neutral registry: ordered classes with routes (the stock scopes). No per-branch opt-in, no inventory.
  assert.deepEqual(r.registry, { accepted: true, authority: 'main', classes: [
    { name: 'HOTFIX', routes: ['hotfix/*'] },
    { name: 'WIRE', routes: ['wire/*'] },
    { name: 'KAAL', routes: ['kaal/release/*'] },
  ] }, 'the normalized registry is not what the adapter should produce');

  // Each invalid file contributes nothing and is named; a valid neighbour still counts.
  const P = 'packages/kaal-a/kaal-pull.json';
  const cases = [
    [JSON.stringify({ capability: 'a', stock: 'kaal/a/x' }), 'an exact branch instead of a stock scope'],
    [JSON.stringify({ capability: 'a', stock: 'kaal/*' }), 'a scope wider than the capability'],
    [JSON.stringify({ capability: 'a', stock: 'kaal/b/*' }), "another capability's stock"],
    [JSON.stringify({ capability: 'a', stock: 'kaal/a/x*' }), 'a wildcard inside a name'],
    [JSON.stringify({ capability: 'a', collectors: ['kaal/a/x'] }), 'a per-branch collector list'],
    [JSON.stringify({ capability: 'a', stock: 'kaal/a/*', classRoutes: { HOTFIX: ['hotfix/*'] } }), 'class routes in a capability file'],
    ['{not json', 'unparsable JSON'],
    [JSON.stringify({ capability: 'a' }), 'a wrong shape'],
  ];
  for (const [text, what] of cases) {
    r = discoverRegistrations(main({ ...good, [P]: text }));
    assert.ok(!r.stocks.some((c) => c.startsWith('kaal/a/')), `${what} was accepted`);
    assert.ok(r.problems.some((p) => p.includes(P)), `${what} is not named in problems`);
    assert.ok(r.stocks.includes('kaal/release/*'), `${what} invalidated a valid neighbour`);
  }
  // The same stock in two files: neither silently wins.
  r = discoverRegistrations(main({ ...good, 'packages/kaal-b/kaal-pull.json': capability('release') }));
  assert.ok(r.problems.some((p) => /duplicate|already/i.test(p)), 'a duplicate stock across files was not named');
  // Class routes: only Engineering's file, only the two classes, only their own prefix.
  r = discoverRegistrations(main({ [ROUTES_PATH]: JSON.stringify({ classRoutes: { KAAL: ['kaal/*'], HOTFIX: ['hotfix/*'] } }) }));
  assert.ok(!(r.classRoutes.KAAL?.length), 'a KAAL class route was accepted');
  assert.ok(r.problems.length > 0, 'an invalid class routes file is not named');
  r = discoverRegistrations(main({ [ROUTES_PATH]: JSON.stringify({ classRoutes: { WIRE: ['hotfix/*'] } }) }));
  assert.deepEqual(r.classRoutes.WIRE ?? [], [], 'a route outside its class prefix was accepted');
  // Only main's tip counts.
  assert.equal(discoverRegistrations({ ref: 'kaal/release/pull-lane', files: good }).accepted, false, 'a collector tree was accepted');
  assert.notEqual(discoverRegistrations({ ref: 'kaal/release/pull-lane', files: good }).registry?.accepted, true, 'a collector tree produced an accepted registry');
  assert.equal(discoverRegistrations(undefined).accepted, false, 'a missing tree was accepted');
}
