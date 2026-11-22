---
id: engineering/RT3
format: 4L
reflects: [engineering/C29]
---
Account of: I am the Engineering worker. I planned, built and raised the PLAN (#2229) and the DO (#2236) of C29 (a home for workflow sources in `13-source/workflows`), I answered the Owner's questions about where the sources sit today, and I changed the PLAN once after the CPO's review. This is my account only: I have not asked the Owner or the CPO what they lacked. RT2 is the retro of the research-home collector; this one takes RT3 so the two do not clash when both reach main.

## Liked
- subject: the CPO's review changing the PLAN before approval
  keeps: the per-workflow ratchet and the in-place DO edit came out of one comment, were in the PLAN within the hour, and the DO then had nothing left to argue.
- subject: reading the source and the installed set from `main` before answering
  keeps: the Owner's "where are those sitting" was answered with paths and a count, and the count shaped the PLAN (6 sourced, 15 not).

## Learned
- subject: the WIRE judge already requires an installed target to equal a source on main, so a source home adds a place and no new install rule
  searched: `release-management/05-src/wiring/wire-judge.mjs` and `.githooks` C26 on main; read in full.
- subject: Engineering's Skill may hold only the one layout check, so a control over workflows cannot be hosted by Engineering
  searched: N19 and T1177 on the collector; the first draft of the judge broke T1227 in a throwaway copy before I moved the control to release.

## Lacked
- subject: a count I could trust the first time
  decision-point: answering the Owner's "which workflows have no source".
  cost: I reported 16 without a source and 5 with one; the right numbers are 15 and 6, because I matched names by eye and miscounted. I corrected it in the next message, before the PLAN was written.
  findable: yes
  address: script
- subject: a checked source for the head SHA of a handover
  decision-point: writing the CPO line for #2229.
  cost: I typed the full SHA from the short one and got it wrong; I corrected the message by an edit. The CPO reads only inline text, so a wrong SHA could have sent a review to the wrong head.
  findable: no
  address: script
- subject: nothing says who owns a workflow
  decision-point: assigning owners to the 15 workflows with no source.
  cost: I read each header and where its checker lives, and marked every owner a proposal; the CPO asked that each be validated again before its own move.
  findable: no
  address: Skill
- subject: nothing says that a DO may not move a draft over a template changed by another collector
  decision-point: the CPO's note that the C28 layout must stay intact.
  cost: my draft was the template as of `main`, so moving it would have removed C28's four folders; I changed the DO to an in-place edit.
  findable: no
  address: Skill

## Longed For
- subject: the ratchet control and the first move of a workflow source
  worked-anyway: the home exists and the PLAN names the order, so nothing is blocked; no workflow is counted as sourced until a move shows it equal.

Decisions: none made, the owner decides.
