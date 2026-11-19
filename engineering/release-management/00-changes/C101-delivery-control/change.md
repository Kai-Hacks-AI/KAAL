# C101 change

## PLAN

1. Add the drafts in `interface.md` (the Requirement, the Architecture, the control, and the two small edits that make the reader reachable) and the Cases T1181 to T1186, all RED.
2. Observe the expected RED, and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN adds no source file, no workflow, nothing under `.github`, no ruleset and no setting. The two source edits are drafts in `interface.md` until the DO.

## Mechanism

The checker looks for the delivery reader in the repository and, failing that, beside itself under the names `kaal-delivery-locations.mjs` and `kaal-delivery-locations.json`. Both wrapper scripts write those two files next to the temporary copy of the checker from the target's tip with `git show` (the way `change-isolation.sh` already writes Foundation's SHA-256), and delete a file the target does not hold. With both present the rule judges; with either missing it says `cannot judge`, as today. Nothing of the gate changes: the rule still prints a detective line after the verdict and only for a change that passed.

## Classification and minimum evidence

release/CTL23 `verify Delivery` is detective. It reveals whether a change that touches a delivery location carries a path that is not delivery. PASS: no delivery location touched, or only delivery paths. FAIL: a delivery path together with a solution path. UNKNOWN: the declaration or the reader cannot be read, which never counts as a pass.

`evidence: [fixture:2, real:1, provoked:1:fail]`, in the form of controls/F28 and the kinds controls/F30 asks of every control. `fixture` is a scratch repository run through the wrapper; `real` is a Change Isolation run of this repository on a pull request into `main` whose log shows a judged line (not `cannot judge`); `provoked` is a mixed change made on purpose, RED on a `main` without the fix and GREEN with it. It claims `designed` and no more.

## Placement of the Cases

| Case | Tests | Sits in | Asserts |
| --- | --- | --- | --- |
| T1181 | release/CTL23 | `04-controls/CTL23-verify-delivery` | listed as detective with I53, equal to its draft |
| T1182 | release/F78 | `02-requirements/F78-delivery-rule-judges` | the Requirement serves I53, equal to its draft |
| T1183 | release/A69 | `03-architecture/A69-delivery-reader-beside-checker` | the Architecture addresses F78 and names the two wrappers and the two file names, equal to its draft |
| T1184 | release/F78 | F78 folder | the wrapper `change-isolation.sh`, run as the CI job runs it on a scratch repository, reports a mix of a delivery path and a solution path and does not say `cannot judge` |
| T1185 | release/F78 | F78 folder | the checker as a lone copy beside the two files judges the same mix; without the two files it says `cannot judge`, still passes the gate and never reports a pass of the rule |
| T1186 | release/CTL23 | CTL23 folder | the evidence declaration is present and accepted by the controls checker |

T1184 and T1185 are the RED Cases for `cannot judge`: on `main` both fail with exactly that line. All Cases are held `.red.mjs` and renamed `.test.mjs` in the DO.

## Ids

Change `release/C101`, Requirement `release/F78`, Architecture `release/A69`, control `release/CTL23`, Cases T1181 to T1186. Checked as the next free ids across `main` and every remote branch on 19 Nov 2026 (C100, F77, A68, CTL22, T1180 are the highest taken).

## DO

Not authorized by this PLAN. On the merged PLAN, into the collector `kaal/release/delivery-control`: add `F78.md`, `A69.md` and `CTL23.md` equal to their drafts, apply the two edits (the checker's reader lookup, the copy lines in `change-isolation.sh` and `push-check.sh`), and rename T1181 to T1186 to `.test.mjs`.

## ACT

A 4L retrospective in `act.md`.

## Left open

- The rule stays detective. Preventive is a different control with the same judge, only after CTL23 is Tested and the Owner decides.
- A target whose tip does not hold the reader or the declaration still says `cannot judge`; that is honest, and it is UNKNOWN.
- Registering the Change Isolation job as the station that runs CTL23, and recording the first real runs, follow the DO.
