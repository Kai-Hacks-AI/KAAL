# release/C162: collect the raw run records of the controls on main and hand them to the controls judge

## Reason
Kai (26 Nov): "How do we know status of a control without that?" A control's record declares four facts, Defined, Implemented, Running and Tested, each with its own proof, missing proof UNKNOWN. Kai's ruling: the judgement from run records to those facts is part of the controls library (Controls: `executed`, verify Record, and the new fields of `runControl`). It is generic and any adopter gets it. What is Release's is the adopter side: the runs of its workflows on `main`, the records they printed and the delivery map. This Change is the PLAN of that collector. It collects and hands over; it judges nothing, writes no verdict, adds no workflow and no WIRE.

## The contract
A pure entry `05-src/evidence/collect-run-records.mjs` exporting `collect({ revision, runs, map, entries })`, over data the caller supplies (Hosting reads GitHub and the repository, Release collects, Controls judges; ownership cut):
- `revision`: the commit of `main` the collection is for.
- `runs`: the workflow runs of `main` that Hosting reports, each `{ run, sha, workflow, event, conclusion, lines }`, where `lines` are the lines the run printed.
- `map` and `entries`: the delivery map and the text of the delivered entries on `main` at the revision, as data.
Its answer is `{ revision, records, established, rejected, map, entries }`, the input the controls judge takes:
- `records`: every line of a run at the revision that parses as a control record (the shape of controls/F203 with whatever fields Controls adds), kept as printed, each tied to the run it came from.
- `established`: the runs Hosting reports as existing at the revision, as `{ control, run, sha }` for each record, derived only from the run's own data (its id, its sha, its workflow), never from what the record claims about itself.
- `rejected`: every line that looked like a record and did not parse, and every run of another revision, each with its reason. Nothing is dropped silently and nothing is guessed.
It reads no file, no API and no environment, never judges a verdict, and states no fact of Implemented, Running or Tested.

## Acceptance expectations
- A record line of a run at the revision is collected as printed, tied to its run; a malformed one is `rejected` with the reason; a run of another revision is `rejected`, not used.
- `established` comes from the supplied run data only: a record naming a run that Hosting did not report is collected but has no established run, so the judge cannot count it. A record cannot establish itself.
- The map and the entries are passed on as given; an unreadable map is passed on as unreadable, never as empty.
- The answer carries nothing that reads as a verdict. UNKNOWN is the judge's, from missing evidence.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1593: records. A valid record line is collected as printed and tied to its run; a malformed line and a run of another revision are rejected with their reason; nothing is dropped silently. Behaviour, positive and negative.
- T1594: established. A collected record has an established run only when the supplied run data reports it at the revision; a record that names an unreported run has none; a record's own claim never establishes it. Behaviour, positive and negative.
- T1595: hand-over. The answer is the shape the controls judge takes (`revision`, `records`, `established`, `map`, `entries`), an unreadable map stays unreadable, no field is a verdict, and the entry reads no file, API or environment. Structure and behaviour.
All red until the DO.

## DO
Add the entry. The DO renames the parked Cases unchanged. Each Case is green with the package suite. The runner that reads the runs through Hosting and calls the controls judge, and any workflow, are later Changes.

## Order
Depends on Controls for the judge and the record shape: the judgement of Implemented and Running from records, the new fields of `runControl` (the flag name and value, and a `mode: off` run) and the way a record is printed. This PLAN states what it needs; the Cases follow Controls' PLAN by a small amendment here, never by changing an expectation in the DO. Independent of release/C157 to C161.

## After it
ACT, PROMOTION. Then a Change that runs the collector over the runs of `main` and calls Controls' judge, and one that wires it as a job, which needs the Owner's go. Enforcement of verify Record is a separate Owner decision.

## Left open (with a recommendation)
- How a record is printed (a line prefix, the job summary, an artifact) and which fields it carries. Recommendation: Controls states them in its PLAN; Release collects whatever that shape says and rejects the rest.
- `mode: off` runs: decided by the CTO. An executed run with the flag off proves Running, and the mode is reported beside it so it never reads as applied. That rule is Controls' judge's. The collector only carries the fields (the mode, the flag name and value) with each record and decides nothing from them.
- Hosting supplies the runs and the delivery data (its facts); a request to Hosting for the shape of `runs` comes after Controls' record shape is stated.

## Not in this Change
No judgement of any fact, no workflow, WIRE, flag, required check or ruleset change. No claim about Tested.
