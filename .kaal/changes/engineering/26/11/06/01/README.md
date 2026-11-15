# Engineering: the carried-entry parser hands callers an ordinary object (answers a regression in T95)

Capability: Engineering. Collector: kaal/engineering. Record number is provisional until
integration.

## Intent

The strict ledger parser builds null-prototype objects so a `__proto__` key stays an own property (Codex finding on the checker Change). That change also leaked a null-prototype entry out of `appendedEntry`, and the RED Case engineering/T95 (R6), which compares the entry with an ordinary object, went RED again. The RED files are run by hand, so no lane caught it.

## Plan and Do

`appendedEntry` returns `JSON.parse(JSON.stringify(entry))`, an ordinary copy; the parser itself is unchanged and `__proto__` handling is untouched.

## Check

`ledger-in-promotion.red.mjs`: 20 of 20 GREEN on this branch (T108 to T110 included, with the review workflows on the collector). `check.test.mjs`, `carried-entry.test.mjs` and `attest.test.mjs`: 46 of 46 GREEN. The RED file is run as the last step before any promotion head is presented.

## Act

Not authorized: promotion or publication.
