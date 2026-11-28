// Case change/T2002 tests: change/G21
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkIdBlock } from '../../lib/id-blocks.mjs';
export const id = 'change/T2002';
export const tests = ['change/G21'];
export const closes = ['change/G21'];
export const title = 'legacy ids are not judged against a block, and a number taken twice in the data is a duplicate';
const register = { blocks: [
  { capability: 'change', kind: 'change', from: 200, to: 299 },
  { capability: 'change', kind: 'case', from: 2000, to: 2199 },
] };
const own = (capability, kind, n, path) => ({ capability, kind, id: n, path });
export function run() {
  const legacy = [own('release', 'change', 175, 'a/C175'), own('controls', 'change', 175, 'b/C175'), own('hosting', 'case', 1740, 'c/T1740'), own('review', 'case', 1999, 'd/T1999')];
  assert.equal(checkIdBlock({ register, owned: legacy }).verdict, 'pass', 'a legacy id was judged');
  const twice = checkIdBlock({ register, owned: [own('change', 'change', 201, 'x/C201'), own('change', 'change', 201, 'y/C201')] });
  assert.equal(twice.verdict, 'fail');
  assert.deepEqual(twice.findings.map(f => [f.kind, f.id]), [['duplicate', 201]]);
  assert.deepEqual(twice.findings[0].paths, ['x/C201', 'y/C201']);
  assert.equal(checkIdBlock({ register, owned: [own('change', 'change', 201, 'x/C201'), own('change', 'case', 2000, 'y/T2000')] }).verdict, 'pass', 'a change id and a case id of the same number clashed');
}
test(id, () => run());
