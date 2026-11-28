# release/C201 DO

The adoption of the flag, once, for checks 1, 2 and 4. No workflow is installed by it: the three plain sources change and the installed ones stay until each check's swap WIRE, on the Owner's separate go.

- `lib/stations.mjs`: `stationOf({ baseRef, defaultBranch })`, the one mapping of a target to a station. A target at no station gives none.
- `lib/entry-flag.mjs`: `fromEnv({ id, env, baseRef })` takes the supplied `KAAL_STATION`, else the station of the target, and answers UNKNOWN (exit 2) with no flag read when the target has none. The answer carries its station. The three entry libraries (`promotion-source/lib/run.mjs`, `change-isolation/lib/report.mjs`, `lineage/lib/answer.mjs`) pass their target and take the exit for that station.
- The three plain sources: each of the seven entry jobs supplies `KAAL_FLAGS` (the instance's flags.json) and `KAAL_CONTROL_RECORD` (the record of its own control), read from the checked-out default branch. Nothing else of a source changes.
- `lib/adoption-ready.mjs`: the readiness of a swap, read from the base's files. For each adopting control and each of the four stations a target can have, the record declares `preventive` and the flag is `on`; any gap is named and the exit is 1. It changes nothing. `node adoption-ready.mjs --root <dir> [--workflows <file,...>]`; for one check, name its workflow.

T1790 to T1798 are green, and were red before the change. All 452 release Cases are green. The 28 failures of the wider `engineering` run are the same without this change (packages not installed in the clone).

Not here: flags.json (controls), the record declarations and the flip (release and controls, each on the Owner's go), any WIRE or swap. Run on the real files today, adoption-ready says not ready.
