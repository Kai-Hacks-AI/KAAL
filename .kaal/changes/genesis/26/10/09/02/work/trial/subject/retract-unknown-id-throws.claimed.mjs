// Finding F3 as claimed: "retract of an unknown id throws". Exits 1 if the claim is false.
import assert from 'node:assert/strict';
import { createLedger } from './ledger.mjs';
assert.throws(() => createLedger().retract(99));
console.log('F3: claim holds');
