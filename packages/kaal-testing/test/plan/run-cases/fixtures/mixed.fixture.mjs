import { it } from 'node:test';
import assert from 'node:assert/strict';
it('T1 red', () => assert.equal(1, 2));
it('T2 control', () => {});
it('T3 red', () => assert.equal(1, 2));
