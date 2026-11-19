import test from 'node:test';
import assert from 'node:assert/strict';
test('rounds half up', () => assert.equal(Math.round(2.5), 3));
test('keeps order', () => assert.deepEqual([...'ab'].reverse().reverse(), ['a', 'b']));
test('rounds half down', () => assert.equal(Math.round(2.5), 2));
