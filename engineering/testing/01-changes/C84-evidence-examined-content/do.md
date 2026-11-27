# C84 DO

## Placed

- `I52.md`, `F177.md`, `A63.md` under `10-intent`, `11-requirements`, `12-architecture`, equal to the drafts in `interface.md`.
- `packages/kaal-testing/lib/identity.mjs` (`./identity`): `checkIdentity({ recorded, examined })`, pure. An identity is a string with a non-whitespace character; equality is exact. Findings `examined-identity-missing`, `recorded-identity-missing`, `recorded-not-examined`. No source, no format.
- `packages/kaal-testing/lib/observation.mjs`: `assembleObservation` adds the findings of `checkIdentity({ recorded: revision, examined: expectedRevision })` to `evidence.integrity`; with a finding every Case is UNKNOWN and the catalog is not complete. A record whose identities are equal is unchanged. The command `observe-at` is unchanged (`--revision`, `--expect-revision`).
- `T160` and `T369` list `./identity` among the exports, `test/testing.test.mjs` lists `lib/identity.mjs` among the packed files, and the README describes the check.

## Results (Node 22.23.4)

- `T420` to `T425`: 6 of 6 GREEN in place (RED on the PLAN tree). `T411` to `T413` and `test/observation.test.mjs` stay GREEN.
- `kaal-testing` `npm test`: see the PR; the same 2 failures as on `main` are expected (`T388` and `T369` need Node 24).

## Not done, by the PLAN

No provider of content and provenance, no ratchet, no change to Release's records, no new flag, and no workflow, WIRE, flag, ruleset or required check. The check compares identities and does not know what was examined. The `C83` collector edits the same package files, so the second collector to land takes a SYNC.
