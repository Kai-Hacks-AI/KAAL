// Case pull/T460 tests: pull/F60
import assert from 'node:assert/strict';
import { registration, optIn, main, coreOf, CORE } from './lib.mjs';
export const id = 'pull/T460';
export const tests = ['pull/F60'];
export const title = "a Pull opt-in is valid only for a scope the accepted Core Registration on main claims for an admitted Capability; Engineering turns it into stock routes, and no PR head authorizes itself";

export async function run() {
  const { discoverRegistrations } = await registration();
  assert.equal(typeof discoverRegistrations, 'function', 'discoverRegistrations is not exported');
  const P = 'packages/kaal-release/kaal-pull.json';
  const stocks = (r) => Object.fromEntries(r.registry.stocks.map((s) => [s.name, s.routes]));
  // Opted in, with a valid Core scope: the stock route is the Core-claimed scope, in KAAL's branch form.
  let r = discoverRegistrations(main({ [P]: optIn('release') }), CORE);
  assert.equal(r.accepted, true, 'a valid tree was not accepted');
  assert.equal(r.source, 'main', 'the source is not main');
  assert.deepEqual(r.classRoutes, { HOTFIX: ['hotfix/*'], WIRE: ['wire/*'] }, "KAAL's hotfix and wire routes are not provided by the adapter");
  assert.deepEqual(r.problems, [], 'a valid tree has problems');
  assert.deepEqual(r.registry, { accepted: true, stocks: [
    { name: 'HOTFIX', routes: ['hotfix/*'] },
    { name: 'WIRE', routes: ['wire/*'] },
    { name: 'KAAL', routes: ['kaal/release/*'], pull: 'open-promotion', type: 'PROMOTION' },
  ] }, 'the normalized registry is not what the adapter should produce');
  // Registered in Core without an opt-in: no route, so nothing of that capability is auto-pulled (its GREEN items are judge-pulled).
  r = discoverRegistrations(main({}), CORE);
  assert.deepEqual(stocks(r).KAAL, [], 'a Core-registered capability without a Pull opt-in was auto-pulled');
  assert.deepEqual(r.problems, [], 'a registered capability without an opt-in is a problem');
  // Missing, invalid or ambiguous Core scope: the opt-in contributes nothing and is named.
  const bad = [
    [CORE, optIn('ghost'), 'a scope no Registration claims'],
    [coreOf([{ scope: 'release', holder: 'Skillish' }], { capabilities: new Set(['Release']) }), optIn('release'), 'a scope held by something that is not an admitted Capability'],
    [{ registrations: { claims: [{ scope: 'release', holder: 'Release' }, { scope: 'release', holder: 'Other' }], collisions: ['release'] }, capabilities: new Set(['Release', 'Other']) }, optIn('release'), 'a scope claimed by several holders'],
    [undefined, optIn('release'), 'no Core evidence at all'],
    [{ registrations: null, capabilities: null }, optIn('release'), 'unreadable Core evidence'],
    [{ registrations: { claims: [], collisions: [] }, capabilities: new Set() }, optIn('release'), 'empty Core evidence'],
    [CORE, JSON.stringify({ capability: 'release' }), 'the old name-only shape (no Core scope claim)'],
    [CORE, JSON.stringify({ scope: 'release', capability: 'release' }), 'a second identity next to the scope'],
    [CORE, JSON.stringify({ scope: 'release/x' }), 'a scope that is not one path segment'],
    [CORE, JSON.stringify({ scope: 'rel*' }), 'a wildcard scope'],
    [CORE, JSON.stringify({ scope: 'release', classRoutes: { HOTFIX: ['hotfix/*'] } }), 'class routes in a capability file'],
    [CORE, '{not json', 'unparsable JSON'],
    [CORE, JSON.stringify({}), 'a wrong shape'],
  ];
  for (const [core, text, what] of bad) {
    r = discoverRegistrations(main({ [P]: text }), core);
    assert.deepEqual(stocks(r).KAAL, [], `${what} was accepted`);
    assert.ok(r.problems.some((p) => p.includes(P)), `${what} is not named in problems`);
  }
  // A bad file does not invalidate a valid neighbour.
  r = discoverRegistrations(main({ [P]: optIn('release'), 'packages/kaal-x/kaal-pull.json': optIn('ghost') }), CORE);
  assert.deepEqual(stocks(r).KAAL, ['kaal/release/*'], 'a bad neighbour invalidated a valid opt-in');
  // The same scope opted in by two files: neither silently wins.
  r = discoverRegistrations(main({ [P]: optIn('release'), 'packages/kaal-b/kaal-pull.json': optIn('release') }), CORE);
  assert.ok(r.problems.some((p) => /duplicate|already/i.test(p)), 'a duplicate opt-in was not named');
  // No self-authorization from a PR head: only main's tip counts, for the opt-in files and for the Core evidence alike.
  const head = discoverRegistrations({ ref: 'kaal/release/pull-lane', files: { [P]: optIn('release') } }, CORE);
  assert.equal(head.accepted, false, 'a collector tree was accepted');
  assert.deepEqual(stocks(head).KAAL, [], 'an opt-in on a PR head enrolled its own capability');
  r = discoverRegistrations(main({ [P]: optIn('release') }), { ...CORE, head: coreOf([{ scope: 'release', holder: 'Release' }]) });
  assert.equal(r.accepted, true, 'an unrelated property broke the evidence');
  r = discoverRegistrations(main({ [P]: optIn('mine') }), { ...CORE, head: coreOf([{ scope: 'mine', holder: 'Mine' }]) });
  assert.deepEqual(stocks(r).KAAL, [], 'Core evidence carried by a head authorized its own scope');
  assert.equal(discoverRegistrations(undefined, CORE).accepted, false, 'a missing tree was accepted');
}
