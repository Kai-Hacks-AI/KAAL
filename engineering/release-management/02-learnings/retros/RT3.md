---
id: release/RT3
format: 4L
reflects: [release/C112]
---
Account of: I am the release thread. I planned and built the library of facts the judges of the ACT stand on (C112): the PLAN, the throwaway proof, the SYNC that brought limit Act to the collector, and the DO. This is my account only: the CPO and the Owner have not been asked what they lacked, and I wrote the retro of my own collector.

## Liked
- subject: Cases that judge behaviour and layering instead of pinning a file to its draft
  keeps: the refactor could move code freely and the Cases still said whether anything a judge answers had changed; the one-way layering Case turned "a judge must not import a judge" from a sentence into something that fails.
- subject: proving the DO in a throwaway copy before the PLAN was asked for approval
  keeps: the copy carried the real refactor, so the PLAN could state that 309 Cases pass and six mutations are caught, and the DO afterwards was a copy of work already seen; one mutation slipped through in the copy and I tightened the Case before anyone reviewed it.

## Learned
- subject: a SYNC is a pure merge of main into the collector on its own branch, titled with the main tip and landed by merge commit
  source: the body and the merge of the earlier SYNC pull request of the limit Act collector, read directly from GitHub. It says "Pure merge of main (<sha>) into <collector>. No manual edits." with a Reason section, and I landed mine the same way.

## Lacked
- subject: nothing told me how the SYNC of a collector is made and who raises it
  decision-point: the instruction to sync main into the collector before starting the DO.
  cost: I read an earlier SYNC pull request and the branching workflow header to infer the shape, a few reads that a written step would have saved.
  findable: yes
  address: Skill
- subject: nothing gave me a runnable lane in this clone
  decision-point: choosing how to prove the refactor before the PLAN.
  cost: the comprehensive lane failed on missing built packages, so I ran the Cases of the release capability directly with a runner of my own and reported that the lane itself was not run.
  findable: no
  address: script

## Longed For
- subject: one command that runs the Cases that apply to a Change folder
  worked-anyway: I wrote the same ten-line runner twice in a scratch folder and the run was complete; nothing was blocked, it only repeated.

Decisions: none made, the owner decides.
