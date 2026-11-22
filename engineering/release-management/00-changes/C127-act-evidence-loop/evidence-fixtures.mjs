// Fixtures of the Cases of release/C127: ledger entries as data. Not a Case.
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
export const RM = fileURLToPath(import.meta.url).split('/00-changes/')[0];
export const LIB = join(RM, '05-src/phase/lib/evidence.mjs');
export const JUDGE = 'limit';
export const rec = (pr, extra = {}) => ({ kind: 'run', judge: JUDGE, check: 'limit Act', pr, merge: `m${pr}`, run: `r${pr}`, verdict: 'PASS', applies: true, attribution: 'complete', ...extra });
export const recs = (from, n, extra) => Array.from({ length: n }, (_, i) => rec(from + i, extra));
export const review = (outcome, extra = {}) => ({ kind: 'review', judge: JUDGE, outcome, reasons: ['the verdicts match the facts'], reviewer: 'someone', ...extra });
