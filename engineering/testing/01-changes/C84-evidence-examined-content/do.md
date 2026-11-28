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

## Restored after the SYNC

`main` held C83, which edits the same five files, so an interim DO took this Change's edits out and a SYNC merged `main` clean. This DO puts them back on top of `main`: `./identity` next to `./mutate` in `package.json`, both exports in `T160` and `T369`, the `kaal-testing/identity` paragraph next to the `mutate` one in the README, and `lib/identity.mjs` and `lib/mutate.mjs` both in the packed list. `T420` to `T425` are GREEN in place again (6 of 6), and `T414` to `T419` and `T426` stay GREEN. `kaal-testing` `npm test`: 119 pass, 2 fail, the same 2 as on `main` (`T388` and `T369` need Node 24; `T369` passes its export assertion before it reaches the Node check).
