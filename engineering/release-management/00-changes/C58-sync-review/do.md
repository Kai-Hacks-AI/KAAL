# C58 do

## What the DO added

- `01-intent/I32-pure-sync-needs-no-review/I32.md` and `04-controls/CTL7-verify-sync/CTL7.md`, `CTL8-approve-sync/CTL8.md`, `CTL9-review-sync/CTL9.md`, equal to the drafts in `interface.md`. CTL7 is detective, CTL8 preventive and CTL9 corrective, and each has release/I32.
- `05-src/sync-review/verify.mjs`, `approve.mjs` and `review.mjs`: the three pure decisions of `interface.md`. `facts.mjs` reads a SYNC's facts from Git through an injected `git` (the clean merge by `git merge-tree --write-tree`, main's first-parent history, what the base already holds, the commits the pull request adds, the Reason chapter) and leaves out any fact it cannot read, which `verify Sync` reports as UNKNOWN. `cli.mjs` is the adapter the workflow runs: it reads the pull request, calls the decision and acts through `gh api`.
- `05-src/wiring/workflows/sync-review.yml`: three jobs, `verify Sync`, `approve Sync` and `review Sync`, run by `pull_request_target` from the default branch for a pull request titled `SYNC:` into `kaal/*`, `hotfix/*` or `wire/*`. `verify Sync` ends red when the verdict is FAIL or UNKNOWN. `approve Sync` approves only when the repository variable `KAAL_SYNC_APPROVE` is exactly `on`.
- T750 to T757 renamed from `.red.mjs` to `.test.mjs`. All eight are green, the finder lists release/CTL7, CTL8 and CTL9 and refuses nothing, and release/T540 and release/T600 stay green.
- release/T758 and release/T759, Cases the DO adds from the Cases allocated in the PLAN (T750 to T759): `facts.mjs` and `verify.mjs` over a real Git repository. It passes a pure merge, and fails an altered merge, an extra commit, a resolved conflict and a merge of a state the base already holds, and gives UNKNOWN for a head that cannot be read.

## Revised after the CPO review at 4855336

- **A person is always reachable or the run is red.** `review Sync` picks the first eligible reviewer: an owner of the CODEOWNERS catch-all line, then the repository variable `KAAL_SYNC_REVIEWER`, who is not the author of the pull request. Teams are not eligible. With none, it still labels and comments (the comment says no reviewer could be requested), then ends the job red with an annotation that says to add a Code Owner other than the author or set `KAAL_SYNC_REVIEWER`. A refused review request fails the job. T759 covers the author as the only Code Owner (in another case too), a team alone, no CODEOWNERS file, the fallback, and a refused request.
- **The approval rests on facts read again.** `approve Sync` fetches the candidate as Git data again and recomputes verify Sync just before it acts. `decideApproveNow` approves only when the earlier verdict and the fresh one both pass and agree on the head, the base's tip, the parents and the merge tree, and the head is read once more immediately before the approval is submitted, which is attached to that commit. `review Sync` reads the facts again too, so a SYNC whose base or main moved while its head stayed is put in front of a person. T759 holds a regression for a head that did not move while the base moved, and one for main rewound so the second parent is no longer on its history, and pure cases for each field of the comparison.
- The approval stays a dry run unless `KAAL_SYNC_APPROVE` is exactly `on`. Nothing here authorizes the WIRE, the variable, or a repository setting.

## Checked beside the Cases

`cli.mjs` was run against a stand-in `gh` and a small repository: `verify` passed a pure SYNC, `approve` said `would-approve` without the variable and called the review API with `on`, and `review` labelled, commented once and requested the Code Owner from `.github/CODEOWNERS`. That is not a run against GitHub.

## Not done, as planned

No `.github` file, ruleset or setting changed. The workflow is a source. The WIRE that installs it, the repository setting that lets Actions approve a pull request, the question whether the collector rulesets require a Code Owner review, and `KAAL_SYNC_APPROVE=on` are the Owner's, in that order. Until the variable is set, `approve Sync` says what it would approve and approves nothing.

## Simplifications to read

`advances` is read as "the second parent is not already an ancestor of the base's tip". The `synchronization` verdict of `lineage.ts` also reads `Synchronized-with` markers, and this control does not: a SYNC that only that verdict accepts is not pure and goes to a person.
