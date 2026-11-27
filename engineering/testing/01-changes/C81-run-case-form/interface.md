# C81 interface

Drafts of the files the DO places under `engineering/testing/`, following `packages/kaal-engineering/skills/kaal-engineering/references/package-layout.json`. Each draft matches its placed file after the DO.

## Draft of I49.md

`````
---
id: testing/I49
title: the runner runs every Case form the catalog lists
---
# testing/I49 the runner runs every Case form the catalog lists

Contract: `kaal-testing run` executes a Case file in either form the catalog lists, the node:test form (tests registered with `node:test`) or the export form (`export const id`, `export const tests`, `export async function run()`), and reports the result under that file, so that `kaal-testing observe` reads a Case GREEN, RED or UNKNOWN from what ran. A file the runner cannot execute stays a problem of that file and never reads as a pass. Reason: a Case in the export form reports `empty-inventory` today, so every consumer of the run report (observe, hold Act evidence) reads such a Case UNKNOWN however good it is. Owner: testing.
`````

## Draft of F174.md

`````
---
id: testing/F174
title: run-export-cases
kind: functional
serves: [testing/I49]
---
# testing/F174 run-export-cases

`kaal-testing run` executes a Case file whose module exports a callable `run` as exactly one test, named by the string `id` export when there is one and by the file path otherwise, reported under that file. `run()` returning normally is `GREEN`; `run()` throwing or rejecting with an assertion error (`ERR_ASSERTION`) is `RED`; any other throw or rejection is `UNKNOWN` with reason `error`; a file that does not end within the timeout is the file-level `timeout` problem, as before. A file with node:test tests and a callable `run` reports both. A file with no callable `run` runs as before: its node:test tests are reported, and a file with neither has the problem `empty-inventory`; a `run` that is not callable (`export const run = 42`) is not executed and does not turn the file into a Case that ran. A file that cannot be imported has the problem `file-failed`, as before. The run report keeps the schema `kaal-testing/run-report@1`, the same fields and the same `execution.complete` rule, and `run` judges no Case form: whether a Case has a valid `id`, `tests` and `run` stays with `kaal-testing/form`. Read by `kaal-testing observe` against the catalog and the judged revision, a successful export-form Case in a complete run is `GREEN` with no reason; an assertion failure is `RED`; an execution error, a timeout or interruption, an unimportable file, a file not run, or an incomplete or wrong-revision run is `UNKNOWN` and never `GREEN`.
`````

## Draft of A60.md

`````
---
id: testing/A60
title: run-case-form
serves: [testing/F174]
---
# testing/A60 run-case-form

`kaal-testing run` stays the one producer of the run report; `reconstruct`, `observe` and the report schema do not change. The runner starts each file in its own `node --test` child as today, and the child imports the Case file and registers the single `run()` test for a file that exports a callable `run`, so the events are those of ordinary tests and `reconstruct` already classifies them (assertion error `RED`, any other error `UNKNOWN`). The file is detected by importing it in the child, not by parsing its source, so Hosting source inspection (the `C80` prerequisite) is not needed here. Attribution stays by the Case's own file, which is what `observe` reads. The form checker (`kaal-testing/form`, `testing/C69`/`C70`) decides what a well formed Case is, and `run` decides nothing about form; the two share only the meaning of a callable `run`. This serves `C80` prerequisite 4 (a phase-aware route that runs the catalog's Cases with `kaal-testing run`) and the release capability's hold Act evidence (`release/C135`), whose 249 Cases are in the export form. Rejected: a release-side wrapper that runs each `run()` as a test of `cases.test.mjs` (it attributes the result to that file, not to the Case's), and converting the Cases to node:test (churn, and two forms of one Case).
`````
