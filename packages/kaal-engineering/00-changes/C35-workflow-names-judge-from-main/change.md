# C35 change

Asked by release (24 Nov), after Promoting found `verify Triggers` and `verify Workflow names` both UNKNOWN on SYNC #2414 into a stale collector. Release's own source is C132 (#2415); this is the engineering half for the source engineering owns. The stale-base baseline is handled the way C132 decides it, so the two checks answer alike.

## The answer in five lines

1. **Judge from the default branch.** The one `actions/checkout` uses `ref: ${{ github.event.repository.default_branch }}` with `persist-credentials: false`, so the judge (`engineering/release-management/05-src/workflow-names/`) and `judge-mode` are the reviewed ones on `main`, whatever the pull request or its base holds. For a pull request into `main` nothing changes (the base is the default branch).
2. **Base and head are Git data.** The step fetches the base commit (`BASE_SHA`) and the head as refs into the same repository, and lays the head out as a worktree, as today. Nothing from either is run.
3. **The accepted baseline stays the base's.** `--previous` is the baseline file of the base commit, read with `git show "$BASE_SHA:<path>"` into a file under `$RUNNER_TEMP`.
4. **A base that predates the control.** Where the base commit holds no baseline file, `--previous` is the default branch's file and the step prints that it used it. This is C132's recommended answer to its question 1; if the CPO decides the other way there (UNKNOWN until the collector is synced), the DO follows that decision, and F96 changes in its last sentence. A head cannot widen the allowance: its file may not list a name the default branch's file lacks, which the ratchet already fails as growth.
5. **No new trust, no weakening.** A judge absent on the default branch is still UNKNOWN (`test -f "$J" || exit 2`). The DO also amends F95's T1416, which pins the base checkout and is superseded by T1423.

## What this Change pins (Cases, plain `.test.mjs`)

- T1423: one `actions/checkout`, `ref: ${{ github.event.repository.default_branch }}`, `persist-credentials: false`; no checkout of the base or head.
- T1424: the base commit and the head are fetched as Git data and the head is laid out with `git worktree add`; no command runs a script from the head folder.
- T1425: `--previous` is a file the step wrote from `git show "$BASE_SHA:..."`, with the default branch's baseline as the fallback when the base holds none, and the step says so.

All three are RED against the source on `main` (it checks out the base and reads `--previous` from that checkout). They go GREEN with the DO.

## Questions for the CPO

None of its own. Question 1 of release C132 decides decision 4; this Change follows its recommended answer.

## Not in this Change

No WIRE (release installs the source on Kai's go), no ruleset change, no flag, no change to the judge, the baseline or what counts as a finding. The residual of C33 holds: a pull request can edit the workflow file itself; the Inspector closes that.
