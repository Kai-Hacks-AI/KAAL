# Live run of Show WIP v1 on the real repository (Case coordination/T39)

Invocation: `node engineering/release-management/05-src/show-wip/run.mjs Kai-Hacks-AI/KAAL engineering/release-management/05-src/show-wip/show-wip.json`

Exit code: 0 (stderr empty)

## Where it ran

A temporary, never-merged evidence PR (#1500, closed after the run). The workflow had a read-only token (contents, pull-requests, checks), pinned actions and no secrets. It checked out the final head of the Show WIP PR, `325f04d22f11a8bed5cc293e8b835edbb64b6693` (the job printed `head=325f04d22f11a8bed5cc293e8b835edbb64b6693`), with Node v24.22.2 and gh 2.103.3. The run was https://github.com/Kai-Hacks-AI/KAAL/actions/runs/43377679154 and the artifact is `show-wip-live-run-final-head`. The report is in `live-report.txt` and was copied from that run's log without edits.

An earlier run at bc230ea (before each reviewer's newest verdict was counted) also exited 0: https://github.com/Kai-Hacks-AI/KAAL/actions/runs/43329880214. Its report is superseded by this one.

## What it shows

One line per open pull request (57 of them), grouped under Integration and Promotion. Every line has a disposition, and the reason is a host fact. This time the host gave a merge state for every piece, so nothing is listed as not observed. #1476 now reads as a DO because its title follows the convention.

## Limitations

- Most open pieces predate the title convention, so their TYPE reads `unknown`. The Script does not guess it.
- The report contains #1500 itself, because the trial PR was open while it ran.
- Station placement uses only the target branch (`kaal/*` is Integration, `main` is Promotion). Pieces into other branches would land under `unknown station`, and none did.
- A run is a point in time. It does not show how long a piece has waited, whether a check was expected, or what the next activity is. Those are deferred.
- T39 checks that this record exists and has valid dispositions. It does not rerun the command. The link between this report and the final executable is the checked-out SHA above.
