# C31 change

Asked by review (C5). Review items `V<n>.md` live in a folder `review-items` beside their subject, as Cases live in `test-cases`. Results `RV<n>` already have a home: `02-learnings/reviews`. The name and placement were put to the review thread.

## The answer

1. **Where.** `review-items` is a child folder of each element folder that has a subject worth reviewing: `10-intent`, `11-requirements`, `12-architecture` and `15-defects`, listed beside `test-cases`.
2. **Where not.** Not in `13-source` (its closed children are fixed and verified by `unit-tests`), not in `14-operations`, not in `02-learnings` (results go to `reviews`).
3. **Optional.** `review-items` is not required; a package with no Review item is not faulted for it.
4. **No change of the check.** `check-layout.mjs` judges the top level and the children of closed folders; element folders are not closed, so a `review-items` folder inside one is already not out of spec. The template is data: the folder is named there so the layout says what the reader of the template should find, and `package-layout.md` says what it holds.
5. **`verifiedBy` stays `test-cases`.** A Review item validates by judgement; it is not the verifier of its folder.

## Not in this Change

No package is migrated or gets a `review-items` folder made. Review's own object (what a Review item is, its reader) stays with kaal-review. No ratchet, no enforcement.
