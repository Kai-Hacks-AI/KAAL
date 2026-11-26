# C38 change

## What exists, and who owns it

| Where | Owner | What it gives | Direction |
| --- | --- | --- | --- |
| `kaal-testing observe-at` (testing C82, planned) | Testing | runs a list of Case files at a revision, writes `kaal-testing/observation@1` (`{observed, evidence}` plus `evidence.execution`) | generic, no workflow, no path |
| `run-controls-act.mjs hold ... --evidence <file>`, `judgeHoldWithEvidence` (release C125) | Release | reads the observation as data; missing, wrong shape or another revision is UNKNOWN | the consumer |
| `05-src/wiring/workflows/controls-act.yml`, job `hold-act` (release C122) | Release | the hold job, which today passes no `--evidence` | installed by WIRE |
| `applicableCases` (release) | Release | which Cases apply to the carried Changes | decides applicability |
| **the producing job** | **nobody** | none exists | this Change |

## Decisions (the approval of this pull request is the go for the DO)

1. **One workflow source, Engineering's:** `13-source/workflows/observe-cases.yml`, a reusable workflow (`on: workflow_call`), beside `codeql.yml` and `verify-workflow-names.yml`. It runs on the pull request's own CI, so it is evidence, not enforcement, and the observation says `producedBy: pull-request` (testing F161). It adds no `workflow_run` and no `pull_request_target`.
2. **When and where:** as a job of release's `controls-act.yml`, on a pull request into `kaal/**`, before `hold-act`. Release's file gets an `observe` job that `uses:` this source and a `needs: observe` on `hold-act`; that edit is Release's, in its own Change. The artifact travels inside one workflow, as Testing's plan asks.
3. **Trust:** plain `pull_request`, `permissions: contents: read`, no secret, no token kept (`persist-credentials: false`). The tool (`kaal-testing`) and the judge are checked out from the default branch. The merge result is checked out under `pr` and used as data: only its Case files are run, nothing is installed from it. The tool is installed from the default branch only: `npm ci --ignore-scripts`, then Core and Hosting built, as release C135 decided (Testing, 26 Nov). **The record is evidence of the pull request's own CI, not proof:** a local reusable workflow resolves at the merge result, so a pull request can edit this producer. That is acceptable only because the record says `producedBy: pull-request` and hold Act is advisory (Release).
4. **The call:** `kaal-testing observe-at --root pr --revision <merge sha> --expect-revision <merge sha> --run-id <run id> --produced-by pull-request --out <dir> <files>` over the listed Case files, one step. It writes `<dir>/observation.json` (`kaal-testing/observation@1`: `{schema, observed, evidence}` plus `evidence.execution` and `evidence.integrity`); RED and UNKNOWN exit 0, invalid input exits 2 (Testing). Testing's separate run and observe-from-report steps are not used here.
5. **The list of Case files** comes from Release, the owner of which Cases apply: its `05-src/phase/list-carried-cases.mjs` lists the Cases of the carried Changes, run from the default branch. Engineering builds no lister and imports nothing from Release; Testing runs only what it is given.
6. **The path hold Act reads:** the job uploads artifact `case-observation` holding `observation.json`; `hold-act` downloads it and passes `--evidence <download dir>/observation.json` (Release's edit, in its own Change; the file is `observation.json`, not `evidence.json`). A missing artifact is a missing file, which hold Act already reads as UNKNOWN.
7. **What it does not decide:** a verdict (Release's), what a Case means (Testing's), the edit to `controls-act.yml` and the WIRE (Release, on Kai's go).

## What this Change pins (Cases, plain `.test.mjs`)

- T1570: `observe-cases.yml` is `workflow_call` only, has `permissions: contents: read` and no secret, names no `pull_request_target` or `workflow_run`, checks out the default branch and the merge result under `pr` with `persist-credentials: false`, and installs only with `npm ci --ignore-scripts` outside `pr`.
- T1571: its call is `kaal-testing observe-at` with `--root`, `--revision`, `--expect-revision`, `--run-id`, `--produced-by pull-request` and `--out`, in one step.
- T1572: it uploads artifact `case-observation` with `if: always()`, and the file hold Act reads is `observation.json`.

All three are RED against `main`: the file does not exist.

## Questions

None open: Testing and Release answered (26 Nov). The Case files come from release's lister; the file is `observation.json`.

## Not in this Change

No workflow installed, no edit to `controls-act.yml`, no ruleset, no flag, no WIRE.
