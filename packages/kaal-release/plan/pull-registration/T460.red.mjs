// Case pull/T460 tests: pull/F60
import assert from 'node:assert/strict';
import { registration, capability, main } from './lib.mjs';
export const id = 'pull/T460';
export const tests = ['pull/F60'];
export const title = "a capability opts in by name on main; KAAL's adapter turns it into stock routes, and a bad file, a duplicate or a tree that is not main invalidates only itself or fails closed";

export async function run() {
  const { discoverRegistrations } = await registration();
  assert.equal(typeof discoverRegistrations, 'function', 'discoverRegistrations is not exported');
  const good = { 'packages/kaal-release/kaal-pull.json': capability('release') };
  let r = discoverRegistrations(main(good));
  assert.equal(r.accepted, true, 'a valid tree was not accepted');
  assert.equal(r.source, 'main', 'the source is not main');
  assert.deepEqual(r.classRoutes, { HOTFIX: ['hotfix/*'], WIRE: ['wire/*'] }, "KAAL's hotfix and wire routes are not provided by the adapter");
  assert.deepEqual(r.problems, [], 'a valid tree has problems');
  // The normalized, host-neutral registry: ordered stocks with branch routes. No branch list, no per-branch opt-in.
  assert.deepEqual(r.registry, { accepted: true, stocks: [
    { name: 'HOTFIX', routes: ['hotfix/*'] },
    { name: 'WIRE', routes: ['wire/*'] },
    { name: 'KAAL', routes: ['kaal/release/*'] },
  ] }, 'the normalized registry is not what the adapter should produce');
  // With no capability opted in, hotfix/* and wire/* are still stocks and KAAL has no route.
  r = discoverRegistrations(main({}));
  assert.deepEqual(r.registry.stocks.map((s) => [s.name, s.routes.length]), [['HOTFIX', 1], ['WIRE', 1], ['KAAL', 0]], 'the stocks without an opt-in are wrong');

  // Each invalid file contributes nothing and is named; a valid neighbour still counts.
  const P = 'packages/kaal-a/kaal-pull.json';
  const bad = [
    [JSON.stringify({ capability: 'a', stock: 'kaal/*' }), 'a stock scope instead of a name'],
    [JSON.stringify({ capability: 'a', collectors: ['kaal/a/x'] }), 'a per-branch list'],
    [JSON.stringify({ capability: 'a/b' }), 'a name that is not one path segment'],
    [JSON.stringify({ capability: 'a*' }), 'a wildcard in the name'],
    [JSON.stringify({ capability: 'a', classRoutes: { HOTFIX: ['hotfix/*'] } }), 'class routes in a capability file'],
    ['{not json', 'unparsable JSON'],
    [JSON.stringify({}), 'a wrong shape'],
  ];
  for (const [text, what] of bad) {
    r = discoverRegistrations(main({ ...good, [P]: text }));
    assert.ok(!r.registry.stocks.some((s) => s.routes.some((x) => x.startsWith('kaal/a'))), `${what} was accepted`);
    assert.ok(r.problems.some((p) => p.includes(P)), `${what} is not named in problems`);
    assert.ok(r.registry.stocks.some((s) => s.routes.includes('kaal/release/*')), `${what} invalidated a valid neighbour`);
  }
  // The same capability in two files: neither silently wins.
  r = discoverRegistrations(main({ ...good, 'packages/kaal-b/kaal-pull.json': capability('release') }));
  assert.ok(r.problems.some((p) => /duplicate|already/i.test(p)), 'a duplicate across files was not named');
  // Only main counts.
  assert.equal(discoverRegistrations({ ref: 'kaal/release/pull-lane', files: good }).accepted, false, 'a collector tree was accepted');
  assert.notEqual(discoverRegistrations({ ref: 'kaal/release/pull-lane', files: good }).registry?.accepted, true, 'a collector tree produced an accepted registry');
  assert.equal(discoverRegistrations(undefined).accepted, false, 'a missing tree was accepted');
}
