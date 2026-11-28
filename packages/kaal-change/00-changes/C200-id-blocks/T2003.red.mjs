// Case change/T2003 tests: change/G21
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkIdBlock } from '../../lib/id-blocks.mjs';
export const id = 'change/T2003';
export const tests = ['change/G21'];
export const closes = ['change/G21'];
export const title = 'a register or an owner it cannot read is UNKNOWN with the fact named, never a pass';
const good = { blocks: [{ capability: 'change', kind: 'change', from: 200, to: 299 }] };
export function run() {
  for (const register of [undefined, null, 7, {}, { blocks: 'x' }, { blocks: [{ capability: 'a', kind: 'other', from: 1, to: 2 }] }, { blocks: [{ capability: 'a', kind: 'change', from: 5, to: 2 }] }]) {
    const r = checkIdBlock({ register, owned: [] });
    assert.equal(r.verdict, 'unknown', JSON.stringify(register) + ' was judged');
    assert.equal(r.fact, 'register');
  }
  for (const owned of [undefined, 'x', [{ kind: 'change', id: 200, path: 'p' }], [{ capability: 'change', kind: 'change', id: '200', path: 'p' }]]) {
    const r = checkIdBlock({ register: good, owned });
    assert.equal(r.verdict, 'unknown', JSON.stringify(owned) + ' was judged');
    assert.equal(r.fact, 'owned');
  }
}
test(id, () => run());
