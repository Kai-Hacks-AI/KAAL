# C63 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The HOW TO WORK rows are argued from the branch the pull request goes into. A hotfix branch starts at main's tip, carries one correction and accepts a pull request only when every check it requires is green on the exact head; the five rows say that and name no other process. The CPO's one request, keeping the main-tip predecessor, fitted the rows as drafted. The Cases judge the template against the current one (it starts with it) and the table format, so a reader cannot lose a chapter without a Case going red.

## Learned

I first read the HOTFIX scope as a pull request from `hotfix/*` into main and drafted the rows for that. The coordinator corrected it: a HOTFIX pull request goes into `hotfix/*`, and the way from there to main is a promotion with the one promotion template. The PLAN was rewritten before the Cases were written. The legacy `check PR Envelope` Case T189 still assumes the old direction, so the template's reality and the checker differ until the WIRE.

## Lacked

A statement, in one place, of what each pull request type goes into. I had to ask, and the answer lives in several template comments.

## Longed For

A way to see, before the WIRE, whether the envelope check accepts a body of the new template. The Cases show format and wording, not acceptance; that is the WIRE's step.

## Follow-ups

- Promote this collector, then install the template with the other templates in the one templates WIRE. Until then `.github/PULL_REQUEST_TEMPLATE/hotfix.md` stays as it is.
- `check PR Envelope` (T189) still treats a HOTFIX as hotfix/* into main. That is legacy and not changed here; whoever changes it decides.
