# C144 change

## PLAN

1. Add the intent I22, the gap G110, the Requirement F208, the architecture A205, the control declaration CTL3 and the Case T1519 (plain `.test.mjs`, never renamed). The Case is RED on the collector.
2. No script, Skill word or workflow changes in the PLAN.

## DO

Not authorized by this PLAN, and not before the DO of controls/C141 is on this collector. Then `scripts/verify-record.mjs`, the Case GREEN, the package suite GREEN.

## ACT

A retro entry in the collector.

## Left open (for the CPO, with a recommendation)

- The station and the flag are release's. Recommendation: wire after the DO, detective first.
- The `evidence` minimum is `[fixture:2, real:1, provoked:1:fail]`. Recommendation: accept it as the protocol's minimum.
- Ids C144, I22, G110, F208, A205, CTL3, T1519 are taken by hand; on a clash the newer pull request renumbers.
- Whether the adapter's UNKNOWN answer carries `confirmed` from an `UnknownEvidence` error so the confirmed discrepancies stay in its log. Recommendation: yes, as one line in the C141 library DO and its Case; this Change already keeps them on the error.
