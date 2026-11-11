# C10 evidence

The PLAN of C10 observes its RED against `main`. Work that is not on `main` is not delivered functionality, and C10 cites nothing that is not on `main`.

## Observed promotions

The promotion pull requests below were written without a template, each from the pattern of the one before it. What they show is the evidence for F15.

| Observation | Seen on | What F15 answers |
| --- | --- | --- |
| The body used the chapters Intent, Design, Verified by and Validated by, and a generated footer with a session link. The CPO later asked for the PLAN chapters instead. | #1403, #1427, #1428 | A promotion has chapters of its own, Collector, Delivers and Order. Neither set is the PLAN's, so the PLAN headings are not a default. |
| The body was rewritten to the PLAN chapters Change, From, To and Because. Its Change line names the promoted Change, From and To restate what the PLAN already says, and Because repeats the value of the PLAN. | #1410, #1425, #1416, #1417 | Delivers names the Changes and describes none of them. The PLAN holds the reasoning. |
| The body listed checks, exact-head approvals and the Owner's go ("Verified by", "Validated by"). Each statement is tied to a head that moves and is already kept by the checks and the review history. | #1403, #1427, #1428 | The body states no result, approval or authorization. The Owner's go on the promotion is its own review record, and a prior approval of a Change is history. |
| The collector was split into a promotion of engineering and one of `.github` that travel as a pair, and the pair was stated in a comment and in the body of one of the two. | #1427, #1428 and #1416, #1417 | Order names a companion promotion in one place, the body. |
| The collector was not fresh, so a synchronization (#1429) had to land before the promotion could. This was written in a comment after the CPO review. | #1427 | Order names the synchronization the promotion waits for, and an older promotion ahead of it in the queue. |
| The comment on both promotions said "Merge commit". Branching lands a promotion into `main` by squash, and auto-merge into `main` reads back as a merge commit whatever is requested. | #1427, #1428 | The body states no merge method. Branching owns it, and a second statement in a body can disagree with it. |
| The comment that carried attribution also carried the Owner's go and a statement of the merge method. | #1427, #1428 | Attribution stays out of the body, as it is for the PLAN. |

## Provenance

- Baseline: `main` at `d19abeff8225c578416138e9def950d952ba898b`. `main` holds the PLAN template and no promotion template.
- Method: the nine Cases of this PLAN (T130 to T138) are copied over a tree of `main` that holds none of this PLAN's documents, and each Case's `run()` is called. A second execution in the tree of this PLAN shows which Cases stay red with the documents of this PLAN present.
- A throwaway reference template, outside the repository, was used once to show that the Cases can pass: all nine were green with it. It carries the three chapters of F15 with a hint each and implies no wording of the delivered template.

## Result

| Case | Tests | On `main` (assertion that failed) | In the tree of this PLAN |
| --- | --- | --- | --- |
| release/T130 | I9 | I9 is absent | green |
| release/T131 | F15 | the promotion template is absent | the promotion template is absent |
| release/T132 | A35 | A35 is absent | green |
| release/T133 | A38 | A38 is absent | the promotion template is absent |
| release/T134 | G38 | I9 is absent | green |
| release/T135 | G39 | F15 is absent | the promotion template is absent |
| release/T136 | G40 | A35 is absent | the promotion template is absent |
| release/T137 | F15 | the promotion template is absent, after the judgement of the observed bodies held | the promotion template is absent |
| release/T138 | F15 | the promotion template is absent | the promotion template is absent |

On `main`: 9 RED-observed, 0 error, 0 green. In the tree of this PLAN: 6 RED-observed and 3 green, about documents this PLAN adds. The red Cases wait for the promotion template, a `.github` change that the DO delivers.

## Reproduce

Run from a checkout of this branch, with Node 22 and no dependencies. For each `T130` to `T138` `.red.mjs` file import it, call `run()` and report RED-observed when it throws an assertion error.
