# Engineering promotion: a promotion carries its own ledger entry (hotfix content, without .github)

Capability: Engineering. Target: main, from a focused collector (kaal/engineering-hotfix).
Record number is provisional until integration.

## Intent

A promotion carries its own transition ledger entry, attested by an author-independent code owner at the exact head, instead of needing a ledger-only promotion first (Owner, 5 November 2026; PLAN #1019). This is the first of two promotions that deliver it: the checker side, everything except `.github`. The review-event workflows are the second promotion and follow once this is on main, because the handler needs this checker to exist there.

## Content

The hotfix content only (Owner, 6 November 2026, option A, narrowed): `check.mjs` (carried entry, canonical digest, strict parser), `attestation.mjs`, `attest.mjs`, pinned `attesters.json`, `change-isolation.sh` (places Foundation's SHA-256 beside the checker; passes the candidate ledger and `KAAL_ATTESTED` only when the trusted handler sets it), the tests (`carried-entry.test.mjs`, `attest.test.mjs`, added to `test:engineering`), the RED Cases `ledger-in-promotion.red.mjs` (T90 to T110), the PLAN, and the Change records. Other Engineering collector content, which has diverged from main, stays in the collector to reconcile later.

No ledger entry is carried: this change touches the checker and docs, which no entry admits, and is judged by the existing rules. The ledger on main is unchanged.

## Check

RED Cases: 17 of 20 GREEN here; T108 to T110 are static checks of the `.github` workflows and turn GREEN with the second promotion. `check.test.mjs`, `carried-entry.test.mjs`, `attest.test.mjs`: 39 of 39 GREEN against main's ledger. The pinned id in `attesters.json` (kaihacksai, 297627427) was confirmed by the Owner and CPO.

## Act

No ledger-bearing promotion, including Hosting 0.0.1, is eligible until a committed record of the live acceptance trial exists (CPO, 6 November 2026). No publication.
