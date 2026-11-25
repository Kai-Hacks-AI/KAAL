import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findRecordDue } from '../skills/kaal-controls/scripts/demand-record.mjs';

const base = {
  discrepancies: [], unknown: [], owners: { a: 'controls' }, pr: { capability: 'controls' },
  timing: ['defined', 'implemented', 'running', 'tested'].map((fact) => ({ control: 'a', fact, revision: 's', followsEvidence: true })),
  observed: [{ control: 'a', revision: 's', installed: true, operationalEvidence: true, testing: 'operational' }], revision: 's',
};

test('nothing discrepant gives nothing due', () => assert.deepEqual(findRecordDue(base), []));
test('a duplicated discrepancy gives one name', () => {
  assert.deepEqual(findRecordDue({ ...base, discrepancies: ['running:lags:a', 'running:lags:a'] }), ['record-due:running:lags:a']);
});
test('a control id containing a colon is kept whole', () => {
  const r = findRecordDue({ ...base, discrepancies: ['defined:lags:x:y'], owners: { 'x:y': 'controls' }, timing: [{ control: 'x:y', fact: 'defined', revision: 's', followsEvidence: true }], observed: [{ control: 'x:y', revision: 's', installed: true, operationalEvidence: true, testing: 'pre' }] });
  assert.deepEqual(r, ['record-due:defined:lags:x:y']);
});
test('an observation with an unknown testing kind throws', () => {
  assert.throws(() => findRecordDue({ ...base, discrepancies: ['running:lags:a'], observed: [{ ...base.observed[0], testing: 'maybe' }] }));
});
