# Engineering: Change Isolation admits a carried ledger entry only with a bound attestation (PLAN #1019, Change 2 of 3)

Capability: Engineering. Collector: kaal/engineering. Record number is provisional until
integration.

## Intent

A promotion carries its own transition ledger entry instead of needing a ledger-only PR first (Owner, 5 November 2026). The entry admits the change only when an author-independent code owner has approved at the exact head with a line that names the entry's canonical digest. The checker fails closed when the attestation cannot be established.

## Plan and Do

PLAN: `engineering/change-isolation/ledger-in-promotion-plan.md` (#1019, CPO-approved at 126cb31). RED Cases: `ledger-in-promotion.red.mjs`, engineering/T90 to T110 (#1098).

- `check.mjs`: `check(paths, { carried, attested })`; `canonicalEntry` (RFC 8785 bytes), `entryDigest` (Foundation SHA-256, never `node:crypto`), `appendedEntry` (exactly one appended entry, strict JSON with duplicate keys refused), `--candidate-ledger` and `--attested` on the command line. A carried entry without a matching attestation admits nothing. Without Foundation's file beside the checker the result is "cannot judge" (exit 2).
- `attestation.mjs`: `judgeAttestation` (state APPROVED, `commit_id` equal to the judged head, a pinned code owner who is not the author, latest ruling per reviewer, exactly one matching line, head unchanged at the end) and `readAttesters`.
- `attesters.json`: pinned code-owner ids, read from the target's tip. It names `kaihacksai` with the numeric id the reviews API reports; the Owner and CPO confirm it on review, because a wrong id would attest nothing and a right one authorizes.
- `attest.mjs`: the trusted adapter that reacquires every fact from the API and Git and prints the attested id and digest.
- `engineering/github/change-isolation.sh`: places Foundation's `sha256.mjs` from the target's tip beside the checker, and passes the candidate's ledger and `KAAL_ATTESTED` only when the trusted handler sets it. Unset, the candidate's ledger is ignored and the change is judged by the default rules, so the pre-push check keeps refusing what CI refuses.

## Check

`ledger-in-promotion.red.mjs`: 17 of 20 GREEN here, the three workflow Cases (T108 to T110) GREEN in Change 3. New tests: `carried-entry.test.mjs` (the command line on a real scratch repository, and as a lone copy beside Foundation's file) and `attest.test.mjs` (the adapter with a fake API and Git). Existing `check.test.mjs` unchanged and GREEN. The last two are added to `test:engineering`.

## Act

Not authorized: promotion or publication. R11 (hook agreement) is still planned with the hook change; the hook passes no candidate ledger, so it refuses what it cannot attest.
