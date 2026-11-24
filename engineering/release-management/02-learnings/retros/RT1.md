---
id: release/RT1
format: 4L
reflects: [release/C103, release/C108]
---
Account of: I am the release thread. I planned and built hold Act (C103) and demand Act (C108) on this collector, raised their PLANs and DOs, and answered the CPO's reviews and the Owner's corrections as they reached me through the coordinator. This is my account only: the CPO and the Owner have not been asked what they lacked, and I wrote the retro of my own collector.

## Liked
- subject: the drafts in interface.md that a Case compares with the file after the DO
  keeps: the PLAN and the DO cannot drift apart; when I changed `changeIdOf` in the DO, T1264 failed until the draft said the same, so the PLAN stayed the record of what was built.
- subject: the CPO's review at an exact head
  keeps: the qualified-id mismatch between my judge and the retros was found while the DO was still open, before anything merged that would have let a real ACT pass unseen.

## Learned
- subject: GitHub separates dismissing an approval on a push from requiring approval of the latest push by someone other than the pusher
  source: GitHub Docs on rulesets and protected branches (Available rules for rulesets), found by a web search and read as search summaries, so secondhand. They say that dismissing stale approvals drops an approval when a code-modifying commit lands, and that requiring approval of the most recent reviewable push needs a reviewer other than the one who pushed; they did not say how either interacts with auto-merge.

## Lacked
- subject: nothing told me that `reflects` names a Change by its qualified id, `<capability>/C<n>`
  decision-point: writing `changeIdOf` for hold Act.
  cost: I took `C103` from the folder name; the CPO saw that a real retro would reflect `release/C103`, so my judge would have passed an ACT unseen, and the DO needed a correction and the demand Act PLAN a revision.
  findable: yes
  address: AGENTS.md
- subject: nothing showed me whether a pull request had already merged when I pushed a revision to it
  decision-point: pushing the relative write map of limit Act to a PLAN that was waiting for review with auto-merge on.
  cost: the approval of the earlier head merged it within a minute and my revision arrived after the merge; I told Kai it was pushed, had to explain why the approval merged unfinished work, and opened a second pull request.
  findable: yes
  address: AGENTS.md
- subject: the Owner's rule of one collector, one ACT, the full set of Changes, was not written where I planned demand Act
  decision-point: choosing what demand Act counts in the PLAN of C108.
  cost: I planned one retro for each Change, so two retros of one Change each passed; the CPO's review of the other DO required a PLAN revision before I could build the DO.
  findable: no
  address: AGENTS.md
- subject: the Branching check fails on the first run of every pull request into a collector, and toggling auto-merge starts one more failing run
  decision-point: each new pull request into a collector, to decide whether a red Branching was mine.
  cost: for each of about a dozen pull requests I opened a failing log or recognised the failure from memory, toggled auto-merge, and read the extra red run that the toggle itself produced.
  findable: no
  address: script

## Longed For
- subject: a way to ask for the next free ids of a capability across all open heads
  worked-anyway: I listed the ids on every remote head with a script and stated the risk of a clash in the PLAN; nothing was blocked and no id clashed.

Decisions: none made, the owner decides.
