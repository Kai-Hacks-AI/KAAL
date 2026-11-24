import { it } from 'node:test';
import assert from 'node:assert/strict';
it('asserts', () => assert.equal(1, 2));
it('throws', () => { throw new Error('boom'); });
it('green', () => {});
