# C100 change

## PLAN

1. Add the drafts in `interface.md` (Intent, Requirement, Architecture, the control, the judge module and the workflow source) and the Cases T1173 to T1180, all RED.
2. Observe the expected RED, and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN adds no source file, no workflow, no control declaration outside the drafts, nothing under `.github`, no ruleset and no setting.

## Mechanism

A pure judge over three facts: the commit `main` had before a push, the commit it has after, and whether the first is an ancestor of the second. FAIL when the commit before is not an ancestor of the commit after. PASS when they are equal, when the commit before is an ancestor, or when `main` is new. UNKNOWN when it cannot tell, or when there is no commit after the push, and UNKNOWN never passes. The facts come from Git (`cat-file`, `merge-base --is-ancestor`), never from the text of a pull request.

## Classification

Detective. It reveals after the fact. The old rules are preventive; a preventive control with the same judge is a different control with the same code, made only after this control is Tested and the Owner decides (the feature-flag rule of the controls). Until then the old rules stay.

## Minimum evidence

`evidence: [fixture:2, real:1, provoked:1:fail]`, in the form of controls/F28 and in the kinds controls/F30 (PLAN controls/C17, #2075) asks of every registered control, so the two Changes agree whichever lands first. `fixture` is a scratch repository where `main` moves forward; `real` is a push to `main` of this repository that the control judged PASS; `provoked` is a failure made on purpose, a rewritten `main`, shown by a RED base and a GREEN head. The control's own Cases create these histories in scratch repositories. The control claims `designed` here and no more; the later statuses are claimed by their own evidence.

## Placement of the Cases

| Case | Tests | Sits in | Asserts |
| --- | --- | --- | --- |
| T1173 | release/CTL22 | `04-controls/CTL22-verify-history` | listed as detective with I54, equal to its draft |
| T1174 | release/I54 | `01-intent/I54-main-history-is-kept` | the Intent equals its draft |
| T1175 | release/F77 | `02-requirements/F77-verify-history` | serves I54, states the three verdicts |
| T1176 | release/A68 | `03-architecture/A68-verify-history` | addresses F77, names the module and the workflow |
| T1177 | release/CTL22 | CTL22 folder | the judge: forward, equal and new pass; a rewrite fails; an untold history and a missing commit after the push (a deletion) are UNKNOWN, never PASS |
| T1178 | release/CTL22 | CTL22 folder | the command line on real scratch repositories: fast-forward passes, a rewritten main fails, a deleted main is UNKNOWN, an unreadable commit is UNKNOWN |
| T1179 | release/F77 | CTL22 folder | the workflow source: push to main only, read-only, no secret, no pull request trigger, full history, runs the judge on the two ids |
| T1180 | release/CTL22 | CTL22 folder | the evidence declaration is present and accepted by the controls checker |

All Cases are held `.red.mjs` and are renamed `.test.mjs` in the DO.

## Ids

Change `release/C100`, Intent `release/I54`, Requirement `release/F77`, Architecture `release/A68`, control `release/CTL22`, Cases T1173 to T1180. Taken as the next free ids on `main` 4479d00; the release thread confirms them at the PLAN.

## DO

Not authorized by this PLAN. On the merged PLAN, into the collector `kaal/release/verify-main-history`: add the four element files, `05-src/history/verify-history.mjs` and `05-src/wiring/workflows/verify-history.yml` equal to the drafts, and rename T1173 to T1180 to `.test.mjs`.

## ACT

A 4L retrospective in `act.md`.

## Left open

- Deletion of `main` is not claimed. A deleted branch fires `delete`, not `push`, and a workflow of the default branch cannot be read when the default branch is gone, so no push workflow can observe it. The judge says UNKNOWN for a missing commit after the push and its Cases prove that it never passes. The protection stays with the old `deletion` rule of the promotion ruleset, and a deletion control with a credible observation (a scheduled or `delete`-triggered run, or the Inspector) is a separate Intent and Change, tracked as a follow-up of the ruleset retirement. The old preventive rules stay in place until a separately evidenced replacement and the Owner's decision.
- The judge runs from the checkout of the commit after the push, so a rewrite could also replace the judge. This is why the control is detective and why the old rules stay until a preventive control is Tested.
- Registration in a station and wiring are a WIRE; making the preventive twin and removing the old rules are the Owner's later steps.
