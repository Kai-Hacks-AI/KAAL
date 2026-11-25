// Unit tests of the adapter library, beyond the Cases. A record with no run is never established, even when the established list names an empty run.
import test from 'node:test';
import assert from 'node:assert/strict';
import { executed, compareClaims, runControl } from '../skills/kaal-controls/scripts/adapter.mjs';
const rec = (o = {}) => ({ control: 'c/CTL1', x: 'real', run: 'r1', sha: 'abc', verdict: 'PASS', by: 'adapter', ...o });
const est = (o = {}) => ({ control: 'c/CTL1', run: 'r1', sha: 'abc', ...o });
test('a record with an empty run is never established, even by an established empty run', () => {
  assert.equal(executed({ id: 'c/CTL1', records: [rec({ run: '' })], revision: 'abc', established: [est({ run: '' })] }), null);
  assert.equal(executed({ id: 'c/CTL1', records: [rec({ run: undefined })], revision: 'abc', established: [est({ run: undefined })] }), null);
});
test('executed answers true or null and never false', () => {
  for (const records of [[], [rec()], [rec({ x: 'fixture' })]]) assert.notEqual(executed({ id: 'c/CTL1', records, revision: 'abc', established: [] }), false);
});
test('compareClaims treats a non-boolean fact as malformed and a missing claim as malformed', () => {
  const c = { defined: true, implemented: true, running: true, tested: true };
  assert.throws(() => compareClaims({ id: 'c/CTL1', claimed: c, facts: { ...c, running: 'yes' } }));
  assert.throws(() => compareClaims({ id: 'c/CTL1', claimed: { ...c, tested: undefined }, facts: c }));
});
test('an invalid id is unknown and blocks outside detective, and never records', async () => {
  const r = await runControl({ id: '', mode: 'preventive', check: () => [], input: {}, boundary: { x: 'real', run: 'r', sha: 's' } });
  assert.equal(r.verdict, 'UNKNOWN'); assert.equal(r.blocked, true); assert.equal(r.record, null);
});
