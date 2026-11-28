// Case change/T2000 tests: change/G21
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { checkIdBlock } from '../../lib/id-blocks.mjs';
export const id = 'change/T2000';
export const tests = ['change/G21'];
export const closes = ['change/G21'];
export const title = 'the register holds disjoint blocks, one per capability and kind, and check Id Block finds an overlap';
export const FILE = new URL('../../13-source/ids/blocks.json', import.meta.url);
export const load = () => {
  assert.ok(existsSync(FILE), 'the register is absent');
  return JSON.parse(readFileSync(FILE, 'utf8'));
};
export function run() {
  const register = load();
  const verdict = checkIdBlock({ register, owned: [] });
  assert.equal(verdict.verdict, 'pass', 'the delivered register overlaps or is malformed');
  for (const kind of ['change', 'case']) assert.ok(register.blocks.some(b => b.kind === kind), 'no ' + kind + ' block');
  const overlapping = { blocks: [
    { capability: 'a', kind: 'change', from: 200, to: 299 },
    { capability: 'b', kind: 'change', from: 299, to: 399 },
  ] };
  const found = checkIdBlock({ register: overlapping, owned: [] });
  assert.equal(found.verdict, 'fail');
  assert.ok(found.findings.some(f => f.kind === 'overlap'));
  const sameNumberOtherKind = { blocks: [
    { capability: 'a', kind: 'change', from: 200, to: 299 },
    { capability: 'b', kind: 'case', from: 200, to: 299 },
  ] };
  assert.equal(checkIdBlock({ register: sameNumberOtherKind, owned: [] }).verdict, 'pass');
}
test(id, () => run());
