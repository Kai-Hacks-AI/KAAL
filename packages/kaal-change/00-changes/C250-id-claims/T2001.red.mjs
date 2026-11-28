// Case change/T2001 tests: change/G21
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkIdClaim } from '../../lib/id-claims.mjs';
export const id = 'change/T2001';
export const tests = ['change/G21'];
export const closes = ['change/G21'];
export const title = 'an id at or above the lowest claim of its kind must lie in a claim of the capability that owns the path';
const claims = [
  { capability: 'change', kind: 'change', from: 1000, to: 1099 },
  { capability: 'release', kind: 'change', from: 1100, to: 1199 },
  { capability: 'change', kind: 'case', from: 5000, to: 5199 },
];
const own = (capability, kind, n, path = 'p/' + kind + n) => ({ capability, kind, id: n, path });
export function run() {
  assert.equal(checkIdClaim({ claims, owned: [own('change', 'change', 1003), own('change', 'case', 5003)] }).verdict, 'pass');
  const taken = checkIdClaim({ claims, owned: [own('change', 'change', 1100)] });
  assert.equal(taken.verdict, 'fail', 'a number claimed by another capability passed');
  assert.deepEqual(taken.findings.map(f => [f.kind, f.capability, f.id]), [['outside', 'change', 1100]]);
  assert.equal(checkIdClaim({ claims, owned: [own('hosting', 'change', 1050)] }).verdict, 'fail', 'a capability without a claim passed');
  assert.equal(checkIdClaim({ claims, owned: [own('change', 'case', 1003)] }).verdict, 'fail', 'a change claim admitted a case id');
  assert.equal(checkIdClaim({ claims, owned: [own('change', 'change', 1500)] }).verdict, 'fail', 'an unclaimed number above the lowest claim passed');
}
test(id, () => run());
