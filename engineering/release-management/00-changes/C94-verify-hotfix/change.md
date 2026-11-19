# C94 change

## PLAN (revised 19 Nov to Kai's concept of a valid Hotfix)

A valid Hotfix is exactly: one Defect, and at least one Case that verifies it, RED before and GREEN after. That is deterministic and the control proves it. It is pure content: the control takes two trees, before and after, and does not care whether they are two branches or two file locations. Only the GitHub adapter maps the default branch and the head of a `hotfix/` pull request onto the two trees. A Hotfix brings its own Defect record and Case: `main` is GREEN, so a RED Case is not on `main` to be found. Whether a Case corresponds to its Defect, is honest, or whether the correction is minimal is content, which review decides and the Inspector later; the control judges none of it. Because the four conditions hold deterministically, PASS means proven, not approved.

This revision replaces the merged PLAN's (#2017) parts that assumed otherwise: the Defect and Case read from a Git base, a verdict that is never PASS, a list of what stays unjudged on every report, and a Run record supplied by a caller. The control identity, reading every reproducing Case and the verdict-versus-job-result contract (CPO review, 19 Nov) stand.

1. Amend release/CTL21, F71 and A66, the module, the GitHub adapter and the Cases T380 to T384 (`interface.md`); all RED on the collector, observed.
2. The PLAN adds no source file, no workflow, no control declaration outside the drafts, nothing under `.github`, no ruleset and no setting.
3. A SYNC of `main` into the collector precedes the DO, because the Run of Cases (testing/C63) is on `main` only.

## The control

- `release/CTL21` `verify Hotfix`, detective, one Intent, release/I10 (existing). Requirement `release/F71`, Architecture `release/A66`. Stage: the Integrating station, for pull requests into a `hotfix/` base; the declaration in `stages.json` and the install are a later WIRE.
- It judges from two directories, `--before` and `--after`, and the body of the Hotfix. The Defect chapter names one Defect; its record and Cases are read from the after tree; the same Case files are run by the Run of Cases (`kaal-testing run`, testing/F138 to F145) on both trees, for the before tree after copying them over it. Every Case must be RED before and GREEN after. A Case's result is read from the tests the Run attributes to it by their leading `<namespace>/T<n>` (testing/F141).
- PASS when valid; FAIL with the broken link when a link is missing or a Case is still RED after or GREEN before; UNKNOWN when a run could not be made or read (the Run classifies only an assertion failure as RED, so a Case that does not load is UNKNOWN, never RED).
- The first commit of a Hotfix is RED after and a later commit may be GREEN: the after tree at hand is judged and every push is judged again.
- The verdict is the report, not the job result: exit 0 whenever a report is produced, 2 only when none can be; the verdict is the first word of the report, in the job summary and in annotations.
- It sits beside release/CTL11 `verify Envelope`: CTL11 judges the shape of the body, CTL21 follows the Defect reference and proves the Case. Neither judges the route.

## The GitHub adapter

One workflow source, plain `pull_request` into `hotfix/**`, no token, no secret. The default branch is the before tree and the head (`refs/pull/<n>/head`) the after tree. Two jobs on two machines: `run Hotfix Cases` runs the Cases, which are code of the pull request, as the repository's own CI runs its tests on a plain `pull_request`, and its output is only data; `verify Hotfix` starts clean, checks out the base, makes the after tree to be read and never run, downloads the two reports and runs the base's judge. The body arrives in the environment and is written to a file, never into script text. Each tree is prepared with `npm ci --ignore-scripts`; a Case that needs more reads UNKNOWN.

## Placement of the Cases

| Case | Tests | Asserts |
| --- | --- | --- |
| T380 | release/G66, F71 | the judge: PASS, every broken link, RED then GREEN, still RED after, GREEN before, anything not observed UNKNOWN, several Cases all read |
| T381 | release/CTL21, F71, A66 | the finder lists CTL21 as detective with I10; the three element files equal their drafts; F16 carries the pointer |
| T382 | release/F71 | on two plain directories: a Defect and Cases the Hotfix brings are found in the after tree; a result read from a run report; the command line prints PASS, FAIL or UNKNOWN first and exits 0 whenever a report is produced |
| T383 | release/F71, A66 | the GitHub adapter equals its draft: two jobs, the Cases run in the first, the judge in a clean job, default branch before and head after, runs as data, body from the environment |
| T384 | release/F71, A66 | end to end with the real Run of Cases on two plain directories, no Git: RED then GREEN is PASS; GREEN before and still RED after are findings. Needs Node 24 and the built hosting, as the Run does |

These Cases are fixtures: they prove the mechanism whichever real Case later passes through it. They move to the control's folder in the DO and are renamed `.test.mjs`.

## Ids

Change `release/C94`, control `release/CTL21`, Requirement `release/F71`, Architecture `release/A66`, Gap `release/G66` (the hotfix block, taken over from C31), Cases T380 to T384. **Not yet reserved by the release thread**: C94, CTL21, F71 and A66 are the next free numbers and are to be confirmed before the DO.

## DO

Not authorized by this PLAN. On the merged PLAN, after the SYNC, into the collector `kaal/release/verify-hotfix`: add the three element files, `05-src/hotfix/verify-hotfix.mjs` and `05-src/wiring/workflows/verify-hotfix.yml` equal to the drafts, add the F16 pointer sentence, move T380 to T384 into the control's folder and rename them `.test.mjs`.

## ACT

A 4L retrospective in `act.md`. Retiring release/C31 is in this Change's closure: its collector and PR #1712 are closed and deleted on the Owner's go, and G66 is closed by this Change.

## Left open

- The Run executes the Hotfix's Cases, as every CI job of this repository executes the tests of a plain `pull_request`; the separate job keeps the judge clean.
- The before tree is the default branch. F16 allows the defect to be in production (a published version) or in an unpromoted collector, not only in `main`; those states are for the Hotfix delivery path.
- A pull request can edit the workflow that runs the check. As release/CTL19: the WIRE judge compares the installed copy with this source.
- Registration in the Integrating station and requiring the check are separate steps (a WIRE and a ruleset load); a required check would read the verdict, not the job result.
- The reader resolves `<capability>/D<n>` in `packages/kaal-<capability>` and `engineering/<capability>`.
