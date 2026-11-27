# C42 change

Asked by Promoting (the queue evidence) and approved by the Owner (26 Nov): cancel superseded runs, and run a Change once. The Owner's follow-up: is `push` on `main` needed, since a pull request is forced.

## The two edits to `ci.yml`

1. **A `concurrency` group that cancels only pull request runs.** `group: ci-${{ github.event.pull_request.number || github.sha }}` and `cancel-in-progress: ${{ github.event_name == 'pull_request' }}`. A pull request run is replaced by the next push to the same pull request. A `merge_group` run has no pull request number, so its group is its own sha: it is never cancelled and never cancels another. The group does not use `github.workflow`, which is `KAAL` for several files and would make them cancel each other.
2. **No `push` trigger.** The workflow runs on `pull_request` and `merge_group` only.

## Does anything depend on `push` on `main`?

No. Checked:

- **The merge queue tests the commit main receives.** In 6 of 6 samples the `merge_group` `head_sha` equals the sha main points to after the merge, because the queue fast-forwards main to the tested commit. The required checks therefore already ran on main's exact sha, on `merge_group`.
- **Promotion Source** judges the newest completed run per required check on the head's exact sha; it does not filter by event, so a `merge_group` run counts.
- **CodeQL's default-branch baseline** comes from `codeql.yml`, which has its own `push: [main, "kaal/**"]`. It is not touched.
- **`branching-audit.yml`** has its own `push`, `schedule` and `workflow_dispatch`. Not touched.
- **`verify Triggers` (CTL19/20)** judges `pull_request_target` only. **`verify Workflow names` (CTL36)** judges names, and no job name changes.
- **Release C162 (evidence collection)** must read runs by `head_sha`, not by `event=push` or branch main. To be confirmed with Release before the WIRE; this Change does not depend on it for the DO.

## What is lost, said plainly

- A run on a Change branch **without** an open pull request no longer starts. The lifecycle opens a pull request per phase, so no branch is left unchecked for long.
- No run on the collector's tip after a squash merge into it. The next pull request, the SYNC and the PROMOTION each run the checks on their own head, so the tip is tested before it moves on.
- Promotion Source's wait for pending runs is unchanged; fewer runs should shorten it.

## Required check names

Unchanged: no job is added, removed or renamed. Rulesets require `verify Stages (...)`, `analyze Vulnerabilities (Promoting)` and `verify Triggers`; none is a job of `ci.yml`. Release confirms the names before the WIRE.

## Out of scope

Moving the OS matrix (macOS, Windows) to later or to main only is fair, but belongs to the guard and content scope, not this one (Owner, 26 Nov). It goes to the backlog; it is not planned here.

## What this Change pins (Cases, plain `.test.mjs`)

- T1590: the source has no `push` trigger and keeps `pull_request` and `merge_group`.
- T1591: the `concurrency` group is keyed by the pull request number or the sha, and cancels only on `pull_request`.
- T1592: apart from the trigger block and the concurrency block, the source is the live `ci.yml`, so no job, matrix or name changes.

The DO writes `13-source/workflows/ci.yml`. The WIRE copies it to `.github/workflows/ci.yml` byte-equal, on the Owner's go.
