import test from 'node:test';
test('waits for a service that never answers', () => new Promise(() => {}));
