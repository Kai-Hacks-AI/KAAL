# release/C162: collect the Implemented and Running facts of the controls on main

## Reason
Kai (26 Nov): "How do we know status of a control without that?" A control's record declares four facts, Defined, Implemented, Running and Tested (CPO: four independent facts, each with its own proof, missing proof is UNKNOWN). Controls' verify Record (controls/F208) compares each claim with its fact, but nothing supplies the facts for the controls on main. Controls' adapter can show one: Running, through `executed` (controls/F203), over the run records a control leaves and the runs the adopter establishes independently. Release owns the runs of its workflows and the delivery map, so Release collects. This Change is the PLAN of the collector. It is detective and report only: it writes a report, gates nothing, adds no workflow and no WIRE.

## The contract
A pure entry `05-src/evidence/collect-dirt-facts.mjs` exporting `collect(facts)`. Its facts are data, supplied by the caller: the controls on main with their claims, the delivery map and the delivered entries on main at one revision, the workflow runs of `main` at that revision with the control records each run printed (the `{control, x, run, sha, verdict, by}` record of controls/F203, with whatever the controls runs add, see Open), and the list of runs the caller has established independently (the run exists, on that revision, of that workflow). It reads no file, no API and no environment; Hosting reads the runs, Release judges them (ownership cut).
Its answer is the `facts` map of controls/F208: for each control `{ revision, defined, implemented, running, tested }`, each `true`, `false` or `null`, plus the reason of each `null`, and a report in plain text. It is the input `assessRecord` takes, so verify Record can run on it unchanged.

## Acceptance expectations (each fact on its own)
- Implemented: `true` when the delivery map has a row for the control, its entry is delivered on main at the revision, and the entry shows an integration with the adapter (controls' recognition, structural). `false` when the map is readable and has no row or no delivered entry for a control the map should hold. `null` when the map or the entry cannot be read. A structural fact is not a run: it never implies Running.
- Running: `true` only through controls' `executed`: a valid and complete record of the control at the revision, whose run is established independently. Absence of a record is `null`, never `false`: no evidence of a run is not proof of no run. A record whose run is not established, whose sha is another revision, or whose `by` is not the adapter is not counted. A run in `mode: off`, where the check did not judge, is reported as reached but off and does not count as Running (to confirm with Controls, see Open).
- Tested: `null`, always, here. Test Case evidence is Testing's, and no fact implies another.
- Defined: from the record frontmatter and the declaration check, as the caller supplies it; `null` when not supplied.
- Revision: every entry names the revision it is for. A fact for another revision is not used: verify Record treats a stale revision as UNKNOWN.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1593: Implemented. A control with a delivered, adapter-integrated entry on main is `true`; a control whose map row is absent is `false`; an unreadable map is `null`; a structural `true` leaves `running` `null`.
- T1594: Running. A valid, established record at the revision is `true`; no record, an unestablished run, another revision, a record not by the adapter and a `mode: off` run are each `null`, never `false`.
- T1595: the report and the facts map. The answer is a `facts` map that `assessRecord` takes without change, with a reason for every `null`, `tested` `null` for every control, and a missing control is absent evidence, never a pass. The entry reads no file, API or environment.
All red until the DO.

## DO
Add the entry. The DO renames the parked Cases unchanged. Each Case is green with the package suite. A local runner that reads the runs through Hosting's facts and prints the report is a later Change.

## Order
Independent of release/C157 to C160. It uses controls' `executed` and verify Record (controls/F203, F208), both on main. It waits for Controls' change to `runControl` only for the new fields (flag name and value, `mode: off` runs): the Cases that need them follow the record shape Controls states.

## After it
ACT, PROMOTION. Then a Change that runs the collector over the runs of `main` and prints the report, and one that wires it as a job, which needs the Owner's go. Enforcement of verify Record is a separate Owner decision.

## Left open (with a recommendation)
- The record shape of Controls' new fields (the flag name and value, and a `mode: off` run). Recommendation: Controls states them in its PLAN; this PLAN's Cases follow by a small amendment, never by changing an expectation in the DO.
- Whether a `mode: off` run counts toward Running. Recommendation: no. The check was reached but did not judge, so it shows wiring, not a running control; it is reported on its own line.
- Where the runs are read from (job summary line, log line, or an artifact). Recommendation: Hosting supplies them as data; the entry never reads a log.
- The older run records on main that carry no flag fields stay valid evidence for the revision they name.

## Not in this Change
No workflow, WIRE, flag, required check or ruleset change. No claim about Tested. No enforcement.
