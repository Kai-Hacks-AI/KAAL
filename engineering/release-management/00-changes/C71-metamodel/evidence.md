# C71 evidence

## Provenance

- Baseline: `main` at c8291dbd.
- Method: each Case's `run()` is imported and called in this tree. Observed 18 Nov 2026, Node on Linux. With no variable the Cases read `engineering/metamodel/`, which does not exist; with `KAAL_METAMODEL_DIR` set to `drafts/` they read the drafts.
- Sample: the PLAN #1889, DO #1890, ACT #1891 and PROMOTION #1892 of release/C65, recorded in `sample-c65.json` from the GitHub API (title, Change line, files). The walk below uses them and the repository.

## Result

| Case | On `main` | Against `drafts/` |
| --- | --- | --- |
| T910 | RED: the global metamodel is absent | GREEN (purpose, trace chain in order, one diagram) |
| T911 | RED: absent | GREEN |
| T912 | RED: absent | GREEN |
| T913 | RED: the view of `pull_request_template.md` is absent | GREEN |
| T914 | RED: absent | GREEN |
| T915 | RED: absent | GREEN |
| T916 | RED: `pull_request_template.md` does not name its view | RED: the templates are `.github`, changed by the Change that follows |
| T917 | RED: absent | GREEN |
| T918 | RED: absent | GREEN |
| T919 | RED: absent | GREEN |

The Cases also fail on bad input, checked by editing a copy of the drafts: removing `Architecture addresses Defect` fails T911; pointing a Views link at a missing file fails T914; adding a table to a view fails T915.

## The walk: can a reviewer answer the six questions?

Using the global model's Reviewer questions on the four pull requests of release/C65.

| Question | Answer found by following the model | Where it was read |
| --- | --- | --- |
| Q1 objects affected | PLAN: the Change record (`00-changes`) and one Intent folder (`01-intent`). DO: `00-changes`, `01-intent`, `04-controls`, `05-src`. ACT: one record file. PROMOTION: the union. | the file list of each PR, by folder |
| Q2 Intent delivered | `release/I35` | the Change line gives `release/C65`; `C65.md` has `implements: [release/I35]` |
| Q3 Requirements and Architecture | none exist; Controls `release/CTL7` and `release/CTL8` have I35 | `serves` finds no Requirement; `has` finds the two Controls |
| Q4 what each Case tests | T850 tests `release/I35`; T851 to T855 test `release/C65` | `export const tests` of each Case |
| Q5 Defects | none; the Change closes the Gap `release/G93` | `closes` in `C65.md`; no `addresses` to a Defect |
| Q6 evidence | `evidence.md` (the RED observed in the PLAN), `act.md` (the 4L), `gap.md`; CI checks and the CPO approval on the pull request | the record folder; the PR |

## What the walk exposed (all recorded in the model as mismatches)

- Q2 takes two hops and the first one leaves the PR: the PR names the Change, never the Intent (M6). The PLAN #1889 mentions I35 in prose; the ACT and PROMOTION do not.
- The key is `implements`, not `delivers` (M1); Requirements and Architecture use `serves` and `addresses` (M2).
- Q3 finds nothing in the Requirements and Architecture folders: the chain is Control has Intent (M4).
- Q5: no Defect; the repository closes a Gap (M8). Nothing in the Architecture addresses a Defect anywhere (M3).
- A reviewer cannot find the Change Node of release/C37 (M5) and cannot find a WIRE template (M7).
- Q3 and the chain: Kai's chain places a Control between Architecture and Case; the repository links a Control to an Intent only, and no file links a Control to its Source (M9).
- The reference in a template reaches an author, not a reviewer, because a template's leading comment is not part of the authored body (open question 3).

HOTFIX, SYNC and DEFAULT are given views from their templates and the Definitions, but are not walked here: the sample is one Change. The DO walks one of each.
