// Finding F1, R4. Exits 1 while append accepts a non-object.
import assert from 'node:assert/strict';
import { createLedger } from './ledger.mjs';
assert.throws(() => createLedger().append('text'), TypeError);
console.log('F1: R4 holds');
