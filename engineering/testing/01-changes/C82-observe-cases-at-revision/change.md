# C82 change

## Finding

Release's hold Act (`release/C125`) reads `{ observed, evidence }` and answers UNKNOWN "Testing's observation of the Cases at this revision is not available" on every pull request, because nothing produces that file there (seen on #2635 and #2585). Today a consumer runs `kaal-testing run`, lists the catalog and runs `kaal-testing observe` as three steps, and release's draft assembler (`release/C135`) carries the integrity checks on the run report that Testing should own. The exact `export run` Case form is now run by Testing (`testing/C81`), so a record from Testing can finally say GREEN for the release Cases.

## PLAN

1. One generic step and one record form, written by Testing and read by any consumer: `kaal-testing/observation@1`, `{ schema, observed, evidence }`. `observed` and `evidence` are exactly what `kaal-testing observe` gives, so release's reader (it reads `observed`, `evidence.revision`, `evidence.expectedRevision`, `evidence.catalog`, ignores the rest and needs no `schema`; release confirmed) is unchanged. New: `evidence.execution` (`requested`, `ran`, `complete`, `problems`) and `evidence.integrity` (findings on the run report).
2. `lib/observation.mjs`: `assembleObservation` (pure; the report is untrusted data checked against the requested files, exactly once each) and `observeAt` (`runCases`, `collectCases`, `assembleObservation`). Command `kaal-testing observe-at --root R --revision S --expect-revision S --run-id I --produced-by W --out DIR <files…>` writes `DIR/observation.json`; `--report` assembles from a report produced elsewhere. `run` and `observe` stay.
3. Cases `testing/T408` to `testing/T413`, plain `.test.mjs` in their destination folders (the `C30` and `C80` precedent), RED on this tree and GREEN in place in the DO:
   - `T408` (`testing/I50`), `T409` (`testing/F175`), `T410` (`testing/A61`): each file equals its draft.
   - `T411` (`testing/F175`): `observeAt` over fixture Cases: a returning export-form Case is GREEN, an assertion failure RED, an error, a timeout and a requested but missing file UNKNOWN; the record carries the schema, `evidence.execution.complete: false` for the incomplete run and `true` for a clean one, and a revision other than the expected one or a missing run id makes every Case UNKNOWN.
   - `T412` (`testing/F175`): `assembleObservation` reads a report as untrusted data: a report that omits a requested file, names a file that was not requested, has a test of an unrequested file, repeats a test id, or is not of schema `run-report@1` gives every Case UNKNOWN, `catalog.complete` and `execution.complete` false and a named `integrity` finding; none of them can give GREEN. A well formed report gives the same `observed` and `evidence` as `observe` for the same inputs (the pair is the reader's contract).
   - `T413` (`testing/F175`): the command writes `observation.json` in `--out` and exits 0 for a RED and an UNKNOWN run, exits 2 and writes nothing for a missing `--run-id` or `--out`, and a record read by a stand-in of the hold Act reader (its four fields only) is the same as `observe`'s pair.
4. Evidence: `T408` to `T413` RED on this tree, GREEN on a throwaway DO with the three drafts placed.

## Boundary with the other capabilities

- **Release** owns which Cases to run (its lister of the carried Cases), the verdict of hold Act and the reader of the record. Testing imports nothing from release and release imports nothing from Testing: the record is the contract.
- **Engineering** owns the KAAL workflow that calls the step, where `observation.json` is uploaded and how hold Act finds it. The call is one step from the default branch checkout (tool) with the merge result as data; the install is `npm ci --ignore-scripts` and the build of Core and Hosting in that checkout, as `release/C135` decided, and nothing is installed from the merge result.
- **Testing** owns the record form, the integrity check on the run report and the meaning of GREEN, RED and UNKNOWN in it.

## Residual risk, kept visible

The Cases of the pull request run candidate code. A Case that rewrites the report or the record path, or a well formed report that lies about a verdict, is not excluded by files; the integrity check catches a report that is not what was asked for, not a forged verdict. That is why hold Act stays advisory, as `release/C135` says. Running `observe-at` in one trusted job over candidate code keeps the record and the run in the same job; the split form (`kaal-testing run` untrusted, `observe-at --report` trusted) is there for a caller that wants them apart.

## Not in this Change

No workflow, flag, ruleset, WIRE or required check; no Case selection; no change to `run`, `observe` or `release`'s reader.

## Ids

Change `testing/C82`, Intent `testing/I50`, Requirement `testing/F175`, Architecture `testing/A61`, Cases `testing/T408` to `testing/T413`. Ids are taken by hand; on a clash the newer PR renumbers.
