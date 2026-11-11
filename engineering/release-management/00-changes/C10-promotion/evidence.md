# C10 evidence

The PLAN of C10 observes its RED against `main`. Work that is not on `main` is not delivered functionality, and C10 cites nothing that is not on `main`.

## Observed promotions

The promotion pull requests below were written without a template, each from the pattern of the one before it. What they show is the evidence for F15.

| Observation | Seen on | What F15 answers |
| --- | --- | --- |
| The body used the chapters Intent, Design, Verified by and Validated by, and a generated footer with a session link. The CPO later asked for the PLAN chapters instead. | #1403, #1427, #1428 | A promotion has chapters of its own. Neither set is a default. |
| The body took the PLAN chapters Change, From, To and Because. From and To restate the PLAN, and Because repeats its value in other words (the Because of #1425 and the Intent I7 it implements say the same). | #1410, #1425, #1416, #1417 | The body names the Changes and describes none of them. |
| The one forward-looking sentence in these bodies was in a Because: the promotion that follows lands on a Change that is already stated and tested. That is a reason to deliver now, and it was the only part the PLAN did not already hold. | #1416 | Why now carries the forward-looking reason. |
| The body listed checks, exact-head approvals and the Owner's go ("Verified by", "Validated by"). Each statement is tied to a head that moves and is already kept by the checks and the review history. | #1403, #1427, #1428 | The body states no result, approval or authorization. The Owner's go on the promotion is its own review record, and a prior approval of a Change is history. |
| A collector carried several phases of one Change: the PLAN and the DO of release/C7 without its ACT, the DO and the ACT of release/C3, the PLAN, DO and ACT of release/C8 in one. A pull request number says none of that. | #1427, #1403, #1425 | Change names the stable id of the Change and the phases carried. |
| The collector was split into a promotion of engineering and one of `.github` that must travel as a pair, and the pair was stated only in a comment. The second half has no value on `main` without the first. | #1427, #1428 and #1416, #1417 | Why now names the other half and the reason: it completes the Change. |
| The collector was not fresh, so a synchronization (#1429) had to land first. Branching reports it, and the promotion queue is a check. | #1427 | Not in the body. A check result is reported by its check. |
| The comment on both promotions said "Merge commit". Branching lands a promotion into `main` by squash, and auto-merge into `main` reads back as a merge commit whatever is requested. | #1427, #1428 | The body states no merge method. Branching owns it, and a second statement in a body can disagree with it. |
| The title of every promotion already names the collector and `main`: "Promote kaal/... into main". | all seven | The body repeats no source or destination. |
| The comment that carried attribution also carried the Owner's go and a statement of the merge method. | #1427, #1428 | Attribution stays out of the body, as it is for the PLAN. |

## The CPO's candidate

The CPO proposed three chapters for challenge: Change, Value and Priority. Tested against the observations:

- Change stands. It is the stable identity, and the phases carried belong to it.
- Source and destination, which an earlier version of this PLAN kept in a Collector chapter, fall away: the pull request shows them and the CPO asked to keep them out.
- Value and Priority did not stay apart. The value of the Change was decided in its PLAN, and the observed Because chapters repeat it. What a promotion adds is the reason for delivering now, and that reason is the value of this delivery to `main`: what it unblocks or enables. A separate Value chapter would either restate the PLAN or say the same thing as Priority. So F15 has two chapters, Change and Why now, with the value as the first thing Why now says.
- The rule that every named Change carries a reason is kept as written, in the hint of Why now.
- What would bring a separate Value chapter back: a promotion whose value on `main` differs from the value of the Change it carries. No observed promotion shows one.

## Provenance

- Baseline: `main` at `d19abeff8225c578416138e9def950d952ba898b`. `main` holds the PLAN template and no promotion template.
- Method: the nine Cases of this PLAN (T130 to T138) are copied over a tree of `main` that holds none of this PLAN's documents, and each Case's `run()` is called. A second execution in the tree of this PLAN shows which Cases stay red with the documents of this PLAN present.
- A throwaway reference template, outside the repository, was used once to show that the Cases can pass: all nine were green with it. It carries the two chapters of F15 with a hint each and implies no wording of the delivered template.

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
