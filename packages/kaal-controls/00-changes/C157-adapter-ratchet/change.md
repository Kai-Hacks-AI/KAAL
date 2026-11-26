# C157 change

## PLAN

1. Record the intent I29, the Requirement F215, the architecture A212 and the Case T1556 (plain `.test.mjs`, never renamed). The Case is RED on the collector, because `scripts/adapter-ratchet.mjs` is absent, and was run GREEN against a throwaway implementation that is not committed.
2. No script, Skill word, record or workflow changes in the PLAN, and the decisions below say what the ratchet is made of.

## The shape (Kai's framing)

verify Adapter (controls/CTL1, C142) is a detective control whose finding is `unadapted:<id>`, a control confirmed not to run through the adapter. Made preventive as a ratchet (controls/C23, C24, C25):

1. the findings over release's complete delivered-controls map at the base are the baseline;
2. a finding not in the baseline is new and fails, so no new bypass enters;
3. the baseline never grows and only shrinks, one history line for each reduction (judged by `judgeProgress`, the first line by `judgeAdoption`, the step told by `judgeRatchetStep`, controls/C155);
4. when it is empty the strategy ends and the control is plain preventive, the end state of the forced library.

A rejection at declaration is then mostly redundant: the delivered controls are what the ratchet judges.

## DO

Not authorized by this PLAN. On its merge into the collector, and with the collector synced with main:

1. `scripts/adapter-ratchet.mjs` with `runAdapterRatchet`, composing `findUnadapted`, the usable-inventory rule of F207 and `runControl` in ratchet mode.
2. One sentence in the reference that owns the evidence contracts, saying the delivered map is a complete inventory and unknown is never an allowance (the Skill structure is the restructure's).
3. Case T1556 GREEN; the package suite GREEN, with the new Case counted. Mutation patches as in C25 and C155 for each weakening.

No change of the control record of verify Adapter (controls/CTL1) belongs here: its strategy, baseline and type change in the Change that adopts the baseline, on the Owner's go.

## ACT

A retro entry in the collector.

## Decided (CTO call, taking the recommendations)

1. **Only confirmed bypasses are baselined.** The finding is `unadapted:<id>` only when `adapted: false` is confirmed (controls/F206). A control whose integration is unrecognized or unobserved is UNKNOWN, which blocks in preventive and is never baselined. Today the real delivery map is UNKNOWN for all but one demonstration file. So the control stays detective, evidence is collected on each delivered control (an integration, or a confirmed bypass), and the baseline is adopted only from confirmed findings, so that no control is UNKNOWN when preventive starts.
2. **The map must be complete.** Verify Delivery (controls/CTL2) judges the map complete before verify Adapter's verdict counts; an incomplete map is UNKNOWN, never a pass, so a control cannot hide by being absent.
3. **Who holds what.** Controls owns the judgement and the record declaration (`strategy: ratchet`, `baseline-source`, `owner`, `exit`). Release owns the map, the baseline file and its history beside it, the workflow and the flag, and adopts the baseline in its own Change. The Owner's go makes the check required.
4. **Adoption.** The first baseline is established from the base revision's own files and judged by `judgeAdoption`; absent is not empty (controls/F211). The adopter establishes absence, as for CTL20 and CTL36 (release/C134).
5. **No rejection at declaration.** It is not built, as it is redundant with the ratchet. An early report at declaration may stay as advice.
6. **Name stability.** `unadapted:<id>` is stable for a control across runs and is what is baselined, never a path.

None of these changes the product scope. Blocking, the adoption and every WIRE stay on the Owner's go.

## Not here

Release's map completeness, baseline file, workflow, flag and report are release's separate PLAN. No DO, baseline adoption, WIRE or enforcement is authorized by this PLAN. No WIRE, enforcement or ruleset is authorized by this Change.
