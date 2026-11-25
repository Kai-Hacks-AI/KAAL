# C141 change

## PLAN

1. Add the intent I19, the gap G107, the Requirements F203 and F204, the architecture A202 and the Cases T1509 to T1511 (plain `.test.mjs`, never renamed). All are RED on the collector.
2. No script, Skill word or workflow changes in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector, and with the collector synced with main:

1. `scripts/adapter.mjs` with `runControl` and `deriveStatus`, pure, on top of `judge-mode.mjs`, `ratchet.mjs` and `evidence.mjs`.
2. A short `references/adapter.md` in setup-agnostic words, placed as the Core Skill standard (core/C52) says.
3. Cases T1509 to T1511 GREEN; the package suite GREEN.

## ACT

A retro entry in the collector.

## Left open (for the CPO, with a recommendation)

- Where the record lives. Recommendation: `records.jsonl` beside the control, written by the Change that claims the status. CI run artifacts are not files and no judge reads them.
- How `running` is proven. Recommendation: a record of a real-kind X with a verdict other than `UNKNOWN`. Whether the run exists is release's check, by run id and revision, outside the pure library.
- Whether the status ever becomes derived and not declared. Recommendation: not now; the claim stays declared and the derived status is only compared with it.
- Order: C142 to C146 depend on this DO. Recommendation: each PLAN may merge now, and each DO waits for this one.
- Ids C141 to C146, I19 to I24, G107 to G112, F203 to F210, A202 to A207, CTL1 to CTL5 and T1509 to T1521 are taken by hand; on a clash the newer pull request renumbers.
