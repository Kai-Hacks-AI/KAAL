# C17 DO

## Implement

- `lib/records.mjs`: the reference form accepts a Defect id, `<capability>/D<n>`, beside a Requirement id, so `checkAddresses` gives it the same verdicts (F17), and `addressing(id, records)` returns the records that address an id, in the order handed in, derived and never stored (F18). Nothing else changes: no new field, no new library, no import, no write.
- The Cases T27 (F17), T28 (F18) and T29 (N3), `.red.mjs` renamed `.test.mjs` and moved beside their Requirement.

## Refactor

None. No A-record, Defect or Requirement of any package is read or changed, and no Control or gate is added. CARE, Born and Fixed are not recorded here (N3).

## Result

See `evidence.md`.
