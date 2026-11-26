# C157 change

## PLAN

1. Record the intent I29 and the design questions below. Nothing else: no Requirement, no Case, no script, no record change.
2. The Requirement and the Cases follow in a revision of this PLAN, as the decisions below say what the ratchet is made of.

## The shape (Kai's framing)

verify Adapter (controls/CTL1, C142) is a detective control whose finding is `unadapted:<id>`, a control confirmed not to run through the adapter. Made preventive as a ratchet (controls/C23, C24, C25):

1. the findings over release's complete delivered-controls map at the base are the baseline;
2. a finding not in the baseline is new and fails, so no new bypass enters;
3. the baseline never grows and only shrinks, one history line for each reduction (judged by `judgeProgress`, the first line by `judgeAdoption`, the step told by `judgeRatchetStep`, controls/C155);
4. when it is empty the strategy ends and the control is plain preventive, the end state of the forced library.

A rejection at declaration is then mostly redundant: the delivered controls are what the ratchet judges.

## Decided (CTO call, taking the recommendations)

1. **Only confirmed bypasses are baselined.** The finding is `unadapted:<id>` only when `adapted: false` is confirmed (controls/F206). A control whose integration is unrecognized or unobserved is UNKNOWN, which blocks in preventive and is never baselined. Today the real delivery map is UNKNOWN for all but one demonstration file. So the control stays detective, evidence is collected on each delivered control (an integration, or a confirmed bypass), and the baseline is adopted only from confirmed findings, so that no control is UNKNOWN when preventive starts.
2. **The map must be complete.** Verify Delivery (controls/CTL2) judges the map complete before verify Adapter's verdict counts; an incomplete map is UNKNOWN, never a pass, so a control cannot hide by being absent.
3. **Who holds what.** Controls owns the judgement and the record declaration (`strategy: ratchet`, `baseline-source`, `owner`, `exit`). Release owns the map, the baseline file and its history beside it, the workflow and the flag, and adopts the baseline in its own Change. The Owner's go makes the check required.
4. **Adoption.** The first baseline is established from the base revision's own files and judged by `judgeAdoption`; absent is not empty (controls/F211). The adopter establishes absence, as for CTL20 and CTL36 (release/C134).
5. **No rejection at declaration.** It is not built, as it is redundant with the ratchet. An early report at declaration may stay as advice.
6. **Name stability.** `unadapted:<id>` is stable for a control across runs and is what is baselined, never a path.

None of these changes the product scope. Blocking, the adoption and every WIRE stay on the Owner's go.

## Not here

Release's map completeness, baseline file, workflow, flag and report are release's separate PLAN. No WIRE, enforcement or ruleset is authorized by this Change.
