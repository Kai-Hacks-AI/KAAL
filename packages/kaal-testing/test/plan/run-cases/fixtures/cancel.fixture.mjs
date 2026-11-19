import { it } from 'node:test';
it('before', () => {});
it('parent with pending children', { timeout: 300 }, async (t) => {
  await t.test('stuck', () => new Promise(() => {}));
  await t.test('pending child one', () => {});
  await t.test('pending child two', () => {});
});
it('after', () => {});
