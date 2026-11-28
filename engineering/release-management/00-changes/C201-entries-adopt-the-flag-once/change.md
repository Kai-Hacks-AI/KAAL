# release/C201: the entries of the replaced checks adopt the flag the same way, once

## Reason
Release/C167 gave every entry of a replaced check the helper that reads its declared mode and its flag (`fromEnv`, `lib/entry-flag.mjs`). The helper engages only when the job supplies `KAAL_FLAGS`, `KAAL_STATION` and `KAAL_CONTROL_RECORD`, and no workflow does. So every plain entry runs detective, where a violation is REPORT with exit 0. The aggregator that takes the required name (C168, C170) would then pass on a violation, and the swap of a check would weaken it. Each swap needs its entries to run under the flag. Four checks need this. This Change designs the adoption once, so the swaps of checks 4, 2 and 1 each reuse it and none repeats it.

## The contract
- **One station mapping, beside the list of stations.** `lib/stations.mjs` (release/C175) gains `stationOf({ baseRef, defaultBranch })`: the target is the default branch, `Promoting`; `kaal/**`, `Collecting`; `hotfix/**`, `Hotfixing`; `wire/**`, `Wiring`; anything else has no station. Every answer is a member of `STATIONS`. The mapping is the one release/C167 already states in words; it is written once, as code.
- **The job supplies two files, never the station.** An adopting entry job supplies `KAAL_FLAGS` (the path of the instance's `flags.json`) and `KAAL_CONTROL_RECORD` (the path of its control's record), both files of the default branch the job has checked out as the trusted judge. It supplies no mode, no flag value and no station. A check serves several targets, so a station written into a workflow would be wrong for some of them. When `KAAL_STATION` is supplied it is still used (the C167 Cases stay as they are); when it is not, the helper takes the station of the target (`--base-ref` and `KAAL_DEFAULT`, which every entry job already supplies).
- **A target with no station is not judged.** An engaged entry whose target has no station stops, prints that the target is at no station, reads no flag and exits 0. No gate exists there, and the legacy check is not applicable there either.
- **The adoption is one shape for every check.** Each plain workflow source of checks 1, 2 and 4 (`change-isolation-plain.yml`, `branching-plain.yml`, `promotion-source-plain.yml`) has, on each entry job, the same two lines and nothing else new. Check 3 is admission, not a control, and has no flag. Nothing else of a source changes: names, triggers, permissions, aggregators, `needs`.
- **Nothing is engaged by this Change.** The installed workflows are not changed. A source is installed only by its WIRE, on the Owner's separate go, per check. The old and the plain workflow of a check land together in that WIRE, because the plain source already holds the aggregator that takes the required name (C168), and two jobs of one name must not report. So the adoption of a check is part of its swap, and its flags and declarations are in place before it.
- **The values are not here.** The instance's `flags.json` (controls, a reviewed change on the Owner's go) holds an entry for each adopting control at each station it is judged at; Release's records declare the mode at the flip (`stations: [<Station>:<mode>]`, release/C167). This Change writes neither. It names what they must hold, and T1794 reads them.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1790: `stationOf` returns `Promoting` for the default branch, `Collecting` for `kaal/**`, `Hotfixing` for `hotfix/**`, `Wiring` for `wire/**`, and nothing for any other target; each answer is in `STATIONS`; an empty or missing target or default gives nothing.
- T1791: an engaged entry with no `KAAL_STATION` resolves the flag at the station of its target; a supplied `KAAL_STATION` wins and gives the answer it gives today.
- T1792: an engaged entry whose target has no station reads no flag, prints that the target is at no station, and exits 0.
- T1793: in each of the three plain workflow sources every entry job supplies `KAAL_FLAGS` and `KAAL_CONTROL_RECORD` with the paths of the instance file and of that job's control record, and no job supplies `KAAL_STATION`, a mode or a flag value; each record path names the control the job runs; nothing else of the sources differs from main (names, triggers, permissions, `needs`, expected lists).
- T1794: for each adopting control and each station its check is judged at, the instance's `flags.json` and the control's record, as they stand on the base, pass `resolveEntry` without a CONFIG_FAILED; the instance file not being there, or lacking one entry, is red.
All red until the DO. The DO's Cases T1790 to T1793 are green on this Change alone; T1794 needs the instance's `flags.json` on main first (a Controls change), so the DO is cut after it.

## DO
`stationOf` in `lib/stations.mjs`; `fromEnv` takes the station of the target when none is supplied, and stops without a flag when the target has none; the two lines on each entry job of the three plain sources; the Cases. It needs release/C175 (the list of stations) on main first.

## After it
ACT, PROMOTION. Then, per check and each on the Owner's separate go, in this order: the check's entries in `flags.json` (`advisory`, inert until its WIRE) and its record declarations at the flip, the flip of the values to `on`, and the swap WIRE (the plain and the old workflow of the check, byte-equal copies, together). The soak is five preventive runs on distinct revisions after the swap.

## Not in this Change
No WIRE, flag entry, record declaration, ruleset change, flip or swap. No change to any judgment, entry result, trigger, name or aggregator. No change to check 3.

## Design: split and overlap
Split: none. The mapping is one function beside the list it belongs to, the helper has one new default, and the sources get one shape; splitting by check would repeat all three. It overlaps C175 (the same file `lib/stations.mjs`, which must be on main first) and C167 (the helper, already on main) and touches the three sources that C168 and C170 changed, both on main.
