import { it } from 'node:test';
it('green', () => {});
it('hangs', () => new Promise(() => { setInterval(() => {}, 1000); }));
it('pending one', () => {});
it('pending two', () => {});
