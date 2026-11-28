// Case change/T2003 tests: change/G21
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkIdClaim } from '../../lib/id-claims.mjs';
export const id = 'change/T2003';
export const tests = ['change/G21'];
export const closes = ['change/G21'];
export const title = 'claims or an owner it cannot read are UNKNOWN with the fact named, never a pass';
const good = [{ capability: 'change', kind: 'change', from: 1000, to: 1099 }];
export function run() {
  for (const claims of [undefined, null, 7, {}, 'x', [{ capability: 'a', kind: 'other', from: 1, to: 2 }], [{ capability: 'a', kind: 'change', from: 5, to: 2 }], [{ kind: 'change', from: 1, to: 2 }]]) {
    const r = checkIdClaim({ claims, owned: [] });
    assert.equal(r.verdict, 'unknown', JSON.stringify(claims) + ' was judged');
    assert.equal(r.fact, 'claims');
  }
  for (const owned of [undefined, 'x', [{ kind: 'change', id: 1000, path: 'p' }], [{ capability: 'change', kind: 'change', id: '1000', path: 'p' }]]) {
    const r = checkIdClaim({ claims: good, owned });
    assert.equal(r.verdict, 'unknown', JSON.stringify(owned) + ' was judged');
    assert.equal(r.fact, 'owned');
  }
}
test(id, () => run());
