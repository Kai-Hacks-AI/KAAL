# release/C164: the merge-group review waits for its group's checks without polling them

## Reason
A merge group dropped out of the queue when the job `Change Isolation (review)` (`merge-group-review.yml`) was refused by GitHub's API rate limit (HTTP 403). The job is the last required check of a group to answer, so it waits for the others: it lists the group's check runs every 20 seconds, up to 120 times, and any read that fails ends the job with exit 2. That is fail-closed by intent, but it cannot tell a refused read from an unreadable one, and its reads are many (one list per tick, plus pages) against an hourly budget the queue shares with every other job and agent of the repository. The Owner's direction (27 Nov): events put less pressure on the limits than polling, so plan the event-driven design first and work it into a collector; if the limit is hit again, this Change is promoted faster, not a HOTFIX.

## The contract
1. **One judgment of the group's checks, used by every path.** A pure function over the required contexts and the check runs of the group's head: `waiting` (a required context has no run or one not completed), `red` (a required context completed with anything but success, neutral or skipped; the group cannot merge) or `green` (every required context succeeded). The old loop's tests become its Cases. It is extracted from the workflow into `05-src/merge-group/`, and the loop and any event path call it.
2. **Fail closed, still.** Unreadable rules, unreadable runs after the bounded tries, or a group that never finishes is a failed review, never a pass. A `red` group fails the review at once.
3. **A refused read is not an unreadable one.** A rate-limit or server refusal (403 with a rate-limit header, 429, 5xx) is retried with a growing wait, from 20 seconds up to 120, honouring the reset time GitHub names. Only a read that keeps failing after the bounded tries ends the job with exit 2. The ordinary poll also grows its interval after the first minute, so a long wait costs a fifth of today's reads.
4. **Events, not polls.** The reaction to a completed check of the group replaces the poll. What an event does is only to ask the one judgment of contract 1 again; the answer of the review is never taken from the event's payload.

## Design questions (stated here, to be answered before the event path is built)
1. **Which event reaches us?** Candidates: `workflow_run: completed` (runs from the default branch; its payload names the head sha and the triggering event, `merge_group`), `check_suite: completed` and `check_run: completed`. Events caused by `GITHUB_TOKEN` start workflows only in narrow cases, and the other required checks of a group are run by Actions, so whether each candidate fires for the group's branch is shown by a throwaway merge group, not assumed. Recommendation: `workflow_run` for the workflows that carry the other required contexts, filtered to `merge_group`.
2. **How is the required context satisfied?** A `workflow_run` job reports on the default branch's commit, not on the group's head, so the event path has to write a check run named `Change Isolation (review)` on the group head. Today the job avoids any write by design ("nothing here writes a check run, so there is no write whose failure could leave a success standing"). Options: `checks: write` for the workflow token (a write, bound to the group head, made as the very last act after the second read of the approvals, so no later step can leave a stale success); or the Inspector App, whose job is to sign checks (the review capability; not on the line before 2 December). Recommendation: the Inspector when it exists; until then the poll with contract 3 stays the review, and this Change builds the extraction, the retry and the one judgment, which the event path reuses.
3. **What if the event never comes?** The context stays pending and the queue times the group out, which fails closed. Whether the poll stays as a watchdog (the existing job, with the longer interval) or the group simply times out is the Owner's setting of the queue. Recommendation: keep the poll with the longer interval as the watchdog, until the event path has run on real groups.
4. **Loops.** A write of the context must not start its own reaction. The reaction filters by the workflow it reacts to, never by name alone.
5. **Permissions.** `checks: read` stays for the poll; the event path adds `checks: write` for its job only, or none with the Inspector.

## Acceptance expectations
- The one judgment: waiting for a missing or unfinished required context, red for a failed one even while others are pending, green only when every required context succeeded; neutral and skipped count as success; the context under judgment is left out.
- A read refused for rate limit twice and then readable gives `green`/`waiting` as the checks stand, not a failure; reads that keep failing give exit 2; a red required check gives exit 1 at once; a group that never finishes gives exit 2.
- The poll's interval grows after the first minute, so a group whose checks stay pending for ten minutes costs at most 20 reads.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1600: `05-src/merge-group/group-state.mjs` exports the pure judgment and gives waiting, red and green for the fact sets above.
- T1601: `05-src/merge-group/wait-for-checks.mjs` run with a stub `gh` (`KAAL_GH`): a refused read twice then success passes through; a read that keeps failing exits 2; a red required check exits 1 at once; never exit 0 for a group that is not green.
- T1602: the same script's reads over ten simulated minutes of pending checks are at most 20.
All red until the DO.

## DO
Extract the loop of `merge-group-review.yml` into `05-src/merge-group/`, add the retry and the growing interval, and keep the workflow source in the wiring folder. The installed workflow is changed by a WIRE only, on the Owner's go. The event path itself waits for the answers to the design questions: its trigger and its write are a further Change if they need one.

## Not in this Change
No WIRE, ruleset change, queue setting, required check or flag. The installed `merge-group-review.yml` stays as it is until its own WIRE.
