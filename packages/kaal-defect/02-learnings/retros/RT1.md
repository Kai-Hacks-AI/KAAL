---
id: defect/RT1
format: 4L
reflects: [defect/C1]
---
Account of: I am the defect thread. I wrote the PLAN of C1, its three PLAN amendments, the DO, the Skill restructure and the Architecture amendment, and this retro of my own collector. This is my account only: I have not asked the CPO, Testing or Core what they lacked.

## Liked
- subject: a Case written and shown RED on the tree before the fix, then green on a throwaway copy that holds the draft
  keeps: each CPO point on discovery (#2517 and #2523) became a Case (T1216, T1217, T1218) that failed without the fix and passed with it, so the review could see every correction bite and not take it on trust.

## Learned
- subject: Hosting reports a missing folder as empty
  source: Hosting's own `list` documentation says a missing directory lists as empty, and `kind` tells missing from a directory; with `links: "skip"` it also leaves out a dangling link, so such a link cannot stand in for a refused read.
- subject: Core's Skill standard counts words in the body only and asks for structure, never trimming
  source: `kaal-core/skill` (`judgeSize`): the frontmatter is not counted, a body over 600 words is hard, and the remedy is a router with references.

## Lacked
- subject: a standing question, asked of every script that reads handed-over locations, of what an unavailable location looks like and whether it can be mistaken for an empty one
  decision-point: writing F1 and T1211, where a missing Defect folder simply listed nothing.
  cost: two CPO review rounds and two PLAN amendments (#2517 and #2523) before the DO could merge.
  findable: yes
  address: AGENTS.md
- subject: the shape of a Skill known before drafting it
  decision-point: drafting `SKILL.md` as one 876-word document in the PLAN draft.
  cost: a second DO (#2548) to restructure it, and a change to how six Cases read the Skill.
  findable: no
  address: Skill

## Longed For
- subject: a signal, before approval, that a DO has fallen behind its collector
  worked-anyway: after #2549 merged, #2548 was behind, and GitHub's branch update fixed it with one more run of checks.
- subject: a stop-hook check that reads the remote ref and not the local tracking ref
  worked-anyway: its unpushed-commit warning was false each time, and `git ls-remote` showed the branch on origin.

Decisions: none made, the owner decides.
