# C127 do

## DO

What the PLAN decided, as built (decisions 1 to 6; decision 7, the line in CTL33, follows once its PLAN is merged).

- **One record per judge per run (1).** `05-src/phase/lib/evidence.mjs` makes the record (`recordOf`, `evidenceLine`); the runner `run-controls-act.mjs` prints `act-evidence {...}` after the report of each of the four judges (not of `isolate Changes`, which is no judge). The fields are `kind, judge, check, pr, merge, run, verdict, applies, attribution`; the pull request, the merge result and the run come from the environment (`KAAL_PR`, `KAAL_MERGE_SHA`, `KAAL_RUN_ID`) that the workflow source hands to the four judge jobs, and a missing one is `null`. The workflow writes nothing and gains no permission.
- **The ledger and its summary (2).** The ledger is a file, `evidence.jsonl` beside the control; none is created here because no record exists yet. `summarizeEvidence(ledger, judge)` is pure over data (the library reads no file, no process, no history) and `summarize-act-evidence.mjs <ledger> <judge>` reads the file and prints the summary. A ledger entry is a run record, which a person may complete with `expected` (the verdict the facts call for), `facts` (where those facts can be read), `provoked` and `handled: { by, open }`, or a review entry `{ kind: 'review', judge, outcome, reasons, nextTrigger, reviewer }`.
- **Unobserved is not evidence (3).** A record whose attribution is `missing` counts toward nothing and is reported as unobserved.
- **Quantity, quality, Owner (4).** The trigger counts one run per distinct pull request that judged a real ACT (`applies` true) with complete attribution, ten of them; a "not an ACT" run is recorded and counted nowhere; a re-run counts once. The summary then states the facts a quality review needs: the boundaries PASS, FAIL and UNKNOWN exercised by counted runs, a provoked violation, the unresolved non-PASS runs (a `handled` label on an open Defect is unresolved), the expected-versus-observed mismatches and how many counted runs nobody has checked against the facts. The outcome READY, NOT READY or MORE EVIDENCE NEEDED, and the next trigger, exist only as a review entry of a person; with none the summary says `no review`, and the report never prints READY by itself. No flag, workflow installation or ruleset changes here.
- **Not here (6).** C124, C125 and C126 are untouched.

### Cases

T1367 (the runner's record), T1368 (the trigger: ACT runs, distinct, attribution), T1369 (a count never makes a judge ready; handled-on-an-open-Defect is unresolved), T1370 (expected versus observed; the review entry), T1371 (the library is pure; the script reads the ledger), T1372 (the workflow source hands the three values and nothing else). All six were green on the first run of the change; the run of the whole release-management folder has no red Case.

### Accepted edits

- T1314 lists the new layer `evidence` (it imports nothing).

### Evidence for the review of a judge

Each counted run keeps its pull request, its merge result and its run id in the ledger, so the run can be opened again, and `expected` plus `facts` let a person who was not there compare what the judge said with what the pull request is.
