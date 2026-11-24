# C67 do

## What the DO added

- `05-src/plan-body/envelope.mjs` equal to the draft of `interface.md`: a SYNC takes a base under `kaal/`, `hotfix/` or `wire/`; a PROMOTION takes `main` as base and a head under `kaal/` or `hotfix/`; a HOTFIX goes into a base under `hotfix/` from a head that is not under `hotfix/`; the base of a HOTFIX is no longer reported as not judged; a pull request from a `hotfix/` head under any TYPE but PROMOTION is a finding that says it must be a PROMOTION into `main`.
- `02-requirements/F17-envelope-rules/F17.md`: the Route line and the HOTFIX body and head line equal to the drafts.
- T870 to T873 renamed from `.red.mjs` to `.test.mjs`. All four are green.
- The six old Cases amended to the agreed route, keeping what each is for: release/T161 and T188 (route rows and the HOTFIX verdict: a HOTFIX into a `hotfix/` base from a Development head is on its route and stays UNKNOWN; into `main`, a collector or a bare `hotfix` base it is a finding that names the route; the base is no longer reported as not judged), T189 (exit codes, now from a HOTFIX into a `hotfix/` base), T190 and T192 (the words of F17: the HOTFIX route, the PROMOTION from `hotfix/`, a `hotfix/` head is promoted), T191 (a `hotfix/` head under DO or DEFAULT is a finding that names PROMOTION; the HOTFIX fixture goes into a `hotfix/` base). One assertion of T188 that a HOTFIX from a collector head is refused is removed: the agreed route refuses only a `hotfix/` head, and a collector head is for the Reviewer.

## Checked beside the Cases

- The Cases runner (`engineering/cases/cases.test.mjs`): 191 pass, 12 fail; the 12 are the unnamed Cases of `collector-capability/00-changes/C15-collector-capability` (T268 to T279), which fail on `main` too. No other consumer of the envelope in the repository reads the rows.
- The HOTFIX template of release/C63 (its chapters Change, Defect, Urgency, Approach and HOW TO WORK, from `kaal/release/hotfix-template`), filled with example text and sent as a HOTFIX into a `hotfix/` base from a Development head through `node envelope.mjs`: UNKNOWN, exit 3, no finding. What is not judged is what the review decides. The template's HOW TO WORK chapter raises no finding. That answers the release/D1 verification for the template.

## Not done, as planned

The check is not wired and this Change does not wire it: no workflow, ruleset or hook runs it. D1's acceptance is the correction and its verification; whether the templates WIRE proceeds is the Owner's and the CPO's.
