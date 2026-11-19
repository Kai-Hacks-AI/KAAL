import { describe, it } from 'node:test';
describe('c', { concurrency: true }, () => {
  it('slow', async () => { await new Promise((r) => setTimeout(r, 60)); });
  it('fast', () => {});
});
it('top', () => {});
