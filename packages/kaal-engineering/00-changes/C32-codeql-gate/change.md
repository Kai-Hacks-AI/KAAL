# C32 change

Asked by controls at the coordinator's request, on the Owner's word: a migration into the new structure and the retirement of the legacy setup. The cause is in release's log of #2313; the check shape is controls'. This is engineering's answer, to be judged before anything is built.

## The answer in seven lines

1. **Declared.** The expected configurations are written once, in the workflow source, as `CODEQL_EXPECTED` (today `/language:actions` and `/language:javascript-typescript`). The matrix of `analyze` must equal it; a Case pins that, so a language added to one and not the other is out of spec before it ships.
2. **One check, in or out.** Job `verify CodeQL` has `needs: analyze` and runs even when `analyze` failed. It reads the code-scanning analyses of the merge-result sha and the open alerts of the merge ref. **Missing** = an expected configuration with no analysis, or an analysis that reports an error. **Extra** = an open alert at or above the threshold. In spec only when both are empty.
3. **Fails closed.** An API error, an analysis still being processed at the end of a bounded wait, or a timeout is UNKNOWN. UNKNOWN fails the job. Never a pass, never neutral. The judge only produces findings, a JSON list of names (`missing:/language:actions`, `alert:<id>`); the verdict comes from kaal-controls' `judge-mode` in preventive mode, which already gives PASS or FAIL and UNKNOWN for a missing findings file, so that contract is not written twice. The judge-mode script is not on `main` yet and its input handling is being fixed in controls' C22 (#2323); the release Change names the script once that lands.
4. **The threshold is data.** It is declared next to the expected configurations. The legacy rule carries today's value; the PLAN cannot read the ruleset, so Question 2 asks for it.
5. **Staged, detective first.** (a) This Change lands the source. (b) A release WIRE installs it, with no ruleset change: the job runs on every pull request and is seen to run, and one provoked failure is shown. (c) Only then, on the Owner's go, the ruleset names `verify CodeQL` as a required check (preventive, a hard rule) and the legacy rule "Code scanning results / CodeQL" is removed. Steps (b) and (c) are not part of this Change.
6. **Source first.** The workflow source goes to `13-source/workflows/codeql.yml` in engineering, an unchanged copy plus the new job. The WIRE judge installs only a target equal to a source on main.
7. **The judge is release's.** The logic that reads the analyses and says in or out is a control script, not workflow text. Engineering's package ships one script (N19), and the Owner decided on 12 Nov that CodeQL evidence stays in release for now (release analysis D4). So release plans the control and its script as its own Change; this Change plans the workflow around it, and calls it by one declared command. Question 1 asks to confirm.

## Which sha and ref (per trigger)

The job reads the analyses and the open alerts for the sha and ref it runs on (`GITHUB_SHA`, `GITHUB_REF`), and they differ by trigger: `pull_request` is the merge commit on `refs/pull/<n>/merge`; `merge_group` is the queue commit on `refs/heads/gh-readonly-queue/...`; `push` and `schedule` are the pushed or default-branch commit on its branch ref. The judge takes both from the environment and never from the pull request's head.

## The control is named

The gate is a control, so it is declared in the controls register as a record (preventive, its stations, the Intent it serves, its evidence), not only as a job. That record belongs to the release Change that plans the judge; this Change pins the workflow.

## What this Change pins (Cases, plain `.test.mjs`)

- T1393: the source holds the job `verify CodeQL`: `needs: analyze`, runs when `analyze` failed or was skipped, has `security-events: read` and `contents: read` and nothing broader, and the triggers are the ones the file has today. It cannot be skipped: the workflow has no `paths` or `paths-ignore` filter, the job has no `if` other than the not-cancelled form and no `continue-on-error`, because a required check that never reports blocks forever and a skipped required job counts as success.
- T1394: `CODEQL_EXPECTED` and the matrix of `analyze` name the same configurations, so neither can drift without a Case turning RED. Engineering ships no YAML parser, so F93 pins the declaration format instead: the matrix is the one-line list `language: [a, b]` and `CODEQL_EXPECTED` is one quoted, space-separated string of `/language:<name>`; the Case says which format it found missing, so a reformat names itself instead of failing obscurely.

The judge's own Cases (a missing configuration is FAIL and named; an analysis with an error is FAIL; an alert at the threshold is FAIL; a clean complete set is PASS; an API error or an unfinished analysis is UNKNOWN and fails the job) are the release PLAN's, from the shape above.

## Sequence (technical dependency)

release PLAN and DO of the judge, then this DO (the source calls the judge), then the release WIRE (Owner's go), then the ruleset swap (Owner's go).

## Not in this Change

No WIRE, no `.github` change, no ruleset change, no removal of the legacy rule, no new required check. Dependency Review has the same shape of gap (README: uncovered gate) and is its own Change.

## Questions for the CPO

1. **Who owns the judge?** Recommended: release (control and script, its own Change), because engineering ships one script (N19) and the Owner kept CodeQL evidence in release (D4, 12 Nov). Engineering owns the workflow source. The alternative is a second script in engineering, which amends N19.
2. **What is the threshold?** SECURITY.md says "the established security threshold" and does not state it. The legacy rule carries a value in the ruleset that this PLAN cannot read. Recommended: take that value over unchanged, so the migration does not change what blocks, and declare it beside `CODEQL_EXPECTED`. Someone with ruleset access states it.
3. **How long does the job wait for analyses to finish processing?** Recommended: poll every 30 seconds for up to 10 minutes, then UNKNOWN. A longer wait costs a job slot; a shorter one risks UNKNOWN on a healthy upload.
