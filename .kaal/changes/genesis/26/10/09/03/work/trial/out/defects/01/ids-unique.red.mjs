// Finding F2, R1. Exits 1 while the agreed architecture can give two entries one id.
// Preserved evidence. Run it with ledger.mjs beside it. Deliberately not under tests/, so the repository's green suites never collect it.
import assert from 'node:assert/strict';
import { createLedger } from './ledger.mjs';
const ledger = createLedger();
ledger.append({ a: 1 });
ledger.append({ b: 2 });
ledger.retract(1);
ledger.append({ c: 3 });
const ids = ledger.ids();
assert.equal(new Set(ids).size, ids.length, `R1 violated: ids ${JSON.stringify(ids)}`);
console.log('F2: R1 holds');
