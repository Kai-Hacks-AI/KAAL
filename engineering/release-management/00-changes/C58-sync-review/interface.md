# C58 interface

Drafts as they are added in the DO. T750 to T753 read them. None of them is on the collector until the DO.

## Draft of I32.md

````
---
id: release/I32
title: a pure SYNC needs no review and every other SYNC gets one
---
# release/I32 a pure SYNC needs no review and every other SYNC gets one

Contract: a SYNC whose result is wholly determined by its two parents, the integration branch's tip and a state already on `main`, holds nothing a reviewer can judge, so it receives its approval from a verdict at its exact head. Any other SYNC, and any SYNC whose verdict cannot be read, is put in front of a person and does not sit unnoticed.

The approval is automatic only for a base of `kaal/*`, `hotfix/*` or `wire/*`, never for `main`. Owner: release management.
````

## Draft of CTL7.md

````
---
id: release/CTL7
title: verify Sync
description: It reveals whether a SYNC is a pure merge of main, at its exact head.
type: detective
has: [release/I32]
---
# release/CTL7 verify Sync

A detective control. `verify Sync` reads a pull request titled `SYNC:` into `kaal/*`, `hotfix/*` or `wire/*` at its head and says whether it is a pure merge: a merge commit whose parents are the base's tip and a state already on `main` that is newer than the one the base incorporated, whose tree is exactly git's clean merge of those two parents, with no commit beyond the merge and a Reason stated. It says what it analyzed. A fact it cannot read is UNKNOWN, which never passes. It blocks nothing: a ruleset that required it would be another control with its own Owner decision.

It has one Intent, release/I32.
````

## Draft of CTL8.md

````
---
id: release/CTL8
title: approve Sync
description: It gives a SYNC the approval it needs only when verify Sync passes at its exact head.
type: preventive
has: [release/I32]
---
# release/CTL8 approve Sync

A preventive control. A SYNC lands only with an approval at its head. `approve Sync` is the one approval that is not a person's: it approves a SYNC when `verify Sync` passes at the current head of that pull request, read again just before it acts, and for nothing else. It never approves a pull request into `main`, never merges and never edits a branch. It runs as a dry run, saying what it would approve, until the Owner turns it on. Its approval counts only where the base's rules do not require a Code Owner review.

It has one Intent, release/I32. It uses release/CTL7 and is a second control, not a part of it.
````

## Draft of CTL9.md

````
---
id: release/CTL9
title: review Sync
description: It puts a SYNC that is not a pure merge, or cannot be judged, in front of a person.
type: corrective
has: [release/I32]
---
# release/CTL9 review Sync

A corrective control. When `verify Sync` fails or cannot judge, `review Sync` labels the pull request `sync: needs review`, requests a review and says in one comment, once per head, which conditions failed. It never approves, merges or edits the branch: repairing a SYNC would be another control.

It has one Intent, release/I32. It acts on the outcome of release/CTL7 and is a second control, not a part of it.
````

## The facts and the record of verify Sync

`verifySync(facts)` is a pure function over facts a caller reads from GitHub and git, and it reads nothing itself.

```
facts: {
  base:  { ref, tip },                    the base branch and its tip when judged
  head:  { sha, parents: [sha, ...], tree },
  currentHead,                            the head of the pull request when the facts were read
  merge: { clean, tree },                 git's merge of parents[0] and parents[1]: clean, and its tree when clean
  secondParentOnMain,                     the second parent is on main's first-parent history
  advances,                               it is strictly newer than the state the base incorporated
  added: [sha, ...],                      the commits the pull request adds to the base that are not on main
  reason,                                 the text of the Reason chapter, or null
}
record: { control: 'verify Sync', outcome: 'PASS' | 'FAIL' | 'UNKNOWN', passes, reasons: [{ code, detail }], analyzed: { base, head, parents, mergeTree, added } }
```

- PASS: every condition holds. `reasons` is empty.
- FAIL: at least one condition is false. `reasons` names every false condition by its code: `not-integration-base` (the base is not `kaal/*`, `hotfix/*` or `wire/*`), `not-a-merge-commit` (the head has not exactly two parents), `first-parent-not-base-tip`, `second-parent-not-on-main`, `does-not-advance`, `merge-conflicts`, `tree-differs-from-clean-merge`, `extra-commits` (`added` is not exactly the head), `no-reason` (the Reason is missing or empty), `head-moved` (`currentHead` is not `head.sha`).
- UNKNOWN: no condition is false and a fact is missing or unreadable. UNKNOWN never passes.

A conflict resolution, a changed file and an extra commit each change the tree or the commits, so each one fails a condition. Nothing about a SYNC is judged by reading its content.

## The decisions of approve Sync and review Sync

`decideApprove({ verdict, currentHead, mode, approvedAtHead })` returns `{ action: 'approve' | 'would-approve' | 'skip', because }`. It approves only when the verdict passes, the verdict's head is `currentHead`, the verdict's base is not `main`, and no approval of the current head exists. `mode` is `on` only when it is exactly the string `on`; anything else, or nothing, is a dry run and the action is `would-approve`.

`decideReview({ verdict, currentHead, existing })` returns a list of actions, each one of `label`, `unlabel`, `comment` or `request-review`, and never another. A verdict that fails, is UNKNOWN or is missing gives `label`, `comment` (carrying the marker `<!-- review-sync:<head> -->` and one line per reason) and `request-review`, each left out when `existing` shows it done for the current head. A passing verdict gives nothing, or `unlabel` when the label is on.

## The workflow

`05-src/wiring/workflows/sync-review.yml`: triggers `pull_request_target` only, with the types `opened`, `synchronize`, `reopened` and `edited`; top-level `permissions: {}`; three jobs named `verify Sync`, `approve Sync` and `review Sync`, each running only for a pull request whose title starts `SYNC:` and whose base is `kaal/*`, `hotfix/*` or `wire/*`. `verify Sync` has `contents: read`; `approve Sync` and `review Sync` need it and have `pull-requests: write`. Every job checks out the default branch, fetches the candidate's commits as Git data only, and runs nothing of the candidate. `approve Sync` reads the repository variable `KAAL_SYNC_APPROVE` as its mode. No job merges, pushes, edits a body or a branch, or swallows a failure.

## Where it lives

`04-controls/CTL7-verify-sync/CTL7.md`, `CTL8-approve-sync/CTL8.md` and `CTL9-review-sync/CTL9.md`, each with its control test beside it; `01-intent/I32-pure-sync-needs-no-review/I32.md` with T753; `05-src/sync-review/` for `verify.mjs`, `approve.mjs`, `review.mjs` and the adapter; and the workflow under `05-src/wiring/workflows/`.
