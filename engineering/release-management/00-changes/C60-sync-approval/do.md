# C60 do

## What the DO added

- `01-intent/I33-refused-approval-reaches-a-person/I33.md`, equal to its draft.
- `05-src/sync-review/approve.mjs`: `classifyRefusal`. `cli.mjs`: the approving call is caught alone; only the refusal that names Actions not being permitted becomes the finding `approve Sync: Actions may not approve` with exit 1; every other failure still throws. The output `approval` is `approved`, `would-approve`, `refused` or `skipped`. `review.mjs`: `decideReview` takes `approval`, and `cli.mjs review` reads `KAAL_APPROVAL`.
- `05-src/sync-review/settings.json`, equal to its draft, and the Settings paragraph in `CTL8.md`; `has` of CTL8 and CTL9 is now `[release/I32, release/I33]`.
- `sync-review.yml` (a source, not installed): `approve Sync` hands on `approval`; `review Sync` needs `verify` and `approve` and reads `KAAL_APPROVAL`.
- T790 to T793 renamed from `.red.mjs` to `.test.mjs`; all green.

## Cases that moved with it

release/T751 and release/T752 now expect the two controls as the C58 drafts plus what this Change adds, and release/T757 expects `approve Sync` to need `verify` and `review Sync` to need both, as `change.md` said. Everything else of release/C58 is unchanged and green (T750, T753 to T756, T758, T759), as are release/T540 and release/T600.

## Not done

No `.github` file, ruleset or setting is changed and nothing is switched on. The WIRE of the changed workflow, turning on "Allow GitHub Actions to create and approve pull requests" and `KAAL_SYNC_APPROVE=on` are the Owner's steps; the first live approval is the evidence for the settings.
