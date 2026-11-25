# C130 change

## PLAN

The judge reports findings, the generic judge decides, the control record declares the ratchet. Nothing here installs a workflow, changes a ruleset, sets a flag or removes a use of the trigger.

### Decisions (the approval of this pull request is the go for the DO)

1. **`verify Triggers` reports findings and decides nothing.** The judge keeps its reader and its parser (`uses`), and its report becomes the sorted list of the workflow paths that use `pull_request_target` in the head (`.github/workflows/<file>`). Its own PASS, FAIL and UNKNOWN rule is retired in favor of the shared one, so the ratchet rule is written once. The existing exit codes (0, 1, 2) and the report line stay what a workflow step reads.
2. **The verdict is `judge-mode --mode ratchet`.** `findings` is the head list. `previous` is the accepted baseline: the list of the **base** commit, read by the same reader as Git data, never a file of the pull request and never the candidate's own. `baseline` is `previous ∩ findings` (the baseline the pull request may carry, so removing a use is an improvement and no stale allowance is left). PASS only when no head finding is outside the base's. A new use, a use moved to another file, a swap, and a use put back after it was removed are findings outside the allowance and FAIL. A side that cannot be read is UNKNOWN. This is exactly today's rule, expressed through the generic mechanics, so no verdict changes on a pull request that the old judge decided.
3. **The accepted baseline is Git itself, and it persists only when the check is required.** The accepted baseline of the next run is the list of the base of that run. It equals the last accepted baseline only if every merge into that base passed the check. While the check is a report (detective), a rejected pull request could still merge and the baseline would advance past a FAIL. So the persistence evidence of this Change is two things. (a) A Case set that pins the lifecycle on fixtures (accepted run, rejected run that carries no `next`, improvement, rollback, growth, and a base that gained a use by a merge that skipped the check, which the judge cannot see and the PLAN names as the limit). (b) A recorded observation on real pull requests: for each of the next ten pull requests that touch `.github/workflows`, the run's `previous`, findings and verdict, kept in `evidence.md`. A merge that moved the baseline up without a PASS is a Defect that restarts the count. Neither is an activation.
4. **Registration: the preventive control declares the ratchet.** The control that blocks is release/CTL20. Its record keeps `type: preventive` and `has: [release/I50]` and declares `strategy: ratchet`, `baseline-source` (the findings of the base commit of the pull request), `owner` (release management) and `exit` (the accepted baseline is empty: the filter is removed and `verify Triggers` is judged plain preventive). release/CTL19 stays the check that reveals; it is not re-typed. Neither record declares a deadline: reaching zero by a date is a planning decision outside the control and outside the mechanism. No `:ratchet` station.
5. **The exit is not this Change.** Removing the five uses of `pull_request_target` is separate work (its own Changes and WIREs, each on Kai's go; the design of D13 to D17 and C118 is theirs). When the count is 0, T1123 (the target Case, held RED until then) becomes a plain `.test.mjs`, and the ratchet is cleaned up to plain preventive as the exit says.
6. **Dependencies and order.** The DO needs controls C23's DO for the field names (named prerequisite) and uses `judge-mode` as it is on `main`. Until C23's DO is on `main` the DO lands the judge change, the Cases and `evidence.md` and leaves the record's four fields to a follow-up, saying so in `do.md`. The workflow `verify-triggers.yml` reaches the new judge only by a WIRE on Kai's go; until then the installed workflow runs the old one, which is unchanged in what it decides.
7. **The existing Cases stay, with one change on purpose.** T1116 to T1126 keep passing except the Cases that assert the old report line or the old judge shape; they are updated in the DO and listed in `do.md` (the Change folder records the change). Their targets do not change.

### Cases (plain `.test.mjs`; they land with the DO, ids taken then after the highest on main)

- the report is the sorted list of using workflows; a comment, a branch name and a string are not findings; the four forms of `on:` are found.
- through `judge-mode`: adding a use, giving an existing workflow a use, and swapping a use to a new workflow FAIL; removing or replacing a use PASSES and `next` drops it; an unchanged tree PASSES; an unreadable base or head is UNKNOWN with no `next`; a use put back after removal fails; the verdict of every old fixture of T1120 to T1122 is unchanged.
- the persistence lifecycle on fixtures, as decision 3(a), including that a rejected run carries no `next`.
- the control records: CTL20 declares the four fields and no deadline and no `:ratchet` station; CTL19 is not re-typed.
- a Case that the baseline is read from the base and never from the head (a head that edits its own allowance does not widen it).

### Questions for the CPO

1. **Where the ratchet is declared.** Recommended: on CTL20, the preventive control that blocks, with CTL19 staying the detective check that reveals. The alternative is to merge CTL19 and CTL20 into one preventive control; that removes the distinction between the report and the requirement that the CPO has kept for other controls.
2. **Is the ruleset that requires `verify Triggers` loaded today?** If it is not, persistence is not enforced and decision 3(b) counts it as evidence only; the Owner's go on loading it is separate and not asked here.

### Not in this Change

No workflow change, no WIRE, no ruleset change, no removal of any of the five uses, no deadline, no change to the generic mechanics (controls').
