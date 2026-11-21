---
id: release/RT2
format: 4L
reflects: [release/C110]
---
Account of: I am the release thread. I planned and built limit Act (C110), the first row of the write map, and answered the CPO's reviews and the Owner's corrections on its design as they reached me through the coordinator. This is my account only: the CPO and the Owner have not been asked what they lacked, and I wrote the retro of my own collector.

## Liked
- subject: the write map kept as data beside a pure judge
  keeps: the Owner's rule that it must work when folders move became a Case with four placements of the capability, so the claim is observed instead of argued; without the map as data the judge would carry the folder names in code.
- subject: a judge that imports nothing from the other controls of the ACT
  keeps: its DO could start while the DO of hold Act had not reached main, so the Owner's question whether they were independent could be answered by reading the imports.

## Learned
- subject: path ownership elsewhere reads a single star as one level and takes the last matching rule
  source: GitHub Docs on code owners, found by a web search and read as search summaries, so secondhand. They say a pattern like `docs/*` matches files directly inside `docs/` and not nested ones, that a leading slash anchors a pattern to the repository root, and that the last matching pattern takes precedence; the pages I saw name no case of one rule scoping a whole class of change, such as an ACT.

## Lacked
- subject: nothing told me that the real layout has two capability trees and older act.md files before I planned the map
  decision-point: writing the first row of the write map for an ACT.
  cost: I listed only the retros folder of one tree; the CPO asked me to reconcile it with the packages and the older ACTs, and I redid the map and its Cases before the PLAN could be approved.
  findable: yes
  address: AGENTS.md
- subject: nothing said that a folder name must not be written into the judge or the map as an absolute pattern
  decision-point: choosing how the map names the folders of an ACT.
  cost: I wrote patterns that spelled out `engineering/*` and `packages/*`; the Owner had to ask whether I was hardwiring locations, and I rebuilt the map as entries relative to a capability root with the roots handed in as a third fact.
  findable: no
  address: AGENTS.md

## Longed For
- subject: a finder that returns the capability roots of a tree
  worked-anyway: the roots are handed in as a fact and the judge never looks for them; the CPO named root discovery a separate follow-up, and nothing was blocked or slowed.

Decisions: none made, the owner decides.
