---
id: release/RT4
format: 4L
reflects: [release/C113]
---
Account of: I am the release thread. I planned and built the flag `applies` that every judge of the ACT now answers beside its verdict (C113): the PLAN with its throwaway proof, the SYNC that brought the library to the collector, and the DO. This is my account only: the CPO and the Owner have not been asked what they lacked, and I wrote the retro of my own collector.

## Liked
- subject: one Case for each judge that walks its three outcomes in Given-When-Then
  keeps: the rule "false only on a PASS with nothing to judge" is observed where each judge decides it, so a judge that quietly says "applies" on an unfinished collector fails a named Case; seven mutations of the judges were caught, none by a Case that reads source text.
- subject: building the DO while the PLAN waited, then restacking it onto the synchronised collector
  keeps: the DO was proved on main plus the PLAN before anything was merged, so after the SYNC it was a cherry-pick of work already run, and the pull request opened within minutes of the SYNC.

## Learned
- subject: a PROMOTION title is taken from the first line of the ACT body, so that line must be a short name with no ids
  source: the Dispatcher's code on main (`title: PROMOTION: ${line}` in final-step.mjs) and the title of the promotion of the library, which Promoting had to rewrite by hand; both read directly, nothing inferred from other threads.

## Lacked
- subject: nothing said which ACT body shape applies while the installed template and its source differ
  decision-point: writing the body of this ACT pull request.
  cost: the source template has three chapters and the installed one has two; the Dispatcher still accepts only two, so I kept the two-chapter body and spent a read of both templates and of `stepOf` to be sure it would not be classified as something else.
  findable: yes
  address: AGENTS.md
- subject: nothing told me whether a draft PROMOTION waiting after my ACT was in the queue or stuck
  decision-point: the ten minutes after the ACT of the library merged with no promotion released.
  cost: I scheduled my own check and sent a note to the coordinator, and found out afterwards that Promoting was working it by hand.
  findable: no
  address: Skill

## Longed For
- subject: one command that restacks a DO built on main onto a collector after its SYNC
  worked-anyway: a cherry-pick and a rerun of the Cases did it in a minute; nothing was blocked, only done by hand.

Decisions: none made, the owner decides.
