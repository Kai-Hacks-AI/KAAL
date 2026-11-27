# C159 do

Builds the source of the check 4 replacement on the controls adapter. The installed workflows are unchanged: the source waits for its own WIRE on the Owner's go. Nothing is required, no flag is set and no ruleset is touched.

## What was built

- `05-src/promotion-source/judge-origin.mjs` (release/CTL40) runs `promotionOrigin` of `engineering/github/lineage.ts` (exported by engineering/C41) through `runControl` in detective mode. `judge-head-evidence.mjs` (release/CTL41) judges a head the origin admits with `promotionSource`, reading the rules and the check runs of the head with `gh`; it waits for a required check still running, as the old script did.
- `05-src/promotion-source/lib/run.mjs`: the facts of the job, the reads and the command line they share. It judges nothing. The answer of an entry, `checking` and `report`, is the one of `05-src/lineage/lib/answer.mjs` (release/C158).
- `05-src/wiring/workflows/promotion-source-plain.yml`: two jobs on plain `pull_request`, `checks: read` only in the head evidence job; `kaal-guard` is not used.
- `04-controls/CTL40-verify-promotion-origin`, `CTL41-verify-promotion-head-evidence`: the control records, each with Intent release/I50.
- Cases T1579, T1580, T1585 and T1586 are renamed from `.red.mjs` to `.test.mjs`. T1599 is new.

## Departures from the PLAN, recorded

1. **The two job names are quoted** (they hold `: `), and T1579 follows with the same names and the same uniqueness among other workflows as T1577 and T1581.
2. **`notGreen` is not imported.** `promotionSource` already judges a head the origin admits; the entry reuses it so the messages stay the checker's. Only `promotionOrigin` is new from engineering/C41.
3. **Absent check evidence is UNKNOWN**, as the PLAN says; the old workflow script ended in "cannot judge" too. T1586 pins it.
4. **T1599 (new): a verdict that does not apply writes no record**, from the CPO's hold on release/C158. It also pins that a head the origin refuses is the origin entry's, not the head evidence's.
5. **No delivery map row is written.** The rows come with the WIRE.

## Repair

The record of a verdict names the head judged, never the merge commit of the run (the defect release/D20, repaired for check 1 by release/C165 and for check 2 by release/C158). `lib/run.mjs` takes the boundary's `sha` from `KAAL_HEAD_SHA`, and the origin job now supplies it too. Without a head or a run id there is no boundary. Case T1608 pins it.
