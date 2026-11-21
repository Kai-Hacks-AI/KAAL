---
id: engineering/RT2
format: 4L
reflects: [engineering/C28]
---
Account of: I am the Engineering worker. I planned, built and raised the PLAN (#2218) and the DO (#2225) of C28 (research, rehearsals and reviews get their places in `02-learnings`), and I answered the Owner's successive corrections of where research sits. This is my account only: I have not asked the Owner or the CPO what they lacked. It is also the first collector closed on the retro contract, so it names where that was smooth and where it was not.

## Liked
- subject: a draft template beside RED Cases, shown before anything was built
  keeps: the Owner could move research, trials, rehearsals and reviews around four times in one conversation at the cost of editing one draft and four Cases, and the DO then only moved a file.
- subject: the layout check reading the template
  keeps: four new folders needed one edit of the template and one Case (T1245) and no new rule in the check.

## Learned
- subject: placing a new kind of note is mostly deciding its owner and its name, not its folder
  searched: the Owner's corrections in this thread (inbound research versus our own ideas, then the R names, then rehearsal as part of research); I did not read outside sources.
- subject: a PLAN that asks the Owner a question gets the answer into the same PLAN, so the DO has nothing left to ask
  searched: the history of #2218 and #2225; one DO review round, one correction (the `tests` line of two Cases).

## Lacked
- subject: a way to claim a free Case id
  decision-point: numbering the C28 Cases while release's Dispatcher DO was open.
  cost: I had T1324 to T1327 and found T1324 to T1330 taken only when release's PLAN merged; I renumbered to T1331 to T1334 before merging. The same gap as RT1, so its address was not done.
  findable: no
  address: script
- subject: nothing checks that a Case's `tests` names a Requirement of its own folder
  decision-point: writing T1333 and T1334 by copying T1332.
  cost: both said `tests: engineering/F59` instead of F60 and F61; the CPO caught it at review and I amended it in the DO.
  findable: no
  address: script
- subject: nothing said that a first-run Branching failure recurs on every new pull request
  decision-point: reading a red Branching check on #2159, #2167 and #2218.
  cost: three pull requests needed the auto-merge toggle and a look at later runs; #2225 passed untouched. RT1 named it and it is still not in the Skill.
  findable: no
  address: Skill
- subject: nothing said that a head carrying main commits is refused and a SYNC is a separate pull request
  decision-point: raising the C26/C27 ACT (#2159) on a head built from main.
  cost: Branching refused it, I rebuilt the head off the collector tip with one commit and raised SYNC #2167; the rule is in `branching.md` and I read it only after the refusal.
  findable: yes
  address: Skill
- subject: a full local run of the Cases
  decision-point: confirming the DO before pushing.
  cost: T1228 is RED on my machine and on the collector (it needs Hosting), so I compared against the collector instead of reading one green line.
  findable: no
  address: script

## Longed For
- subject: kaal-research and kaal-review existing, so that the folders hold a note and a rule for what verifies it
  worked-anyway: the placement stands without them; the layout names no verifier for the three new folders, as for `retros`, and nothing is blocked.

Decisions: none made, the owner decides.
