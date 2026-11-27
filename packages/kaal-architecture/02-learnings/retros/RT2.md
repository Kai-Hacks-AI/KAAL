---
id: architecture/RT2
format: 4L
reflects: [architecture/C18]
---
Account of: I am the coding agent of the Architecture thread. I drafted the architecture/C18 PLAN (#2484), reworked it once after the CPO review, and wrote its DO (#2509); the CPO steered the scope and the Owner decides, and this is my own account.

## Liked
- subject: moving the old Skill sections into references mostly verbatim, with a mapping in do.md
  keeps: the reviewer could check that no rule was lost by reading one table, and the Test Cases that read the Skill needed only one helper, `skillText()`, to keep their meaning.
- subject: guarding eleven rule families by concept in T32, not by sentence
  keeps: the Skill can be reworded later without freezing its prose, while a dropped rule still turns the Case red.

## Learned
- subject: no outside source was consulted
  searched: I did not search outside this repository for how other practice splits a router from its references, so I claim no outside knowledge here.

## Lacked
- subject: knowing that Core's repo-wide Node scan reads every `.md` that starts with `name:` frontmatter
  decision-point: keeping the old SKILL.md as the trial's frozen copy under `00-changes/C1-classification/trial/`.
  cost: the Workspaces check failed on the DO with a null-iteration error in a Core Case that does not name the file, one log reading to find the cause, and one extra commit renaming the copy to `.txt`.
  findable: yes
  address: script
- subject: the trial Cases T1, T9 and T11 asserting the prompts hold the Skill as shipped
  decision-point: writing the C18 PLAN, which did not list these Cases as affected.
  cost: three Cases broke after the restructure and the PLAN had to be supplemented in the DO, flagged to the reviewer as the one change outside the Skill and its Cases.
  findable: yes
  address: Skill

## Longed For
None raised.

Decisions: none made, the owner decides.
