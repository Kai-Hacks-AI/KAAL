# C15 interface

## Declaration

`evidence: [fixture:3, merge:2, provoked:1:fail]`, an optional line. `<x>:<runs>[:fail]`, each x once, x a lower-case word, runs from 1, at least one entry with `:fail`. The finder lists `evidence: [{ kind, runs, fail }]` for every control, and a bad line is one problem of `evidence` whose recovery names the X, the runs and `fail`.

## Records

`{ case, x, run, outcome }`: a Case that tests the control, the kind of X, the run id, the outcome GREEN, RED or UNKNOWN as a runner reports it. For an x declared `:fail` the record also carries `base: { run, outcome }`, the run of the same Case on the failure without the control's mechanism (the base side of `compareReports`); it counts only with base outcome RED, a base run different from `run`, and outcome GREEN. A JSON file holding an array or one record, or a directory of such files.

## Scripts

`evidence.mjs <directory> [--records <path>]` prints `{ id, verdict, reason, met, missing, notGreen }` for each control that claims `tested`; exit 1 unless all PASS. `check-controls.mjs <directory> [--records <path>]` as before, and given records it fails each `tested` claim that is not PASS with a problem of `status` (`tested is not shown: <reason>`).

## Reference

`declaring-controls.md`: the `evidence` bullet. `judging-status.md`: how Tested is shown. No new line in `SKILL.md`.
