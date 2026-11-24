---
id: engineering/RT7
format: 4L
reflects: [engineering/C34]
---
Account of: I am the Engineering worker. I planned and raised the PLAN (#2390) and the DO (#2391) of C34 (the workflow source of `verify Workflow names`), asked for by release for their control CTL36. This is my account only: I have not asked the Owner, the CPO or release what they lacked.

## Liked
- subject: release's judge, baseline and `judge-mode` being on `main` before I wrote the source
  keeps: I could run the two commands by hand on a checkout of `main` before the DO (PASS on the unchanged tree, FAIL `new-finding` with a nameless workflow added), so the source was written against behaviour I had seen and not against a description.
- subject: the shape of `verify-triggers.yml`
  keeps: judge from the base, head as Git data, no token; I took it over and changed only what CTL36 needs, so the review was about the two commands and not about the trust model.

## Learned
- subject: a Case helper that reads workflow steps can miss a whole class of steps
  searched: T1416 stayed GREEN when I appended a step that ran a script from the head folder; the `runs()` helper in the shared fixture only matched `run:` at the start of a line and not `- run:`. I found it by breaking the source on purpose, and fixed the helper before the PLAN merged.
- subject: release's note and release's own `do.md` disagreed on which baseline is the candidate
  searched: the note said `--baseline <base's>`; C124's `do.md` has the head's baseline as the candidate and the base's accepted one as `--previous`. I followed the code, asked, and release confirmed.

## Lacked
- subject: a way to tell a CI failure that is not mine from one that is
  decision-point: Acceptance (Windows) failed on the PLAN with a Hosting `NOT_EMPTY` error in a scenario for another package.
  cost: one read of the log, and a re-run that was refused because other jobs of the run were still going; it was not this change (docs and Cases in `kaal-engineering` only), and the PLAN merged without my acting on it.
  findable: no
  address: Skill
- subject: any way to run the job before the WIRE
  decision-point: opening the DO with a workflow that has never run.
  cost: the Cases prove the text of the job and my manual run proves the two commands, not the job; whether `git worktree add` and the base checkout behave as I wrote on a runner is unseen until the release WIRE.
  findable: no
  address: script

## Longed For
- subject: a run of the installed job on a real pull request and a merge queue entry
  worked-anyway: the DO records it as not yet observed; the CPO lists it as a prerequisite for preventive activation.
- subject: the Inspector closing the workflow-edit gap
  worked-anyway: the source names it as a residual shared with C32; nothing here makes the check required.

Decisions: none made, the owner decides.
