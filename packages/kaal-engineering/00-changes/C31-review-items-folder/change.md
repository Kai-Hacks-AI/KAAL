# C31 change

Asked by review (C5). Review items `V<n>.md` live in a folder `review-items` beside their subject, as Cases live in `test-cases`. A review result worth persisting (`RV<n>`) already has a home: `02-learnings/reviews`. The name and placement were put to the review thread.

## The answer

1. **Where.** The same principle as Cases: a Review item sits beside the subject it validates, as a Case sits beside the subject it verifies (the Owner, via the CPO). So `review-items` is a child folder of every folder that holds reviewable subjects: `10-intent`, `11-requirements`, `12-architecture`, `13-source` (Skills, scripts, instruction files), `14-operations` (controls) and `15-defects`. It sits beside `test-cases`, `unit-tests` or `controls`.
2. **Results worth persisting.** Only a review result worth persisting is kept, as `RV<n>`, in `02-learnings/reviews`, which already exists. Not every review is kept: review owns what is worth persisting, and a Review item stays beside its subject whether or not a result is kept. `02-learnings` is a home for results, not a subject folder, so it gets no `review-items`.
3. **Optional, never required.** A package with no Review item is not faulted for it. No folder becomes required, nothing is enforced.
4. **Closed folders.** `13-source` and `14-operations` are closed, so they must name the child or the check would flag it: both list `review-items` as a child. Element folders are not closed and already allow it.
5. **`verifiedBy` stays as it is.** A Review item validates by judgement; it is never the verifier of its folder. Verification and validation stay separate.

## Not in this Change

No package is migrated or gets a `review-items` folder made. Review's own object (what a Review item is, its reader) stays with kaal-review. No ratchet, no enforcement.
