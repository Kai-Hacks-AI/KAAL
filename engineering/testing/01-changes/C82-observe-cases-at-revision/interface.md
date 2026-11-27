# C82 interface

Drafts of the files the DO places under `engineering/testing/`, following `packages/kaal-engineering/skills/kaal-engineering/references/package-layout.json`. Each draft matches its placed file after the DO.

## Draft of I50.md

`````
---
id: testing/I50
title: Testing observes the Cases of a revision and records what it observed
---
# testing/I50 Testing observes the Cases of a revision and records what it observed

Contract: given a tree, the Case files to run, and the revision and run id of the run, Testing runs those Cases and writes one record of what it observed, in Testing's own form (`kaal-testing/observation@1`): each Case read GREEN, RED or UNKNOWN, with the evidence that says how far to trust it (revision, run id, whether the catalog and the run were complete). A record never says GREEN for a Case it cannot show ran, and a run report that is not what was asked for yields UNKNOWN for every Case, so that a consumer such as hold Act reads the same truth from one file. Which Cases to run, which workflow runs this and where the record is kept belong to the consumer, not to Testing. Reason: today a consumer has to run, collect and observe in three steps and assemble the record itself; hold Act reads UNKNOWN on every pull request until someone does. Owner: testing.
`````

## Draft of F175.md

`````
---
id: testing/F175
title: observe-at
kind: functional
serves: [testing/I50]
---
# testing/F175 observe-at

`observeAt({ root, files, revision, expectedRevision, runId, producedBy })` (library `kaal-testing/observation`, command `kaal-testing observe-at`) runs the given Case files with the runner, reads the Case catalog of `root`, and returns one record `{ schema: 'kaal-testing/observation@1', observed, evidence }`. `observed` and `evidence` are exactly what `kaal-testing observe` gives (`observed` maps a Case id to `GREEN`, `RED` or `UNKNOWN`; `evidence` carries `revision`, `expectedRevision`, `runId`, `producedBy` and `catalog` with `complete`, `findings` and `unobservable`), so a reader of that pair needs no change, plus `evidence.execution` with `requested` (the files asked for), `ran` (the files the run reports), `complete` (the run's own completeness and no integrity finding) and `problems`, and `evidence.integrity`, a list of findings. `assembleObservation` does the same from a run report that was produced elsewhere and is read as untrusted data: when the report is not of schema `kaal-testing/run-report@1`, its files are not exactly the requested files (one missing, one extra), a test belongs to a file that was not requested, or a test id repeats, every Case is `UNKNOWN`, `catalog.complete` and `execution.complete` are `false`, and `integrity` names each finding. A revision that differs from the expected revision, or a missing run id, makes every Case `UNKNOWN` as `observe` already decides. The command `kaal-testing observe-at --root R --revision S --expect-revision S --run-id I --produced-by W --out DIR <files…>` writes the record as `observation.json` in the directory `DIR` only when its input is valid (exit `0`, RED and UNKNOWN included), and writes nothing and exits `2` for invalid input; with `--report run-report.json` instead of running, it assembles the record from that report. The record is evidence for a reader, and decides no verdict.
`````

## Draft of A61.md

`````
---
id: testing/A61
title: observe-at
serves: [testing/F175]
---
# testing/A61 observe-at

`lib/observation.mjs` composes what Testing already has and adds nothing that decides: `runCases` (`testing/C63`) runs the files, `collectCases` (`testing/C74`) lists the catalog, `observeCases` (`testing/C74`) attributes each Case by its file. `assembleObservation` is the pure part: it checks the run report as untrusted data against the requested files, then calls `observeCases`, and wraps the result with the schema and the execution facts. `observeAt` is `runCases`, `collectCases` and `assembleObservation` in one call. The command `observe-at` is its thin shell, next to `run` and `observe`, which stay. The record keeps the `{ observed, evidence }` shape of `observe` as its subset, so the reader in release (`observationOf`, `release/C125`) reads it unchanged and Testing imports nothing from release. Testing knows no workflow, no pull request and no path: the caller names the files, the revision, the run id and the output path. Where a run and its observation must be separated because the run executes candidate code, the caller runs `kaal-testing run` in one job and `assembleObservation` (command `observe-at --report`) in a trusted one, which is why the report-reading form is a first-class entry and not a test helper. Rejected: reading the carried Cases in Testing (a release concept), and a new verdict (release owns it).
`````
