import { it } from 'node:test';
it('green one', () => {});
it('green two', async () => {
  setTimeout(() => { throw new Error('late'); }, 30);
  await new Promise((r) => setTimeout(r, 5));
});
