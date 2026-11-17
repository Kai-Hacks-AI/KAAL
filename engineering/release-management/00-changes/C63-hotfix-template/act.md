# C63 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The HOW TO WORK rows are argued from the branch the pull request goes into. A hotfix branch starts at main's tip, carries one correction and accepts a pull request only when every check it requires is green on the exact head; the five rows say that and name no other process. The CPO's one request, keeping the main-tip predecessor, fitted the rows as drafted. The Cases judge the template against the current one (it starts with it) and the table format, so a reader cannot lose a chapter without a Case going red.

## Learned

I first read the HOTFIX scope as a pull request from `hotfix/*` into main and drafted the rows for that. The coordinator corrected it: a HOTFIX pull request goes into `hotfix/*`, and the way from there to main is a promotion with the one promotion template. The PLAN was rewritten before the Cases were written. The `check PR Envelope` control and its Cases (T161, T188 to T192) still assume the old direction, so the template's reality and the checker differ; that is the Defect release/D1, answered by release/C67.

## Lacked

A statement, in one place, of what each pull request type goes into. I had to ask, and the answer lives in several template comments.

## Longed For

A way to see, before the WIRE, whether the envelope check accepts a body of the new template. The Cases show format and wording, not acceptance; that is the WIRE's step.

## Follow-ups

- Promote this collector, then install the template with the other templates in the one templates WIRE. Until then `.github/PULL_REQUEST_TEMPLATE/hotfix.md` stays as it is.
- The mismatch is a Defect with an owner: release/D1, `check PR Envelope` refuses the agreed hotfix route (a HOTFIX into `hotfix/*` from a Development branch, a PROMOTION from `hotfix/*`, a SYNC into `hotfix/*` and `wire/*`). It lies in both the control and the Cases that fixed the old route (T161, T188 to T192). Owner: the release capability thread. The corrective Change is release/C67, PLAN #1893, with acceptance criteria and verification in `D1-envelope-hotfix-route.md`: its RED Cases T870 to T873, then the amended Cases run GREEN, and the body of this template run through the corrected check.
- The templates WIRE does not proceed until release/D1 is answered and checked. The promotion of release/C67 has delivery priority.
