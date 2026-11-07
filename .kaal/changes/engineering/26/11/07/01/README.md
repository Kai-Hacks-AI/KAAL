# Engineering: deferred attestation in the Change Isolation checker (B1, R1 stays strict)

Capability: Engineering. Target: kaal/engineering-b1. Record number is provisional until integration.

## Intent

Under the approved B1 PLAN a carried ledger entry needs two required checks: the pull request job judges everything except the attestation, and a separate review check judges the attestation. This Change gives the checker the first half, a deferred mode, and nothing else.

## Content

- `check.mjs`: `--attestation deferred` (with `--candidate-ledger`, exclusive with `--attested`). The one carried entry is judged in full (shape, paths, pre and post blobs, never `.github`, the ledger or the checker) as if attested with its own digest, and the pending `ledger-entry: <id> sha256:<digest>` line is printed. A candidate whose ledger is the target's carries nothing and is judged by the default rules.
- `engineering/github/change-isolation.sh`: passes the deferred mode only when `KAAL_ATTESTATION=deferred` is set by the job. Nothing sets it yet, so the pull request job stays STRICT. A separate activation Change, after the review check is required, sets it.
- `deferred.test.mjs` (T117 to T121, added to `test:engineering`): deferred admits a well-formed carried entry, refuses a bad entry, a wrong blob, an omitted path, `.github` or the checker, judges by the default rules without an entry, and is a usage error with `--attested` or without the candidate ledger.

No ledger entry is carried; this change touches the checker and its tests, which no entry admits.

## Check

`check.test.mjs`, `carried-entry.test.mjs`, `attest.test.mjs`, `deferred.test.mjs`: all GREEN here (45 tests in `engineering/change-isolation`).

## Act

Activation (setting `KAAL_ATTESTATION=deferred` in the pull request job) is held until the review check is required on `main`. No queue, ruleset, promotion or publication.
