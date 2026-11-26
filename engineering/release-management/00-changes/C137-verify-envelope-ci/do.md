# C137 do

## What the DO added

- `05-src/plan-body/run-verify-envelope.mjs`: the runner. `factsOf`, `templateFiles`, `answerOf` (a template finding keeps the answer from PASS), `exitCodeOf` (1 only when the flag is exactly `on` and the verdict is not PASS), `reportOf`, `recordOf`, `evidenceLine`. Command line: `--event`, `--templates`, `--log`. It imports only the judge files beside it and runs nothing of the pull request.
- `05-src/wiring/workflows/verify-envelope.yml`, source only and not installed: plain `pull_request`, `contents: read`, the default branch checked out as the judge, the base as a worktree for its templates, the pull request's commits only as `git log` of `refs/pull/<n>/head`, the flag `vars.KAAL_RELEASE_VERIFY_ENVELOPE` as `KAAL_FLAG`. When the judge file is absent on the default branch the job says UNKNOWN and fails only if the flag is `on`.
- T1537 and T1538 renamed from `.red.mjs` to `.test.mjs`, green. T1539 is new: the command line over fixture files gives PASS, a provoked FAIL (a PLAN into `main`), UNKNOWN without templates, without a log and without an event, and the exit code follows `on`, `ON`, empty and absent.
- Mutants killed: flag read as truthy (T1537 and T1539), UNKNOWN turned into PASS (T1539), UNKNOWN not exiting 1 on `on` (T1537 and T1539).

## Departures from the PLAN

- CTL11 stays `status: designed`. T881 and the draft that T880 compares require it, and CTL19, which is also built as a workflow source, stays `designed` the same way. The status moves with its own proof, as a separate step; this DO claims no proof for it.

## What this does not show

- Every template of this repository lacks a `KAAL-PR-template` declaration, so the registry derived from them is empty and, once installed, the check would say UNKNOWN on every real pull request (the TYPE is unsupported). That is honest and never a PASS, but an advisory check that is red on every pull request has no evidence value. Declaring the templates is a Change of its own and belongs before the WIRE; it is not done here.
- Only PLAN has a chapter shape and only HOTFIX a body rule, so the other TYPEs read UNKNOWN by the judge's own rows (release/C12).
- The trust boundary the CPO asked for before the WIRE (a candidate cannot bypass the trusted judge by editing the workflow) is argued in the workflow header and by T1538 for the source: the judge is read from the default branch and the candidate is never checked out. The proof against the installed workflow, and the reuse of the release trust-boundary proof, is a step of the WIRE and is not claimed here.
- Nothing is installed, no flag is set, no ruleset or required check is touched.
