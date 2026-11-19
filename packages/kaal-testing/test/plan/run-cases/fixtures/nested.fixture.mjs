import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
describe('suite A', () => {
  it('passes', () => {});
  it('fails by assertion', () => assert.equal(1, 2));
  describe('inner', () => {
    it('dup', () => {});
    it('dup', () => assert.fail('second dup'));
  });
});
it('top', () => {});
