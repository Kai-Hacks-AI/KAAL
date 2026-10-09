import assert from 'node:assert/strict';
import { createLedger } from '../ledger.mjs';

const ledger = createLedger();
assert.equal(ledger.append({ a: 1 }), 1);
assert.equal(ledger.append({ b: 2 }), 2);
assert.equal(ledger.retract(1), true);
assert.equal(ledger.retract(99), false);
console.log('ledger.test: ok');
