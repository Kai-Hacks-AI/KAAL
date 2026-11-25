# C141 change

## PLAN

1. Add the intent I19, the gap G107, the Requirements F203 and F204, the architecture A202 and the Cases T1509 to T1513 (plain `.test.mjs`, never renamed). All are RED on the collector.
2. No script, Skill word or workflow changes in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector, and with the collector synced with main:

1. `scripts/adapter.mjs` with `runControl`, `deriveStatus` and `judgeRegistration`, pure, on top of `judge-mode.mjs`, `ratchet.mjs` and `evidence.mjs`.
2. A short `references/adapter.md` in setup-agnostic words, placed as the Core Skill standard (core/C52) says; the Skill structure is the restructure's, not this Change's.
3. Cases T1509 to T1513 GREEN; the package suite GREEN.

## ACT

A retro entry in the collector.

## Left open (for the CPO, with a recommendation)

- Where the record lives. Recommendation: `records.jsonl` beside the control, written by the Change that claims the status. The alternative, the reports of CI runs as artifacts or check runs, is not a file and no judge reads it.
- How `running` is proven. Recommendation: a record of a real-kind X with a verdict other than `UNKNOWN`. Whether the run exists is release's check, by the run id and revision, outside the pure judge.
- How "runs through the adapter" is known. Recommendation: the adopter lists the controls it runs through the adapter, for instance from the workflows that call it, and passes the list in. The judge does not read workflows.
- The first step on adoption. Recommendation: the registration check runs as a ratchet over the controls that exist today, so only a new unregistered control is new; release migrates the five Act controls and the rest one by one and the baseline shrinks with its history.
- Whether the status becomes derived and not declared at all, once records are everywhere. Recommendation: not now. The claim stays declared, as the Skill teaches that a claim is not its own proof, and the derived status is only compared with it.
- Ids C141, I19, G107, F203, F204, A202, T1509 to T1513 are taken by hand; on a clash the newer pull request renumbers.
