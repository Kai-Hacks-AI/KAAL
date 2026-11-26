# C156 change

## PLAN

1. Add the intent I28, the gap G115, the Requirement F214, the architecture A211 and the Case T1555 (plain `.test.mjs`, never renamed). The Case is RED on the collector, because `scripts/judge-wired.mjs` is absent, and was run GREEN against a throwaway implementation that is not committed.
2. No script, Skill word or workflow changes in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector, and with the collector synced with main:

1. `scripts/judge-wired.mjs` with `judgeWired`, pure.
2. One sentence in `references/modes.md` or the reference that owns the evidence contracts, saying the report is not a finding (the Skill structure is the restructure's).
3. Case T1555 GREEN; the package suite GREEN, with the new Case counted. Mutation patches as in C25 and C155 for each weakening.

## ACT

A retro entry in the collector.

## Linked work (release's, separate PLAN)

Release owns the runner and the report: discovering what is installed in the delivery on main (its delivery map and the byte-equal WIRE check), passing the inventories and the proof of running to this judge through the control adapter (controls/F203), and showing the report, including the controls that wait for a WIRE request. That PLAN links to controls/F214 by id. No workflow, flag, required check or ruleset is part of this Change, and this PLAN authorizes no WIRE.

## Decided here (for the CPO review)

- Three statuses and UNKNOWN, as the CTO asked: `wired`, `code-only`, `wired-unproven`, and UNKNOWN as the throw that the adapter turns into UNKNOWN for the whole report.
- It is a report, not a finding: `code-only` waits for the Owner's go and is not nonconformance, so nothing here can be baselined or blocks.
- **Design decision (CTO):** running proven for a control that is not observed installed makes the judge throw, so the whole report is UNKNOWN. An incomplete installed inventory is the likely cause, and a wrong status is worse than UNKNOWN. T1555 pins it.
- The four DIRT facts stay independent. This judge reads two of them (installed and running) as given and never infers one from the other; it refuses evidence that contradicts itself instead (running proven for a control not observed installed).
- The inventories take the shape of controls/F207, so one discovery can serve both judges.

## Left open (for the CPO, with a recommendation)

- Whether the declared list is all declared controls or only the implemented ones. Recommendation: the adopter chooses and says so, since implemented is verify Record's fact.
- Ids C156, I28, G115, F214, A211 and T1555 are taken by hand; on a clash the newer change renumbers.
