import test from 'node:test';
test('asks a service that is down', () => { throw new Error('service unreachable'); });
