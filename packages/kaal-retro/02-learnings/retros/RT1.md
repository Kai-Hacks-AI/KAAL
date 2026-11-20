---
id: retro/RT1
format: 4L
reflects: [retro/C4, retro/C5]
---
Account of: I am the Retro thread. I wrote the Skill, the finder and the form check (C4) and then its lens text and identity line (C5), and I raised the PLANs, DOs and the SYNC for both. This is my account only: Kai's and the CPO's corrections shaped the lenses, and I have not asked either what they lacked.

## Liked
- subject: the evidence and promotion pattern of an earlier Change in kaal-controls (C15)
  keeps: a ready shape for a PLAN, its RED and GREEN evidence, and its route to main, which I copied instead of inventing; without it each of my PLANs would have had a different shape.
- subject: the merged PLAN as the go for the DO
  keeps: I never had to guess whether to build; a merge and the CPO's approval at an exact head told me, which kept two Changes small and in order.

## Learned
- subject: practitioners separate Lacked from Longed For mostly by tense, and say they overlap
  source: Parabol, Nulab and Miro pages on the 4Ls, found by web search and read as search summaries, so secondhand. Parabol credits the technique to Mary Gorman and Ellen Gottesdiener; Miro says Longed For should not repeat the Lacked list and that the two often come out similar. I found no original publication or date.
- subject: postmortem practice asks where we got lucky, what could have gone wrong and did not
  source: Jacob Kaplan-Moss, "Where did we get lucky?" and the Google SRE workbook chapter on postmortem culture, both known to me only through a colleague's dry-run note, so secondhand and not read by me.

## Lacked
- subject: nothing told me to enable auto-merge as I raised a pull request into a collector
  decision-point: raising my first pull request into a collector.
  cost: the Branching check failed on each of my pull requests the first time it ran, because auto-merge was not yet on; I read its log once and then had to recognise the same red check again on every later one.
  findable: yes
  address: Skill
- subject: nothing said that a SYNC does not restart the checks of a pull request already open into the collector
  decision-point: after the SYNC with the argv hotfix merged, deciding how to get the Windows check to run against it.
  cost: the open PLAN still showed the old failing run and a re-run would have reused the old merge, so I rebased my own branch to force a new run, which may dismiss an approval.
  findable: no
  address: AGENTS.md

## Longed For
- subject: a finder that returns the next free Case id
  worked-anyway: I chose T1250 to T1255 by looking for clashes with a search and flagged the risk in the PLAN; nothing was blocked or slowed.

Decisions: none made, the owner decides.
