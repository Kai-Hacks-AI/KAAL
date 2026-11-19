# C101 do

On the merged PLAN (CPO approved, PR #2096), into the collector `kaal/release/delivery-control`.

## What was done

- Added `F78.md`, `A69.md` and `CTL23.md` in their element folders, each equal to its draft in `interface.md`.
- The checker `engineering/change-isolation/check.mjs` looks for the delivery reader in the repository first and then beside itself (`kaal-delivery-locations.mjs`, with `kaal-delivery-locations.json` handed to `readLocations`); `deliveryMixed` reads through it.
- `engineering/github/change-isolation.sh` and `engineering/github/push-check.sh` write the reader and the declaration from the target's tip next to the temporary copy of the checker, and remove a file the target does not hold.
- Renamed T1181 to T1186 from `.red.mjs` to `.test.mjs`.

## Observed

- T1181 to T1186: 6 of 6 pass, run alone. T1184 runs the real wrapper on a scratch repository and no longer says `cannot judge`; T1185 judges the mix as a lone copy beside the two files and still says `cannot judge` without them.
- `node --test engineering/change-isolation/check.test.mjs`: 26 of 26 pass.
- `node --test engineering/cases/cases.test.mjs`: 306 tests, 290 pass, 16 fail. The 16 are the same names that fail on `main`, compared by name.
- The controls checker lists release/CTL23 as `designed valid`.

## Not done, by design

CTL23 claims `designed` and no more. No run is recorded, so no evidence minimum is met. The `real` record is the first Change Isolation run of this repository on a pull request into `main` after this reaches `main`; nothing is installed, wired or required here, and the rule gates nothing.
