// Case pull/T51 tests: pull/F50
import assert from 'node:assert/strict';
import { registration, ROUTES_PATH, ROUTES, capability, main } from './lib.mjs';
export const id = 'pull/T51';
export const tests = ['pull/F50'];
export const title = 'the accepted registration is discovered on main and validated: wildcards, other capabilities, class routes in a capability file, duplicates and bad JSON invalidate only their own file';

export async function run() {
  const { discoverRegistrations } = await registration();
  assert.equal(typeof discoverRegistrations, 'function', 'discoverRegistrations is not exported');
  const good = { [ROUTES_PATH]: ROUTES, 'packages/kaal-release/kaal-pull.json': capability('release', ['kaal/release/pull-lane', 'kaal/release/plan']) };
  let r = discoverRegistrations(main(good));
  assert.equal(r.accepted, true, 'a valid tree was not accepted');
  assert.equal(r.source, 'main', 'the source is not main');
  assert.deepEqual(r.classRoutes, { HOTFIX: ['hotfix/*'], WIRE: ['wire/*'] }, 'the class routes were not read');
  assert.deepEqual([...r.collectors].sort(), ['kaal/release/plan', 'kaal/release/pull-lane'], 'the registered collectors were not read');
  assert.deepEqual(r.problems, [], 'a valid tree has problems');

  // Each invalid file contributes nothing and is named; a valid neighbour still counts.
  const bad = (path, text) => discoverRegistrations(main({ ...good, [path]: text }));
  const cases = [
    ['packages/kaal-a/kaal-pull.json', capability('a', ['kaal/a/*']), 'a wildcard'],
    ['packages/kaal-a/kaal-pull.json', capability('a', ['kaal/b/x']), "another capability's collector"],
    ['packages/kaal-a/kaal-pull.json', JSON.stringify({ capability: 'a', collectors: ['kaal/a/x'], classRoutes: { HOTFIX: ['hotfix/*'] } }), 'class routes in a capability file'],
    ['packages/kaal-a/kaal-pull.json', '{not json', 'unparsable JSON'],
    ['packages/kaal-a/kaal-pull.json', JSON.stringify({ capability: 'a' }), 'a wrong shape'],
    ['packages/kaal-a/kaal-pull.json', capability('a', ['kaal/release/plan']), "a collector another file already registered (and not its own)"],
  ];
  for (const [path, text, what] of cases) {
    r = bad(path, text);
    assert.ok(!r.collectors.some((c) => c.startsWith('kaal/a/')), `${what} was accepted`);
    assert.ok(r.problems.some((p) => p.includes(path)), `${what} is not named in problems`);
    assert.ok(r.collectors.includes('kaal/release/pull-lane'), `${what} invalidated a valid neighbour`);
  }
  // A duplicate of one collector in two valid-looking files: neither silently wins.
  r = discoverRegistrations(main({ ...good, 'packages/kaal-b/kaal-pull.json': capability('release', ['kaal/release/pull-lane']) }));
  assert.ok(r.problems.some((p) => /duplicate|already/i.test(p)), 'a duplicate collector across files was not named');
  // Class routes: only Engineering's file, only the two classes, only their own prefix.
  r = discoverRegistrations(main({ [ROUTES_PATH]: JSON.stringify({ classRoutes: { KAAL: ['kaal/*'], HOTFIX: ['hotfix/*'] } }) }));
  assert.ok(!(r.classRoutes.KAAL?.length), 'a KAAL class route was accepted');
  assert.ok(r.problems.length > 0, 'an invalid class routes file is not named');
  r = discoverRegistrations(main({ [ROUTES_PATH]: JSON.stringify({ classRoutes: { WIRE: ['hotfix/*'] } }) }));
  assert.deepEqual(r.classRoutes.WIRE ?? [], [], 'a route outside its class prefix was accepted');
  // Only main's tip counts.
  assert.equal(discoverRegistrations({ ref: 'kaal/release/pull-lane', files: good }).accepted, false, 'a collector tree was accepted');
  assert.equal(discoverRegistrations(undefined).accepted, false, 'a missing tree was accepted');
}
