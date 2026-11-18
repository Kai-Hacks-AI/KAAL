# C144 baseline

The baseline is the collector `kaal/guard/registration` at 8335545 (guard/C143, PLAN, DO and ACT merged). It is not on `main`, so it is not delivered functionality.

- `lib/discovery.mjs` selects, for each changed file, the nearest `kaal-guard.json` up the tree (by folder depth) and runs its checks narrowed by `when`. A file with no nearest file, or whose nearest file has no check that applies, selects nothing and the run passes (guard/F43, guard/T209 step 4).
- A repository with no `kaal-guard.json` is not discovered at all and behaves as before.
- A `kaal-guard.json` with no check is accepted.
- The C143 ACT lists "the unowned-file policy decided" under Longed For; the C143 requirements leave it open ("Guard reports an ownership defect rather than running everything" was only a suggestion).
