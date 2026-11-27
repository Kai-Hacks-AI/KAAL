import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assessRecord, findDisagreeing } from '../skills/kaal-controls/scripts/verify-record.mjs';

const claimed = { defined: true, implemented: true, running: true, tested: true };
const fact = (o = {}) => ({ revision: 's', ...claimed, ...o });
const c = (id, over = {}) => ({ id, claimed: { ...claimed, ...over } });

test('a control with no entry is unknown in all four facts', () => {
  const r = assessRecord({ controls: [c('a'), c('b')], facts: { a: fact() }, revision: 's' });
  assert.deepEqual(r, { findings: [], unknown: ['defined:b', 'implemented:b', 'running:b', 'tested:b'] });
});
test('each fact is compared alone', () => {
  const r = assessRecord({ controls: [c('a', { running: false })], facts: { a: fact() }, revision: 's' });
  assert.deepEqual(r.findings, ['running:lags:a']);
});
test('an all-agreeing set is clean', () => {
  assert.deepEqual(findDisagreeing({ controls: [c('a')], facts: { a: fact() }, revision: 's' }), []);
});
test('a claim that is not a boolean throws', () => {
  assert.throws(() => assessRecord({ controls: [c('a', { tested: 'yes' })], facts: { a: fact() }, revision: 's' }));
});
