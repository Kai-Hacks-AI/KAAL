# release/C175: the entry helper names the stations of the repository when it reads a control record

## Reason
Controls C161 makes the stations the adopter's input: the library no longer knows which stations exist, so `findControls(files)` with no stations treats no station as valid and reads every record as UNKNOWN. The entry helper of release/C167 (`05-src/lib/entry-flag.mjs`) calls `findControls(files)` with no stations, so once C161 is on main the record of every adopting entry reads UNKNOWN and release/T1630 to T1633 fail (reproduced on the controls C161 sync #2998). Engineering turns red on main for any promotion that carries C161.

## The contract
1. **The adopter names its stations.** The entry helper passes the stations of this repository to the finder as `findControls(files, { stations })`. The old finder ignores the second argument, so the change is safe before C161 lands and required after it.
2. **One list.** The list is one exported constant of the helper, `STATIONS`: Developing, Collecting, Integrating, Hotfixing, Wiring, Promoting, Publishing. Every stage the repository declares (the stage declaration `05-src/stages/stages.json` and the `verify Stages (<Stage>)` names of the ruleset sources) is in it, so a stage added without the list is seen by a Case, not by an incident. Engineering is asked to own the single list later; until then it lives here and is derived by no one.
3. **Nothing else changes.** No mode, flag or exit logic changes, and the declared mode is still read from the record.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1690: every stage of `stages.json` and every `verify Stages (<Stage>)` of the ruleset sources is in `STATIONS`, and `STATIONS` holds no name that is neither.
- T1691: `resolveEntry` passes `{ stations: STATIONS }` to the finder (a finder double records its second argument and a record at each station of the list is read, not UNKNOWN).
All red until the DO. T1630 to T1634 of release/C167 stay green with the old finder and with a finder that requires stations.

## DO
`STATIONS` and the second argument of the call, with the Cases. Source only.

## Not in this Change
No WIRE, flag, ruleset or change of what the controls library judges.

## Design: split and overlap
Split: none. Overlap: controls C161 (the library side); this Change is what C161 needs from Release before it can land.
