# C135 do

Adds the producer of hold Act's observation to the source of `controls-act.yml`, and the two scripts it needs. The installed `.github/workflows/controls-act.yml` is unchanged: it waits for its own WIRE on the Owner's go. Nothing is required, no flag is set and no ruleset is touched.

## What was built

- `05-src/phase/list-carried-cases.mjs`: lists the Case files of the Changes a collector carries (the Change folders in the merge result that main does not hold, and the Cases that apply to them). It reads files and runs nothing.
- `05-src/phase/assemble-observation.mjs`: reads Testing's run report as untrusted data (it must name exactly the files asked for, name no other file, repeat no test) and writes `{ observed, evidence }`, or an observation that holds nothing and says the catalog is incomplete, so hold Act answers UNKNOWN.
- `05-src/wiring/workflows/controls-act.yml`: `run Cases` (Testing of the default branch runs the carried Cases over the merge result, uploads only the run report), `observe Cases` (runs no candidate code; `observe` with the merge SHA as revision and as expected revision, then the assembler), and `hold Act`, which waits for `observe Cases`, downloads the observation when there is one and passes `--evidence`.
- Cases T1531 (the lister), T1532 (the shape of the workflow source), T1533 (a report that omits, adds or repeats, or is not the shape, answers UNKNOWN), T1534 (the residual risk, kept visible).

## Departures from the PLAN, recorded

1. **Release/T1344 (C122) is narrowed, not weakened.** It pinned "no installation" and fixed counts over the whole workflow. The two producer jobs install Testing (`npm ci --ignore-scripts`, then the build of Core and Hosting) from the default branch, and only there. T1344 now reads its properties over the five judge jobs, which still install nothing and keep their counts, and T1532 pins the producer jobs. The CPO asked that this be stated in the PLAN and the Case, not only done: the PLAN (`change.md`, "The installation boundary") now says producer jobs may install trusted default-branch Testing and judge jobs keep the no-installation rule, and T1344's title and comment say the same.
2. **`hold Act` has one `Judge` step.** The first draft had two invocations (with and without `--evidence`), which broke the counts pinned by T1358; the step now sets `evidence` only when the observation exists.
3. **The observation job names its variables `OBSERVED_REVISION` and `OBSERVED_RUN`**, not `KAAL_MERGE_SHA` and `KAAL_RUN_ID`, which T1372 counts for the four judges.
4. **The disposable-PR experiments are not done in this pull request.** The PLAN asks for a PASS, a FAIL and a tampered report before a WIRE is asked, run on disposable pull requests into a disposable collector. They need the changed workflow installed in `.github`, which is a WIRE, so they cannot run before it. What is shown here is the pipeline run by hand on a fixture: the lister, `kaal-testing run`, `observe` and the assembler on a tree with one carried Change and a node:test Case give GREEN and hold Act PASS. The experiments follow once the Owner authorizes the installation on a disposable branch.

## The residual risks, as the CPO asked

- **A forged GREEN in a well-formed report is not detected.** T1534 shows it: a report that is complete, names exactly the requested file, repeats nothing and carries the right revision, and says GREEN for a Case that would fail, makes hold Act answer PASS. The assembler checks the shape of the report, not the truth of a verdict. That is why `hold Act` stays advisory and never becomes required here, and what would detect it (a rerun of the Cases in a job that shares nothing with the first, and a comparison) is not built.
- **Release's own Cases give UNKNOWN until Testing's runner executes them.** All 249 release Case files export `run()` and no `node:test`, and `kaal-testing run` reports `the file has no test`. Testing's Change testing/C81 (DO #2529, merged into its collector) fixes that, and it is on main only after Promoting. Until then a real ACT pull request reads UNKNOWN, and only a node:test-form Case reads GREEN.
