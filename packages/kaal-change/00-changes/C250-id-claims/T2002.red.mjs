// Case change/T2002 tests: change/G21
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkIdClaim } from '../../lib/id-claims.mjs';
export const id = 'change/T2002';
export const tests = ['change/G21'];
export const closes = ['change/G21'];
export const title = 'legacy ids, below the lowest claim of their kind, are not judged, and a number taken twice in the data is a duplicate';
const claims = [
  { capability: 'change', kind: 'change', from: 1000, to: 1099 },
  { capability: 'change', kind: 'case', from: 5000, to: 5199 },
];
const own = (capability, kind, n, path) => ({ capability, kind, id: n, path });
export function run() {
  const legacy = [own('release', 'change', 175, 'a/C175'), own('controls', 'change', 175, 'b/C175'), own('hosting', 'case', 1740, 'c/T1740'), own('review', 'case', 4999, 'd/T4999')];
  assert.equal(checkIdClaim({ claims, owned: legacy }).verdict, 'pass', 'a legacy id was judged');
  const twice = checkIdClaim({ claims, owned: [own('change', 'change', 1001, 'x/C1001'), own('change', 'change', 1001, 'y/C1001')] });
  assert.equal(twice.verdict, 'fail');
  assert.deepEqual(twice.findings.map(f => [f.kind, f.id]), [['duplicate', 1001]]);
  assert.deepEqual(twice.findings[0].paths, ['x/C1001', 'y/C1001']);
  assert.equal(checkIdClaim({ claims, owned: [own('change', 'change', 1001, 'x/C1001'), own('change', 'case', 5000, 'y/T5000')] }).verdict, 'pass', 'a change id and a case id of the same number clashed');
}
test(id, () => run());
