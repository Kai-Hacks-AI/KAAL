# C94 change

## PLAN

1. Add the drafts in `interface.md` (the control, its Requirement and Architecture, the F16 pointer sentence, the judge and reader module and the workflow source) and the Cases T380 to T383, all RED.
2. Observe the expected RED, and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN adds no source file, no workflow, no control declaration outside the drafts, nothing under `.github`, no ruleset and no setting.

## What is carried from C31, and what is new

Carried, and kept in meaning: the semantic boundary (one Hotfix, one identified Defect), the trace HOTFIX, Defect, reproducing Case, verified correction, the two judgments kept apart (trace validity is structural; correction evidence is revision-bound), the finding list, RED at the baseline as expected and never a finding, missing or stale evidence as UNKNOWN, a diff over several capability roots as attention and not a finding, never PASS with the three unjudged statements, and the Cases T380 (the judge, with its path moved) and the text Case.

Changed: C31 stated its text in F16 and named no control. Here F16 keeps its interface and gets one pointer sentence, and the judgement is stated by release/F71 and declared by release/CTL21. The reading of the facts is new: C31 left the three lookups to a caller that does not exist. The reader takes everything about Defects and Cases from the base commit, the trusted state, so a Hotfix cannot introduce the Defect or the Case it is judged against.

## Control identity

- Control `release/CTL21` `verify Hotfix`, type detective, one Intent, release/I10 (create Hotfix, existing). No new Intent.
- Requirement `release/F71` serves I10; Architecture `release/A66` addresses F71; the control is declared by the module and the workflow source of A66.
- Stage: the Integrating station, for pull requests into a `hotfix/` base (the route of release/C67). The declaration in `stages.json` and the install are a later WIRE; nothing is added to `stages.json` here.
- It sits beside release/CTL11 `verify Envelope`: CTL11 judges the shape of the body, CTL21 follows the Defect reference to the record. Neither replaces the other, and neither judges the route.

## Reading the pull request

As release/CTL19: the workflow checks out the base commit with no stored credential, fetches the head from `refs/pull/<n>/head` (it lives in the base repository for a fork pull request as well) and runs the base's judge, so no file of the pull request is executed. The body arrives in the environment and is written to a file, never into script text. The judge reads the diff, the Defect record and the Case identities as Git data; it does not run a Case. The evidence of the correction is a Run record the caller supplies, bound to both revisions; producing it is the Run of the Cases (`kaal-testing run`) and is not this Change. Without a Run record the verdict is UNKNOWN.

## Decisions of the CPO review (19 Nov)

1. **Every reproducing Case is read.** A Defect records its reproducing Cases in the `tests` list of its record (for example hosting/D10: T201 to T203). The correction is VERIFIED only when each of them is RED against the baseline and GREEN against the corrected revision. One Case still RED, or GREEN at the baseline, is a finding for that Case whatever the others show; a Case without usable evidence leaves the correction UNKNOWN. The Run record is keyed by Case identity. The judge, F71, A66, CTL21 and Cases T380 and T382 say it. C31 read the first Case only; that is withdrawn.
2. **The verdict is the report, not the job result.** The command line exits 0 whenever a report is produced, whatever the verdict, and 2 only when none can be (a missing argument); the workflow fails the job when the judge is absent on the base or the head cannot be fetched, because then no report exists. The honest verdict stays FAIL or UNKNOWN and never PASS, with its unjudged statements. It is carried in the first word of the report, in the job summary and in annotations (an error per finding, a warning for UNKNOWN) on GitHub Actions, so a reviewer tells an executed report from a broken check. A green job therefore means "a report was produced", and the check must not be read as an approval. Requiring the check stays a separate Owner decision; a required check would have to read the verdict from the report and not the job result, which is a gate with its own design (release/CTL20 is the pattern).

## Placement of the Cases

| Case | Tests | Sits in | Asserts |
| --- | --- | --- | --- |
| T380 | release/G66 | `04-controls/CTL21-verify-hotfix` | the judge: valid trace, every broken link, evidence RED then GREEN, missing and stale evidence UNKNOWN, several roots as attention, never PASS; several reproducing Cases: all verified, one still RED, one without evidence, one GREEN at the baseline |
| T381 | release/CTL21, F71, A66 | CTL21 folder | the finder lists CTL21 as detective with I10; the three element files equal their drafts; F16 carries the pointer |
| T382 | release/F71 | CTL21 folder | the facts from Git data in a scratch repository: the Defect chapter alone, a recorded Defect and its Cases, a Case that exists and no prefix match, a Defect added by the Hotfix itself is not recorded; the report prints FAIL or UNKNOWN and never PASS, exit 0 whenever a report is produced (also FAIL, UNKNOWN and an unreadable ref) and 2 only for a call that cannot produce one; the Run record is read per Case |
| T383 | release/F71, A66 | CTL21 folder | the workflow source equals its draft: plain `pull_request` into `hotfix/**`, read-only, no secret, base checkout without credential, head from its pull request ref, body through the environment and no expression in script text, only the base judge |

The Cases move from the Change folder to the control's folder in the DO, as release/C90 did, and are renamed `.test.mjs`.

## Ids

Change `release/C94`, control `release/CTL21`, Requirement `release/F71`, Architecture `release/A66`, Gap `release/G66` (the hotfix block, taken over from C31), Cases T380 to T383 (the hotfix block T380 to T389). **Not yet reserved by the release thread**: C94, CTL21, F71 and A66 are the next free numbers on `main` at 189662e and are to be confirmed before the DO.

## DO

Not authorized by this PLAN. On the merged PLAN, into the collector `kaal/release/verify-hotfix`: add the three element files, `05-src/hotfix/verify-hotfix.mjs` and `05-src/wiring/workflows/verify-hotfix.yml` equal to the drafts, add the F16 pointer sentence, move T380 to T383 into the control's folder and rename them `.test.mjs`.

## ACT

A 4L retrospective in `act.md`. Retiring release/C31 is in this Change's closure: its collector `kaal/hotfix/defect-only-diff` and PR #1712 are closed once this PLAN is raised, on the Owner's go, and G66 is closed by this Change.

## Left open

- **Producing the Run record** (every reproducing Case run at the baseline and at the head) needs a Run of the head's Case, which executes the pull request's code. It belongs to the Hotfix delivery path or to the Inspector, not to a plain `pull_request` check.
- **A pull request can edit the workflow that runs the check.** As release/CTL19: the WIRE judge compares the installed copy with this source.
- Registration in the Integrating station and requiring the check are separate steps (a WIRE and a ruleset load), with times given to the Owner when the DO is on `main`.
- **Defect homes.** The reader resolves `<capability>/D<n>` in `packages/kaal-<capability>` and `engineering/<capability>`. A Defect recorded anywhere else reads as not recorded until the home is added.
