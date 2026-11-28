// Case controls/T1556 tests: controls/F215
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const lib = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/adapter-ratchet.mjs');
export const id = 'controls/T1556';
export const tests = ['controls/F215'];
export const title = 'verify Adapter as a ratchet over the complete delivered controls: only confirmed bypasses are allowed, unknown never is, an incomplete inventory is unknown, and an empty baseline ends the ratchet';
const controls = [{ id: 'A' }, { id: 'B' }, { id: 'C' }];
const inventory = (entries, extra = {}) => ({ revision: 'r1', scope: 'delivery', complete: true, entries, ...extra });
const seen = (control, adapted) => ({ control, revision: 'r1', adapted });
const all = [seen('A', true), seen('B', false), seen('C', false)];
export async function run() {
  assert.ok(existsSync(lib), 'scripts/adapter-ratchet.mjs is absent');
  const { runAdapterRatchet } = await import(pathToFileURL(lib).href);
  assert.equal(typeof runAdapterRatchet, 'function', 'runAdapterRatchet is not exported');
  const go = (o = {}) => runAdapterRatchet({ controls, delivered: inventory(['A', 'B', 'C']), observed: all, revision: 'r1', scope: 'delivery', baseline: ['unadapted:B', 'unadapted:C'], previous: ['unadapted:B', 'unadapted:C'], ...o });
  const reasons = (r) => [...(r.reasons ?? [])].sort();
  // the bypasses at the base are allowed, and nothing else
  let r = await go();
  assert.equal(r.verdict, 'PASS'); assert.equal(r.blocked, false); assert.deepEqual(r.known, ['unadapted:B', 'unadapted:C']); assert.deepEqual(r.new, []);
  // a new bypass fails
  r = await go({ baseline: ['unadapted:B'], previous: ['unadapted:B'] });
  assert.equal(r.verdict, 'FAIL'); assert.equal(r.blocked, true); assert.deepEqual(r.new, ['unadapted:C']); assert.ok(reasons(r).includes('new-finding'));
  // a bypass that is fixed must leave the baseline in the same step (the allowance only shrinks)
  r = await go({ observed: [seen('A', true), seen('B', false), seen('C', true)] });
  assert.equal(r.verdict, 'FAIL'); assert.ok(reasons(r).includes('stale-allowance'));
  // a baseline that grew over the base's fails
  r = await go({ previous: ['unadapted:B'] });
  assert.equal(r.verdict, 'FAIL'); assert.ok(reasons(r).includes('baseline-grew'));
  // a name that is not a confirmed bypass is not an allowance
  r = await go({ baseline: ['unadapted:B', 'unadapted:C', 'unadapted:Z'], previous: ['unadapted:B', 'unadapted:C', 'unadapted:Z'] });
  assert.equal(r.verdict, 'FAIL'); assert.ok(reasons(r).includes('stale-allowance'));
  // unknown never becomes an allowance: a control with no observation makes the whole answer UNKNOWN, blocked, with what was confirmed kept beside it, even if the baseline names it
  for (const baseline of [['unadapted:B'], ['unadapted:B', 'unadapted:C']]) {
    r = await go({ observed: [seen('A', true), seen('B', false)], baseline, previous: baseline });
    assert.equal(r.verdict, 'UNKNOWN'); assert.equal(r.blocked, true); assert.deepEqual(r.confirmed, ['unadapted:B']);
  }
  r = await go({ observed: [seen('A', true), seen('B', false), seen('C', false), { control: 'C', revision: 'r1', adapted: true }] });
  assert.equal(r.verdict, 'UNKNOWN', 'contradictory observations');
  r = await go({ observed: [seen('A', true), seen('B', false), { control: 'C', revision: 'r0', adapted: false }] });
  assert.equal(r.verdict, 'UNKNOWN', 'a stale observation');
  // a delivered inventory that is not complete, stale, of another scope or malformed is unknown, never a pass, whatever the baseline holds
  for (const [why, delivered] of [
    ['not complete', inventory(['A', 'B', 'C'], { complete: false })],
    ['complete is not true', inventory(['A', 'B', 'C'], { complete: 'yes' })],
    ['stale revision', inventory(['A', 'B', 'C'], { revision: 'r0' })],
    ['another scope', inventory(['A', 'B', 'C'], { scope: 'other' })],
    ['entries not a list', { ...inventory([]), entries: 'A' }],
    ['entry malformed', inventory(['A', 5])],
    ['missing', undefined],
    ['a bare list, not an inventory', ['A', 'B', 'C']],
  ]) {
    r = await go({ delivered });
    assert.equal(r.verdict, 'UNKNOWN', `${why}: ${JSON.stringify(r)}`); assert.equal(r.blocked, true, why);
  }
  // an empty baseline with no bypass ends the ratchet: the control is plain preventive
  r = await go({ observed: [seen('A', true), seen('B', true), seen('C', true)], baseline: [], previous: [] });
  assert.equal(r.verdict, 'PASS'); assert.equal(r.spent, true); assert.equal(r.then, 'preventive');
  // a bypass with an empty baseline is refused outright
  r = await go({ baseline: [], previous: [] });
  assert.equal(r.verdict, 'FAIL'); assert.deepEqual(r.new, ['unadapted:B', 'unadapted:C']);
  // no revision or scope: unknown
  assert.equal((await go({ revision: undefined })).verdict, 'UNKNOWN');
  assert.equal((await go({ scope: '' })).verdict, 'UNKNOWN');
  assert.equal((await runAdapterRatchet()).verdict, 'UNKNOWN');
}
