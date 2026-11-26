# C135 change

## PLAN

Files first: everything that decides is a file that reads files, and the hosting only runs the producer and carries a file between jobs. The approval of this pull request is the go for the DO. The WIRE that installs the changed workflow needs the Owner's own go, and no flag, ruleset or `required` check is touched.

### What is already files, and stays

1. **The judge** reads the evidence as data and decides (C125). It is not changed. The shape of the file is the contract, never an import of Testing.
2. **The producer** is Testing's `observe` command over a Testing run report and the Case catalog of the tree. It is not changed here and release imports none of it into `lib` (T1314).
3. **The binding to the revision** is in the file: `evidence.revision` must equal `evidence.expectedRevision`, and the workflow sets both to the SHA of the merge result the judge reads (`KAAL_MERGE_SHA`). Evidence for any other revision is UNKNOWN, as C125 decided.

### What the hosting has to do (and only this)

Run the Cases of the merge result and hand the evidence file to the `hold Act` job. This cannot be a file: someone has to execute. The lowest hosting level that can do it is the workflow already installed (repo level, plain `pull_request`, no token, no secret). An organisation workflow gives nothing more here, because the judge is advisory and the producer needs no authority beyond reading the tree.

### Design of the change to the workflow source (for the DO)

Two new jobs, and `hold-act` passes the file:

- **`run Cases`** (untrusted, runs candidate code): checks out the merge result as a folder and runs Testing's `run` over the Cases of the Changes the pull request carries, using the copy of Testing from the default branch and not the pull request's own. `permissions: contents: read`, no credentials kept, no secret, no network need beyond the install of dependencies pinned as today. It uploads only the run report.
- **`observe Cases`** (trusted, executes no candidate code): needs `run Cases`, downloads the run report as data, checks out the default branch (the judge and Testing) and the merge result as data, and runs `observe` with `--revision` and `--expect-revision` both the SHA of the merge result and `--run-id` the run. It uploads `observed.json` and `evidence.json`.
- **`hold-act`** needs `observe Cases`, downloads the evidence and passes `--evidence`. Every other job is unchanged.

Splitting running from observing keeps the Case code, which may be hostile, away from the step that writes the evidence. A Case that overwrites the report file inside `run Cases` is the residual risk (below), and it is shown, not assumed away.

### The installation boundary (amendment, at the CPO's review of the DO)

The ACT workflow of release/C122 holds a governance boundary that release/T1344 pins: its judge jobs install nothing. This PLAN is amended to say how the two producer jobs stand against it, instead of leaving the DO to narrow the Case on its own.

1. **Producer jobs may install trusted Testing, and only that.** `run Cases` and `observe Cases` may install the dependencies of the default branch (`npm ci --ignore-scripts`, then the build of Core and Hosting) in the checkout of the default branch, because Testing's runner and `observe` cannot run without them. Nothing is installed from, or inside, the merge result, and no lifecycle script runs.
2. **Judge jobs keep the no-installation rule.** `hold Act`, `demand Act`, `verify Act`, `limit Act` and `isolate Changes` install nothing, as release/T1344 has pinned them since C122. T1344 is amended to read its properties over the judge jobs, saying so in its own text; T1532 pins the producer jobs (the installation comes only from the default branch checkout; nothing runs from the merge result).
3. **The boundary is the job, not the workflow.** A job that judges installs nothing; a job that produces may install trusted code. A third kind of job needs its own decision.

### Residual risks, each named

1. **The run report is produced where candidate code runs.** A pull request can add a Case that tampers with the report path. `observe Cases` therefore reads the report as untrusted data: it checks that every Case the catalog names appears exactly once, that ids match the catalog of the tree it reads, and that the report's own revision equals the merge SHA. A forged report that passes these checks and still lies about a verdict is not excluded by files; it is why `hold Act` stays advisory and is not required until the CTO shows otherwise.
2. **Cost and time.** Running the Cases of the carried Changes adds minutes to every ACT pull request. The carried Changes only, never the whole suite.
3. **Same route as C133.** `hold Act` is a gate on `pull_request` in the pull request's own workflow file. Making it required or preventive is the question of release/C133 (relay integrity, WIRE authority) and is out of scope here. This Change gives the judge its input and nothing more.

### Cases (plain `.test.mjs`; they land with the DO, ids after the highest on main)

- the workflow source has `run Cases`, `observe Cases` and `hold Act`, and `hold Act` runs `run-controls-act.mjs hold` with `--evidence` naming the downloaded file;
- `run Cases` has `permissions: contents: read`, no `secrets`, and checks out the merge result with `persist-credentials: false`; `observe Cases` runs no step from the merge result folder;
- `--revision` and `--expect-revision` of `observe` are both the merge SHA;
- the judge answers UNKNOWN for evidence of another revision and PASS only for a complete catalog at the right revision with every Case GREEN (kept from C125, run against the file the workflow produces);
- a run report that omits a Case of the catalog, repeats one, or names an id outside the catalog is answered UNKNOWN by the producer step, not GREEN.

### Evidence the DO must record before the WIRE is asked

A run of the changed workflow on a disposable pull request into a disposable collector, in the advisory evidence log: one with every carried Case GREEN (PASS), one with a RED Case (FAIL), one where the report is tampered with (UNKNOWN). Real ACT pull requests are not used as the experiment.

### Not in this Change

No change to the judge, Testing, a ruleset, a flag or the `.github` workflow itself: the DO changes the source in `05-src/wiring/workflows`, and the installed copy waits for its own WIRE on the Owner's go. `demand`, `verify` and `limit` Act are unchanged. `hold Act` is never made required here.
