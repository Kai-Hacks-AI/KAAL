# C169 ACT: retrospective (4L)

Written by the agent that carried the Change.

## Liked

- The two gaps were found before any consumer relied on `postCheckRun`, by a review that read the implementation against the C117 PLAN's own sentences ("the fact states what GitHub made", "any other key is `INVALID_CHECK`"). Each became one Case that fails on `main` and passes on the fix, so the Cases are the evidence and nothing was fixed by assertion.
- The CPO's second hold (symbol keys) was a sentence the PLAN promised and no Case tested. Adding the Case to the PLAN, not to the DO, kept the order: the PLAN says it, the DO delivers it unchanged.
- The fix is small and local: one comparison of the external id and one key check over every own key. No other behaviour changed, and T345 to T348 stayed green without edits.

## Learned

- A fact that echoes the request is not a confirmed fact. When a function verifies GitHub's answer against the request, every field it reports must be on the verified side of that line; the stand-in's `made` helper hid the gap because it echoed the external id back.
- A closed list of keys is closed only if it checks the keys, not the values: `Object.keys(...).filter(value !== undefined)` is a list of values in disguise. Own keys include symbols, so check them with `Reflect.ownKeys`.
- A promotion can land while a hold is being set: the queue entry was already running when auto-merge was disabled. A hold on a PR that is already in the queue needs the queue entry removed, not only auto-merge turned off. The fix then goes forward on `main` as a new Change, with its own collector.
- Reading `git fetch origin A B` as two fetches is wrong when one ref is missing: the whole fetch fails and neither ref moves. Fetch the collector on its own before building on it, and check its tip against the merged PLAN's commit.
- A closed PLAN amendment on a promoted collector is not the way to amend a promoted Change; a new Change (C169) with its own PLAN, DO and ACT is.

## Lacked

- Evidence against GitHub itself: both Cases run against the stand-in. What GitHub returns in `external_id` for a run created without one (assumed empty) is read from its documentation, not observed.
- A rule in the C117 PLAN for what "none" means for a returned external id; C169 now states it, but the PLAN left it to the reader.

## Longed For

- A first real post of a check run under the Inspector's installation, so that the shape of GitHub's answer is observed once and the stand-in can be checked against it.
- A Controls Case that signs through `postCheckRun` and reads the external id back, which would show the correlation end to end.

## Follow-ups

- Controls adopts `postCheckRun` in the Inspector's signing script (its own Change); it may rely on the external id being what GitHub confirmed.
- No WIRE, workflow activation, ruleset, retry policy, enforcement or publication is authorized by this Change.
