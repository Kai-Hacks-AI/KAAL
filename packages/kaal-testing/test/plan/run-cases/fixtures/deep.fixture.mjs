import { describe, it, test } from 'node:test';
import assert from 'node:assert/strict';
describe('L1', () => {
  it('ok1', () => {});
  describe('L2', () => {
    it('ok2', () => {});
    describe('L3', () => {
      it('ok3', () => {});
      describe('L4', () => {
        it('deep fails', () => assert.equal(1, 2));
        it('deep ok', () => {});
      });
    });
  });
});
test('P1', async (t) => {
  await t.test('P2', async (t2) => {
    await t2.test('P3', async (t3) => { await t3.test('p-leaf', () => {}); });
  });
});
