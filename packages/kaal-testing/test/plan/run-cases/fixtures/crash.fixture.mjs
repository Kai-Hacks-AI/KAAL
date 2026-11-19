import { it } from 'node:test';
it('first green', () => {});
it('second green', () => {});
it('exits', () => { process.exit(3); });
it('never reached', () => {});
