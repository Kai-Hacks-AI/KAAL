import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findEvidenceDue } from '../skills/kaal-controls/scripts/demand-evidence.mjs';

const all = { revision: 's', defined: true, implemented: true, installed: true, running: true, testedPre: true, testedOperational: true };
const base = { mode: 'preventive', discovery: { revision: 's', complete: true }, transitions: [{ control: 'a', kind: 'enforcement', revision: 's' }], facts: { a: all }, authorizations: [{ control: 'a', kind: 'enforcement', revision: 's' }], revision: 's' };

test('a transition with several lacks gives sorted unique names', () => {
  const r = findEvidenceDue({ ...base, facts: { a: { ...all, running: false, defined: false } }, authorizations: [] });
  assert.deepEqual(r, ['evidence-due:enforcement:authorized:a', 'evidence-due:enforcement:defined:a', 'evidence-due:enforcement:running:a']);
});
test('a duplicated transition does not duplicate a finding', () => {
  const t = base.transitions[0];
  assert.deepEqual(findEvidenceDue({ ...base, transitions: [t, t], authorizations: [] }), ['evidence-due:enforcement:authorized:a']);
});
test('an authorization with a malformed entry throws', () => {
  assert.throws(() => findEvidenceDue({ ...base, authorizations: [{ control: 'a' }] }));
});
test('an unknown mode throws', () => {
  assert.throws(() => findEvidenceDue({ ...base, mode: 'advisory' }));
});
