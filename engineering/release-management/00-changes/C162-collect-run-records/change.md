# release/C162: collect the raw run records of the controls on main and hand them to the controls judge

## Reason
Kai (26 Nov): "How do we know status of a control without that?" A control's record declares four facts, Defined, Implemented, Running and Tested, each with its own proof, missing proof UNKNOWN. Kai's ruling: the judgement from run records to those facts is part of the controls library (Controls: `executed`, verify Record, and the new fields of `runControl`). It is generic and any adopter gets it. What is Release's is the adopter side: the runs of its workflows on `main`, the records they printed and the delivery map. This Change is the PLAN of that collector. It collects and hands over; it judges nothing, writes no verdict, adds no workflow and no WIRE.

## The contract
A pure entry `05-src/evidence/collect-run-records.mjs` exporting `collect({ revision, runs, map, entries })`, over data the caller supplies (Hosting reads GitHub and the repository, Release collects, Controls judges; ownership cut):
- `revision`: the commit of `main` the collection is for.
- `runs`: the workflow runs of `main` that Hosting reports, each `{ run, sha, workflow, event, conclusion, lines }`, where `lines` are the lines the run printed.
- `map` and `entries`: the delivery map and the text of the delivered entries on `main` at the revision, as data.
Its answer is `{ revision, records, established, rejected, map, entries }`, the input the controls judge takes:
- `records`: every line of a run at the revision that parses as a control record, kept as printed, each tied to the run it came from. The record is Controls' (controls/C158, #2714): `{control, x, run, sha, verdict, by: 'adapter'}` plus `mode` (off, detective, preventive or ratchet), `applied` (true, false for off, null for unknown) and `flag` (`{name, value, state}`, state on, off or UNKNOWN). The collector carries every field unchanged and decides nothing from them.
- `established`: derived from the runs and the delivery map only, never from a record. A run reported at the revision, of the workflow file `P`, establishes `{ control, run, sha }` for each row of the delivery map at that revision whose `delivered` is `P`: the map says which controls a workflow is authorized to emit. A record's own `control` and `run` claims contribute nothing, so a record naming another existing run, or a control the emitting workflow does not deliver, matches no established entry and the judge counts it for nothing. An unreadable map establishes nothing.
- `rejected`: every line that looked like a record and did not parse, and every run of another revision, each with its reason. Nothing is dropped silently and nothing is guessed.
It reads no file, no API and no environment, never judges a verdict, and states no fact of Implemented, Running or Tested.

## Acceptance expectations
- A record line of a run at the revision is collected as printed, tied to its run; a malformed one is `rejected` with the reason; a run of another revision is `rejected`, not used.
- `established` comes from the supplied run data and the delivery map only, as `{ control, run, sha }` for each (run, row) pair where the run's workflow file is the row's `delivered` and the run is at the revision. A record can never establish itself, and control identity is not taken from what a record says of itself.
- A record that names a run Hosting did not report, a run that exists but belongs to another control's workflow, or a control the emitting workflow is not authorized for, is still collected as printed and has no established entry. It is not dropped and not rejected: the judge counts it for nothing and says nothing of it as Running.
- The map and the entries are passed on as given; an unreadable map is passed on as unreadable, never as empty.
- The answer carries nothing that reads as a verdict. UNKNOWN is the judge's, from missing evidence.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1593: records. A valid record line is collected as printed and tied to its run; a malformed line and a run of another revision are rejected with their reason; nothing is dropped silently. Behaviour, positive and negative.
- T1594: established. `established` comes from the runs and the map only. A run of the workflow a row delivers establishes that row's control; a record that names an unreported run, a record that claims another existing run (one that belongs to another control's workflow), and a record that claims a control the emitting workflow does not deliver have no established entry; a run of another revision and an unreadable map establish nothing. Behaviour, positive and negative.
- T1595: hand-over. The answer is the shape the controls judge takes (`revision`, `records`, `established`, `map`, `entries`), an unreadable map stays unreadable, no field is a verdict, and the entry reads no file, API or environment. Structure and behaviour.
All red until the DO.

## DO
Add the entry. The DO renames the parked Cases unchanged. Each Case is green with the package suite. The runner that reads the runs through Hosting and calls the controls judge, and any workflow, are later Changes.

## Order
Aligned with Controls' C158 Running semantics (an executed run counts whatever its verdict, mode or flag, and `running` is `true` or `null`, never `false`): the collector therefore passes every record of a run, off-mode records included, and never filters by mode or verdict. Depends on Controls' PLAN controls/C158 (#2714, collector `kaal/controls/flag-status`) for the judge `judgeRunning` and the record fields (`mode`, `applied`, `flag`). The Cases below already use them; if Controls amends the shape, the Cases follow by a small amendment here, never by changing an expectation in the DO. Independent of release/C157 to C161.

## After it
ACT, PROMOTION. Then a Change that runs the collector over the runs of `main` and calls Controls' judge, and one that wires it as a job, which needs the Owner's go. Enforcement of verify Record is a separate Owner decision.

## Left open (with a recommendation)
- How a record is printed (Controls' library builds the objects and prints nothing; printing is Release's). Decision here: each entry prints exactly one line per run, `kaal-control <JSON of the record>`, to the job log and the job summary, and the collector reads only lines with that prefix. The entries print it in their own Changes (C154 shape); this Change defines the line and reads it.
- `mode: off` runs: decided by the CTO. An executed run with the flag off proves Running, and the mode is reported beside it so it never reads as applied. That rule is Controls' judge's. The collector only carries the fields (the mode, the flag name and value) with each record and decides nothing from them.
- The judge (`judgeRunning({id, records, revision, established})`, per control, returns `{id, running, applied, modes, runs}`) takes the raw records and the runs the collector established. `map` and `entries` are for the later Implemented judge, which takes them as the F207 inventory `{revision, scope, complete, entries}`; the collector passes them raw now and shapes them when that judge is planned.
- Hosting supplies the runs and the delivery data (its facts); a request to Hosting for the shape of `runs` follows.

## Not in this Change
No judgement of any fact, no workflow, WIRE, flag, required check or ruleset change. No claim about Tested.
