# C38 change

## What exists, and who owns it

| Where | Owner | What it gives | Direction |
| --- | --- | --- | --- |
| `kaal-testing observe-at` (testing C82, planned) | Testing | runs a list of Case files at a revision, writes `kaal-testing/observation@1` (`{observed, evidence}` plus `evidence.execution`) | generic, no workflow, no path |
| `run-controls-act.mjs hold ... --evidence <file>`, `judgeHoldWithEvidence` (release C125) | Release | reads the observation as data; missing, wrong shape or another revision is UNKNOWN | the consumer |
| `05-src/wiring/workflows/controls-act.yml`, job `hold-act` (release C122) | Release | the hold job, which today passes no `--evidence` | installed by WIRE |
| `applicableCases` (release) | Release | which Cases apply to the carried Changes | decides applicability |
| **the producing job** | **nobody** | none exists | this Change |

## Decisions (the approval of this pull request is the go for the DO; amended 26 Nov on Kai's go to replan)

Release's C135 already holds the producer inline in its `controls-act.yml` (two jobs, `run Cases` and `observe Cases`), and its WIRE (#2648) installs that temporarily. Testing's C82 now offers `kaal-testing observe-at --report`, which does the integrity checks that release's assembler does. This amendment puts `observe-at` inside C135's split and gives the KAAL workflow integration to Engineering.

1. **One workflow source, Engineering's:** `13-source/workflows/observe-cases.yml`, a reusable workflow (`on: workflow_call`), beside `codeql.yml` and `verify-workflow-names.yml`. It has two jobs, as C135 split them, so the step that runs candidate code is never the step that writes the evidence. The record is evidence of the pull request's own CI, not proof: a local reusable workflow resolves at the merge result, so a pull request can edit this producer, which is acceptable only because the record says `producedBy: pull-request` and hold Act is advisory (Release).
2. **`run-cases`:** checks out the default branch (Testing and the lister) and the merge result under `pr`, installs from the default branch only (`npm ci --ignore-scripts`, then Core and Hosting built, as C135 decided), lists the carried Case files with release's `list-carried-cases.mjs`, runs them with `kaal-testing run --root pr`, and uploads only the run report (artifact `run-report`).
3. **`observe-cases`:** `needs: run-cases`; runs no candidate code. It checks out the default branch and the merge result as data, downloads the report, lists the same files and runs `kaal-testing observe-at --report run-report.json --root pr --revision <merge sha> --expect-revision <merge sha> --run-id <run id> --produced-by pull-request --out <dir> <files>`. It uploads artifact `observation` holding `observation.json` (`kaal-testing/observation@1`), the name and file release's `hold-act` already reads. Release's assembler is no longer needed.
4. **Trust:** plain `pull_request`, `permissions: contents: read`, no secret, no token kept, no `pull_request_target`, no `workflow_run`.
5. **The edit to `controls-act.yml`** is Release's, in its own Change: it calls this source with `uses:` and drops its own two producer jobs, and `hold-act` keeps its `needs:` and `--evidence`. Until then C135's inline jobs stand as the temporary install. The job names are `run-cases` and `observe-cases`; the lister is called as `list-carried-cases.mjs --main . --pr pr` from the default branch checkout (Release confirmed the artifact name, the `needs:` wiring and that its own Change comes after this PROMOTION).
6. **What it does not decide:** a verdict (Release's), what a Case means (Testing's), any WIRE (on Kai's separate go).

## What this Change pins (Cases, plain `.test.mjs`)

- T1570: `observe-cases.yml` is `workflow_call` only, has `permissions: contents: read` and no secret, names no `pull_request_target` or `workflow_run`, checks out the default branch and the merge result under `pr` with `persist-credentials: false`, and installs only with `npm ci --ignore-scripts` outside `pr`.
- T1571: it has the two jobs `run-cases` and `observe-cases`; `observe-cases` has `needs: run-cases`; only `run-cases` runs `kaal-testing run`; only `observe-cases` runs `observe-at --report`, with `--root`, `--revision`, `--expect-revision`, `--run-id` and `--produced-by pull-request`, and runs no `kaal-testing run`.
- T1572: `run-cases` uploads artifact `run-report`; `observe-cases` uploads artifact `observation` holding `observation.json`, with `if: always()`.

All three are RED against `main`: the file does not exist.

## Questions

Release: do the artifact name `observation` and the `needs:` wiring fit? Testing's `observe-at --report` is merged into its collector (C82, #2647), not on main yet.

## Not in this Change

No workflow installed, no edit to `controls-act.yml`, no ruleset, no flag, no WIRE.
