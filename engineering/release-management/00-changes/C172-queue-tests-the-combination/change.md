# release/C172: the merge queue tests the combination of the promotions it groups, with the whole suite

## Reason
Main went red on 27 Nov because two promotions were each green against their own base and then landed one after the other: controls C164 changed `references/adapter.md`, and Case T1574 (from C159, in the controls package) forbids a hosting term there. Read-only findings (`release/ruleset-changes.md`): the queue did run the required suite on each merge group, but nothing required runs that Case. `packages/kaal-controls` is not a workspace, so the required Workspaces lane never runs its suite, and the Cases are run only by `run Cases` in `controls-act.yml`, which is advisory, on `pull_request` only, against the pull request's own base, and not reported on `merge_group`. So the combination was never tested by anything that could see it.

The Owner decided (27 and 28 Nov): the merge queue tests the combined result with the full suite, takes several promotions into one group, and builds on top of what is ahead. AID adoption and throughput come forward wherever they add automation without losing a control.

## The contract
1. **The whole suite runs on `merge_group`.** Every suite that a promotion's own pull request runs and that is required there also runs on the merge group commit and is required there: Hosting (3 hosts), Workspaces, Acceptance, Engineering, Guard (3 hosts), and, once release/C165 or Guard puts it in a lane, the controls package suite. A suite that exists only for the pull request is not a protection of main.
2. **The carried Cases run on the combined result.** The Cases of the Changes carried by a promotion run on the merge group commit with Testing of the default branch (the same lister and runner as `run Cases`), so a Case of one promotion is run against the others it is grouped with. It is a required check on `merge_group`.
3. **Every required context has a `merge_group` reporter.** A name required by a ruleset that nothing reports on `merge_group` hangs the queue (the lesson of release/C168). This is a ratchet over the ruleset sources and the workflows, not a hope. A reporter is not enough: each required reporter must **judge the combined merge-group revision**, not merely carry the matching context name. Its checkout (or the revision it reads) is the merge group commit (`github.sha` on `merge_group`, the head of the group), never the default branch, a pull request head or a branch name, and the evidence of a run names that revision. A job that reports the name on `merge_group` while judging the default branch or a stale revision does not count as a reporter.
4. **The queue groups promotions.** The default-branch ruleset source carries a merge queue rule that takes more than one promotion into a group and builds each group on top of the entries ahead of it: `max_entries_to_build` and `max_entries_to_merge` above one, `min_entries_to_merge` of two with a short wait, grouping `ALLGREEN`, SQUASH, strict required checks on. Release proposes the numbers (build 5, merge 5, min 2, 5 minutes); the Owner sets them.
5. **Nothing is lost.** No required context is removed from `old promotion` or any ruleset. The guards that main requires today (the four replaced checks, Hosting, Workspaces, Acceptance, Engineering, CodeQL) stay.
6. **Installation is the Owner's.** This Change puts the source on main and the Cases that hold it. Setting the live ruleset (the merge queue parameters, the required contexts of the new default-branch ruleset, retiring `old promotion`) is the Owner's separate go, and `old promotion` is not retired before the new default-branch ruleset carries the queue.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1670: the default-branch ruleset source (`05-src/wiring/rulesets/promoting.json`) requires, besides what it requires today, the suites of contract 1, and its merge queue rule groups (`max_entries_to_build` and `max_entries_to_merge` above one, `min_entries_to_merge` at least two, `ALLGREEN`, strict checks).
- T1671: every context that a ruleset source requires for the default branch has a reporter on `merge_group` among the workflow sources and the installed workflows (a ratchet; a name with no reporter fails and is named).
- T1675: each required `merge_group` reporter judges the combined revision: its workflow checks out or reads `github.sha` of the merge group (never the default branch tip, a pull request head or a branch name) for the tree it judges, and a run's record names that revision. A reporter that reports the name while judging another revision fails the Case (negative runs: a reporter that checks out the default branch, one that checks out `github.event.pull_request.head`, one that reads no revision at all).
- T1672: a workflow runs the carried Cases on `merge_group` with Testing of the default branch, and the check is among the contexts of T1670.
- T1673: the controls package suite runs in a required `merge_group` check (by being a workspace of the Workspaces lane or by a lane of its own).
- T1674: no required context of `old promotion` or of any ruleset source is dropped by this Change (a ratchet against the contexts held today).
All red until the DO. A Case that needs the controls package in a lane waits on release/C165 (controls), which does exactly that by adding `packages/kaal-controls` to the workspaces; T1673 is satisfied by it and is parked until it is on main.

## DO
The workflow source of the merge-group Cases check (a plain `merge_group` workflow), the matching `merge_group` reporters for the suites that lack one, and the ruleset source `promoting.json` updated to the contract, with the Cases. Workflow sources reach `.github` by a WIRE (Owner go). The live ruleset is set by the Owner.

## After it
ACT, PROMOTION, then the Owner's gos: the WIRE of the workflow, setting the default-branch ruleset and its queue, and only then the retirement of `old promotion`.

## Left open (with a recommendation)
- The numbers of the queue. Recommendation: build 5, merge 5, min 2 with a 5-minute wait. A larger group costs more runs when a group is red.
- Whether the Dispatcher (an AID App) raises and enqueues promotions into the groups automatically. It already raises them; enqueueing is an auto-merge on the pull request, which the Dispatcher can do without a new control. Recommendation: after this Change, in its own Change.

## Not in this Change
No ruleset change, WIRE, flag or required context is installed. No control is weakened.

## Design: split and overlap
Split: none. Overlap: controls C165 (the workspaces lane for the controls package) and Guard's C171 (the solution protection fold). This Change names them as the carriers of T1673 and does not change what they judge.
