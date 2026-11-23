---
id: release/RT5
format: 4L
reflects: [release/C111]
---
Account of: I am the release thread. I planned verify Act (C111) and, after the library and the answer module reached main, synchronised its collector and built the DO. This is my account only: the CPO and the Owner have not been asked what they lacked, and I wrote the retro of my own collector.

## Liked
- subject: building the judge on the shared library and the answer module
  keeps: the DO is the judge, three small elements and one control, because `changeIdOf`, `walk` and `lib/result.mjs` were already there; the judge imports no other judge, and the flag `applies` came with the verdicts at no cost to any message or exit code.
- subject: a Case for each outcome of the judge, with the flag asserted where the judge decides it
  keeps: a mutation that said "applies" on every PASS was caught by a named assertion, not by reading source text.

## Learned
- subject: when Cases compare a file with the draft in `interface.md`, a DO that must differ from the PLAN has to amend the drafts and say so in `do.md`
  source: the PLAN of this Change was written before the answer module existed; the DO needed the flag, and T1305 to T1307 pin each file to its draft. I read both and changed them together, so nothing was inferred.

## Lacked
- subject: nothing said who amends a draft when a later Change changes what an earlier PLAN's files should be
  decision-point: starting the DO after the SYNC, with a PLAN that did not know the flag.
  cost: I chose to amend the drafts inside the DO and note it, instead of a PLAN of its own, and spent a reading of the write map and of release/C113's text to be sure the choice was allowed.
  findable: no
  address: Skill
- subject: the first run of the Branching check fails on every pull request into a collector
  decision-point: the SYNC and the DO pull request, each after its first failing run.
  cost: two toggles of auto-merge on each pull request, four calls and a wait for the later run to pass.
  findable: yes
  address: AGENTS.md

## Longed For
- subject: the Branching check that passes on the first run of a pull request into a collector
  worked-anyway: toggling auto-merge did it each time; nothing was blocked, only done by hand.

Decisions: none made, the owner decides.
