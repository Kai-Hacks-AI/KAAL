# C17 interface

## The starting minimums

`real` is a run on a real pull request, merge or ruleset of this repository; `provoked` is a failure made on purpose that the control must catch, shown by a RED base and a GREEN head (controls/F28).

| Control | Type | Line |
| --- | --- | --- |
| release/CTL1 verify Stages | detective | `evidence: [fixture:2, real:1, provoked:1:fail]` |
| release/CTL2 analyze Vulnerabilities | detective | `evidence: [fixture:2, real:1, provoked:1:fail]` |
| release/CTL7 verify Sync | detective | `evidence: [fixture:2, real:1, provoked:1:fail]` |
| release/CTL11 verify Envelope | detective | `evidence: [fixture:2, real:1, provoked:1:fail]` |
| release/CTL19 verify Triggers | detective | `evidence: [fixture:2, real:1, provoked:1:fail]` |
| release/CTL5 gate Analyze Vulnerabilities | preventive | `evidence: [fixture:2, real:2, provoked:1:fail]` |
| release/CTL8 approve Sync | preventive | `evidence: [fixture:2, real:2, provoked:1:fail]` |
| release/CTL10 approve Integration | preventive | `evidence: [fixture:2, real:2, provoked:1:fail]` |
| release/CTL20 gate Verify Triggers | preventive | `evidence: [fixture:2, real:2, provoked:1:fail]` |
| release/CTL9 review Sync | corrective | `evidence: [fixture:2, real:2, provoked:1:fail]` |

The numbers follow the type: a detective control must be seen to reveal, a preventive or corrective one must be seen to act twice on real material. They are a starting point for each owner to confirm in review.

## Records

`engineering/controls/06-records/<control id with / as ->/<run>.json`, one record `{ case, x, run, outcome[, base] }` each (controls/F28), added by the Change that made the run and linked by name from its ACT. A `README.md` holds the folder before the first record.

## Converter and check

`engineering/controls/05-src/report-to-records.mjs <report.json> --x <kind> --run <id> [--base <report.json>]` writes records from a `kaal-testing` report; with `--base`, a test RED on the base and GREEN on the head gives a record with `base: { run, outcome }`. Engineering's control check (controls/F23) passes `--records engineering/controls/06-records` to `check-controls.mjs`.

## Flag, WIRE and the Dispatcher's go-hot gate (stated, not built here)

A flag that turns a control on, or a WIRE that flips one, points at records that show the control Tested; the Dispatcher's go-hot gate (at least two collectors, two wires and two hotfixes seen in dry run) becomes the declared minimum of the Dispatcher's control when it is registered. Each is a Change of its own capability.
