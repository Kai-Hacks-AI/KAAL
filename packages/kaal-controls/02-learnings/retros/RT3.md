---
id: controls/RT3
format: 4L
reflects: [controls/C24]
---
Account of: I am the controls thread. I wrote the PLAN and the DO of C24 (one ratchet library and a mandatory baseline file the finder checks) and this retro of my own collector. This is my account only: I have not asked the CPO, Testing or release what they lacked.

## Liked
- subject: the CPO's sequence, release adopts its baseline file before the stricter finder is promoted
  keeps: the promotion gate stayed explicit through every review, so the DO could merge into its collector while the finder's effect on a real control (release/CTL20) waited for release's own Change. Nobody had to guess what the stricter finder would do on main.

## Learned
- subject: moving code into a sibling file changes every place that copies the old file alone
  source: the DO's local suite was 63 pass and the checks on #2404 were red twice. `judge-mode.mjs` now imports `ratchet.mjs`, and release's Cases T1126 and T1134 build a tiny repository holding `judge-mode.mjs` alone, so the judge exited 2 there. The fix was one line in each fixture, recorded in `change.md` of C24.
- subject: a SYNC lands by merge commit, never by squash
  source: Branching refused the squash auto-merge I enabled on the SYNC of main into the collector (#2421); I turned auto-merge off and on again with a merge commit.

## Lacked
- subject: a list of everything that reads or copies a shared script, before I move code out of it
  decision-point: writing the C24 PLAN, where I stated that `judge-mode.mjs` behaviour was unchanged.
  cost: two pushes, one CPO re-approval and a day of a red check on a DO that was otherwise right.
  findable: yes
  address: AGENTS.md

## Longed For
- subject: the package suite also running the repository's Cases that import the package's scripts
  worked-anyway: after the first red run I read the failing Cases and ran the engineering Cases locally against main to separate what my change broke from what my checkout lacked.

Decisions: none made, the owner decides.
