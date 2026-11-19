# C95 do

The DO adds, from the drafts in `interface.md`: the Intent `I53.md`, the Requirement `F72.md`, the Architecture `A67.md`, the declaration `03-architecture/A67-delivery-locations/delivery-locations.json` (`.github`, `.githooks` and `.kaal`, each wirable), the reader `05-src/delivery/locations.mjs` (`parseLocations`, `readLocations`, `wirableTarget`), and it changes `05-src/promotion-raise/final-step.mjs` (`wireTarget` and `decideFinal` read the declaration) and `05-src/wiring/wire-judge.mjs` (`judge` reads it). T1159 to T1164 are renamed from `.red.mjs` to `.test.mjs`.

## Cases amended

None. The install judge's own Case (release/T282) and the Cases of release/C93 pass unchanged.

## Verified

`node --test engineering/cases/cases.test.mjs`: 283 tests, 271 pass, the same 12 pre-existing C15 failures (T268 to T279) as `main`. All `T*.test.mjs` under `engineering/release-management`: 264 tests, 264 pass. Neither consumer spells a root any more (T1163).

## Not done here

Nothing is installed or activated, and no workflow, `.github` file, variable or setting changes. Pull Promotion's evidence rule and Change Isolation still carry their own lists, as the later slices of `change.md`. The change takes effect for the classifier when its scripts run from the default branch after PROMOTION.
