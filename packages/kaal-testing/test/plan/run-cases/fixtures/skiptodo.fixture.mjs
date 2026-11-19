import { it } from 'node:test';
import assert from 'node:assert/strict';
it.skip('skipped', () => {});
it.todo('todo no body');
it('todo failing', { todo: true }, () => assert.equal(1, 2));
it('todo passing', { todo: true }, () => {});
it('skip option failing', { skip: 'why' }, () => assert.equal(1, 2));
it('green', () => {});
