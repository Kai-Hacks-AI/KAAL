import { it } from 'node:test';
it('before block', () => {});
it('blocks the event loop', () => { for (;;) { /* never yields */ } });
it('after block', () => {});
