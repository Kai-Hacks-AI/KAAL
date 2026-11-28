# release/C173: sync review leaves pull_request_target and keeps its automated approval and review through the Approver App

## Reason
From 2 December 2026 GitHub blocks `pull_request_target` by default in public repositories (read from search results; the changelog itself is for the Owner to confirm). `sync-review.yml` (verify Sync, approve Sync, review Sync, release/C58 and C65) is the fifth workflow of the repository that still triggers on it, next to the four replaced checks of release/C153. The Owner's ruling (28 Nov): the workflow moves off `pull_request_target` and keeps its automated approval and review, through the KAAL Approver App, as one of the three Apps that aid Controls (Approver, Inspector, Dispatcher). The release/C152 on main only changed how a SYNC is recognised (from git, not the title); it did not move the trigger.

## The contract
1. **verify Sync runs on plain `pull_request`.** A workflow of its own, with no token (`permissions: {}`), no secret, the default branch checked out as the trusted judge, and the candidate fetched as Git data from `refs/pull/<n>/head` and never checked out, built, installed or run (the mechanism of release/C90). The judgment is the existing `sync-review/cli.mjs verify`; the head read is the revision of the event, a mismatch or an unreadable ref is refused. It uploads its verdict as data: the verdict, the pull request number, the head sha and the base ref.
2. **approve Sync and review Sync run on `workflow_run`.** A second workflow, run from the default branch when the verify workflow completes. It downloads the verdict as data, never runs anything of the candidate, and asks GitHub for the pull request **as it is now**. It acts only when the pull request is open, its head sha equals the verdict's, its base is a `kaal/`, `hotfix/` or `wire/` branch, and its head repository is this repository (a verdict from a fork is never acted on).
3. **The Approver App holds the write.** approve Sync and review Sync take their token from the KAAL Approver App (secret `KAAL_APP_APPROVER_KEY`, variable `KAAL_APP_APPROVER_ID`, release naming of the Apps), not from `GITHUB_TOKEN`. The verify job holds none. Until the credential exists, approve Sync stays a dry run (`KAAL_SYNC_APPROVE` not `on`) and review Sync keeps its label and comment through the App's token or says that it cannot.
4. **The rules do not change.** `approve Sync` approves only a SYNC that verify passed at the current head, never into the default branch, and only when `KAAL_SYNC_APPROVE` is exactly `on`; `review Sync` puts every other outcome in front of a person. No control is weakened: the same two Cases of release/C58 and C65 (T754 to T759, T791 to T793, T851 to T855, T936, with T757 amended by C152) hold as they are.
5. **No `pull_request_target` remains** in the sync workflows, and the old `sync-review.yml` is retired in the same WIRE that installs the new two.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1680: the verify workflow triggers on `pull_request` alone, holds `permissions: {}` and no secret, and no workflow of the sync review names `pull_request_target`.
- T1681: the candidate is fetched as Git data and is never checked out, built, installed or run, and the head read must equal the event's head (a mismatch or an unreadable ref is refused).
- T1682: the `workflow_run` workflow runs from the default branch, runs nothing of the candidate, and acts only when the pull request is open, its head equals the verdict's head, its base is a collector, wire or hotfix branch, and its head repository is this repository (each condition has a negative run).
- T1683: approve Sync and review Sync take their token from the Approver App credential, `GITHUB_TOKEN` carries no write in the `workflow_run` jobs, and without the credential approve stays a dry run.
- T1684: the old `sync-review.yml` source is gone and the new sources keep the job names `verify Sync`, `approve Sync` and `review Sync`.
- T1685: the unit Cases of C58, C65 and C152 (T754 to T759, T791 to T793, T851 to T855, T936, T1556, T1559) stay green with the new entries.
All red until the DO.

## DO
The two workflow sources and the small change of the entry to read the verdict from the downloaded file and to take the token from its environment, with the Cases. The workflow sources reach `.github` through a WIRE (Owner go), and so does the removal of the old workflow.

## After it
ACT, PROMOTION. Then the Owner's gos: the Approver App credential (Kai creates the App, the key and the variable), the WIRE of the new workflows with the removal of `sync-review.yml`, and the variable `KAAL_SYNC_APPROVE` set to `on` only after the Owner has seen the dry runs.

## Left open (with a recommendation)
- Whether `review Sync` also needs the App. Recommendation: yes, for the same reason: it writes a label, a review request and a comment.
- Whether `workflow_run` is allowed by the Owner's policy of the repository. Recommendation: confirm before the WIRE, because it is not a path of `pull_request_target` but is the alternative GitHub's change leaves untouched.

## Not in this Change
No WIRE, App credential, variable, ruleset or policy change. No change to what verify, approve or review judge.

## Design: split and overlap
Split: none. Overlap: release/C152 (applicability from git, same entry) and review's Approver App (delivered by Review; Release asks, Review delivers).
