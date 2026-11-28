// Case change/T2001 tests: change/G21
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkIdBlock } from '../../lib/id-blocks.mjs';
export const id = 'change/T2001';
export const tests = ['change/G21'];
export const closes = ['change/G21'];
export const title = 'an id above the legacy ceiling must lie in a block of the capability that owns the path';
const register = { blocks: [
  { capability: 'change', kind: 'change', from: 200, to: 299 },
  { capability: 'release', kind: 'change', from: 300, to: 399 },
  { capability: 'change', kind: 'case', from: 2000, to: 2199 },
] };
const own = (capability, kind, n, path = 'p/' + kind + n) => ({ capability, kind, id: n, path });
export function run() {
  assert.equal(checkIdBlock({ register, owned: [own('change', 'change', 200), own('change', 'case', 2003)] }).verdict, 'pass');
  const taken = checkIdBlock({ register, owned: [own('change', 'change', 300)] });
  assert.equal(taken.verdict, 'fail', 'a number of another capability passed');
  assert.deepEqual(taken.findings.map(f => [f.kind, f.capability, f.id]), [['outside', 'change', 300]]);
  const none = checkIdBlock({ register, owned: [own('hosting', 'change', 250)] });
  assert.equal(none.verdict, 'fail', 'a capability without a block passed');
  assert.equal(checkIdBlock({ register, owned: [own('change', 'case', 300)] }).verdict, 'fail', 'a change block admitted a case id');
}
test(id, () => run());
