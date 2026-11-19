# C94 change

## PLAN (revised 19 Nov after Kai's correction of the model)

The merged PLAN (#2017, CPO approved) assumed that the Defect and its reproducing Case already exist on the base. They cannot: `main` is GREEN, so a RED Case is not sitting on `main`. A Hotfix brings its own Defect record and its own Case. On a Hotfix branch the first commit is RED and a later commit may be GREEN. A finding is proven by a Case and a Defect, and the real proof is running that same Case against `main` and against the Hotfix and comparing the two runs. This revision amends the Requirement, the reader and the Cases to that model. The control identity, the read-only base-judge approach, the Git-data boundary, the separation of trace validity from correction evidence, the reading of every reproducing Case and the verdict-versus-job-result contract of the approved PLAN stand.

1. Amend release/CTL21, F71 and A66, the module, the workflow source and the Cases T380 to T384 (`interface.md`); all RED on the collector, observed.
2. The PLAN adds no source file, no workflow, no control declaration outside the drafts, nothing under `.github`, no ruleset and no setting.
3. A SYNC of `main` into the collector precedes the DO, because the Run of Cases (testing/C63) is on `main` only.

## What changes against the approved PLAN

| Was | Is |
| --- | --- |
| The Defect record and the Cases are read from the base, so a Hotfix cannot introduce them | They are read from the head: a Hotfix brings its own. Where they came from is no finding |
| The evidence is a Run record supplied by a caller | The control's own workflow produces it: the same Case, the head's file, is run by the Run of Cases on the default branch (the file copied over its tree) and on the head, and the judge compares the two |
| The baseline is the PR base | The baseline is the default branch, the code without the Hotfix; the PR base is used only for the Hotfix's own diff |
| One job | Two jobs on two machines: `run Hotfix Cases` runs code of the pull request and its output is only data; `verify Hotfix` starts clean and runs the base's judge |
| Not judged: correspondence, minimality, unrelated work | And the honesty of the Case, which is code of the pull request and can tell the two trees apart |

## The proof

For a Hotfix pull request: the Defect chapter names one Defect; its record on the head names reproducing Cases; each Case is found on the head. The Case files are taken from the head. On the baseline tree (the default branch checked out, the Case files copied over it) and on the head tree, the Run of Cases (`kaal-testing run --root <tree> <files>`) is made. A Case's result in a run is read from the tests the Run attributes to it by their leading `<namespace>/T<n>` (testing/F141): RED if one is RED, GREEN if all are GREEN, otherwise UNKNOWN. The correction is VERIFIED only when every Case is RED on the baseline and GREEN on the head. A Case still RED on the head, or GREEN on the baseline (it shows no issue there), is a finding for that Case. A run that could not be made, a Case with no attributed test, or a run recorded for another revision than the judge resolved, leaves the correction UNKNOWN, never RED: the Run classifies only an assertion failure as RED, so a Case that does not load, or needs more than `npm ci --ignore-scripts` to run, is UNKNOWN. The first commit of a Hotfix is RED on its head, a later commit may be GREEN, and every push is judged again.

## Control identity

- Control `release/CTL21` `verify Hotfix`, type detective, one Intent, release/I10 (create Hotfix, existing). No new Intent.
- Requirement `release/F71` serves I10; Architecture `release/A66` addresses F71.
- Stage: the Integrating station, for pull requests into a `hotfix/` base (the route of release/C67). The declaration in `stages.json` and the install are a later WIRE; nothing is added to `stages.json` here.
- It sits beside release/CTL11 `verify Envelope`: CTL11 judges the shape of the body, CTL21 follows the Defect reference to the record and proves the Case. Neither replaces the other, and neither judges the route.

## Reading the pull request, and what runs

The judge reads as release/CTL19 does: the base commit with no stored credential is the trusted judge, the head comes from `refs/pull/<n>/head` (it lives in the base repository for a fork pull request as well), the body arrives in the environment and is written to a file, never into script text. New here: the Cases are code of the pull request and run, as the repository's own CI runs its tests on a plain `pull_request` (read-only token, no secret). They run in a separate job, whose output is uploaded and downloaded as data, so the judge job never runs a file of the pull request and cannot be altered by it. What the run job reports can still be anything a Case chooses to make it say; that is the honesty of the Case, listed as not judged on every report, and review decides it.

## Decisions of the CPO review (19 Nov), kept

1. **Every reproducing Case is read.** The correction is VERIFIED only when each Case the Defect records is RED on the baseline and GREEN on the head; one bad Case is a finding for that Case; a Case without usable evidence leaves the correction UNKNOWN.
2. **The verdict is the report, not the job result.** The command line exits 0 whenever a report is produced, whatever the verdict, and 2 only when none can be. The honest verdict stays FAIL or UNKNOWN and never PASS, in the first word of the report, the job summary and annotations. A green job means "a report was produced". Requiring the check stays a separate Owner decision, and a required check would have to read the verdict from the report, not the job result.

## Placement of the Cases

| Case | Tests | Sits in | Asserts |
| --- | --- | --- | --- |
| T380 | release/G66 | `04-controls/CTL21-verify-hotfix` | the judge: valid trace, every broken link, evidence RED then GREEN, missing and stale evidence UNKNOWN, several roots as attention, never PASS and the honesty of the Case unjudged; several reproducing Cases: all verified, one still RED, one without evidence, one GREEN at the baseline |
| T381 | release/CTL21, F71, A66 | CTL21 folder | the finder lists CTL21 as detective with I10; the three element files equal their drafts; F16 carries the pointer |
| T382 | release/F71 | CTL21 folder | the facts from the head as Git data in a scratch repository, a Defect and Cases the Hotfix brings itself are found; the result of a Case in a run report; a run of another revision, a missing run and a Case with no test are UNKNOWN; the report prints FAIL or UNKNOWN and never PASS, exit 0 whenever a report is produced and 2 only for a call that cannot produce one |
| T383 | release/F71, A66 | CTL21 folder | the workflow source equals its draft: two jobs, the Cases run in the first, the judge in a clean job from the base commit, head from its pull request ref, runs downloaded as data, body from the environment and no expression in script text, Node 24 |
| T384 | release/F71, A66 | CTL21 folder | end to end with the real Run of Cases on scratch trees: a Case the Hotfix brings is RED on the default branch (its file copied over the tree) and GREEN on the head, the verdict is VERIFIED and never PASS; on a default branch that already holds the fix the same Case is a finding. Needs Node 24 and the built hosting, as the Run does |

The Cases move from the Change folder to the control's folder in the DO, as release/C90 did, and are renamed `.test.mjs`.

## Ids

Change `release/C94`, control `release/CTL21`, Requirement `release/F71`, Architecture `release/A66`, Gap `release/G66` (the hotfix block, taken over from C31), Cases T380 to T384 (the hotfix block T380 to T389). **Not yet reserved by the release thread**: C94, CTL21, F71 and A66 are the next free numbers and are to be confirmed before the DO.

## DO

Not authorized by this PLAN. On the merged PLAN, after the SYNC, into the collector `kaal/release/verify-hotfix`: add the three element files, `05-src/hotfix/verify-hotfix.mjs` and `05-src/wiring/workflows/verify-hotfix.yml` equal to the drafts, add the F16 pointer sentence, move T380 to T384 into the control's folder and rename them `.test.mjs`.

## ACT

A 4L retrospective in `act.md`. Retiring release/C31 is in this Change's closure: its collector and PR #1712 are already closed and deleted on the Owner's go, and G66 is closed by this Change.

## Left open

- **Executing code of the pull request.** The Run executes the Hotfix's Cases, as every CI job of this repository executes the tests of a plain `pull_request`. The separate job keeps the judge clean, but the run's output is whatever the Cases make it; a Case can tell the two trees apart. The control is a detective and says so on every report.
- **A Case that needs more than `npm ci --ignore-scripts`** (a build, a service) reads UNKNOWN. Whether a Hotfix may declare its own preparation is for a later Change.
- **The baseline is the default branch.** F16 allows the defect to be in production (a published version) or in an unpromoted collector, not only in `main`. This control proves the issue on `main`; the other two states are for the Hotfix delivery path.
- **A pull request can edit the workflow that runs the check.** As release/CTL19: the WIRE judge compares the installed copy with this source.
- Registration in the Integrating station and requiring the check are separate steps (a WIRE and a ruleset load), with times given to the Owner when the DO is on `main`.
- **Defect homes.** The reader resolves `<capability>/D<n>` in `packages/kaal-<capability>` and `engineering/<capability>`.
