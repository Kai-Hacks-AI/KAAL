# C122 change

## PLAN

One workflow that runs the four judges of the ACT on every pull request into a collector, in three states of one control: a report that cannot fail a pull request (detective), a red check when the flag of that judge is `on` (advisory), and a ruleset that requires it (preventive, a separate Change on Kai's go). This PLAN decides the first two and the evidence for the third.

### Decisions (the PLAN's recommendations; the approval of this pull request is the go)

1. **One workflow, `act-judges.yml`, on `pull_request`** (never `pull_request_target`), for the branches `kaal/**`, on opened, synchronize, reopened and edited. Four jobs, named `hold Act`, `demand Act`, `verify Act` and `limit Act`, so that each is a check of its own and any one can be required later without the others.
2. **The judge is the default branch's, the pull request is data.** Each job checks out the default branch (the judges, run) and the pull request's merge result into a second folder (data, never run, no credentials kept, nothing installed), as the Dispatcher's workflow does. The tree the judges read is therefore the collector as it would be after the merge. No token, no secret, `permissions: {}` beyond `contents: read`.
3. **Which pull request is an ACT is limit Act's answer**, not a title or a body: `limit Act` says `applies: true` when the pull request touches the ACT folders. On a pull request that is not an ACT every job reports "not an ACT" and passes. On an ACT: limit Act judges the changed paths (the diff of the merge result against the base, both ends of a rename); demand Act, verify Act and hold Act judge the tree. A verdict that is FAIL or UNKNOWN is shown with the judge's own message; UNKNOWN never passes.
4. **hold Act reports UNKNOWN until Testing has an observation adapter.** It is run and it says so, in its own words ("Testing's observation of the Cases at this revision is not available"), rather than being left out: the report shows what cannot be told yet. Its flag may be turned on only after the adapter exists; until then it would fail every ACT.
5. **The same reading of the tree as the Dispatcher's.** The tree facts (capability roots, the Changes the collector carries, the retros as kaal-retro finds and judges them, the changed paths) move to the library, `05-src/phase/lib/tree-facts.mjs`, and both the Dispatcher (release/C116) and this workflow's runner ask through it: one reading, not two. The runner is `05-src/phase/run-act-judges.mjs`: it reads the two folders, asks the judge named by its argument and prints `<VERDICT>: <message>` with the exit code of the judge's own command line.
6. **Detective, then advisory, by one variable per judge.** The flag is `KAAL_RELEASE_<CONTROL>` with the control named by what it controls: `KAAL_RELEASE_HOLD_ACT`, `KAAL_RELEASE_DEMAND_ACT`, `KAAL_RELEASE_VERIFY_ACT` and `KAAL_RELEASE_LIMIT_ACT`. Only the exact value `on` is live. Off or absent (the first state): the job writes the verdict to its summary and exits 0, whatever the verdict. On (the second state): a FAIL or an UNKNOWN that applies exits 1, so the check is red; no ruleset requires it, so nothing is blocked. The variable decides a report, never an enforcement.
7. **Preventive is not in this Change.** Requiring a check is a change of a ruleset, on Kai's explicit go and through the Owner (the `30 - promoting` and `20 - integrating` family), never through a variable. It waits for the evidence below.
8. **Where the source lives.** `05-src/wiring/workflows/act-judges.yml`, where release's workflow sources are now (the Dispatcher's and the Branching one are there). When engineering/C29 puts the workflow sources in a per-capability home, this one moves with the rest in that Change; nothing here depends on the new home.
9. **Installing is a WIRE with the Owner's go**, separate from the DO: copy `act-judges.yml` into `.github/workflows/`, then the Owner sets the four variables. Installing the workflow makes it run in the first state only.

### The gate from detective to advisory to preventive (the evidence)

Each judge's control states its gate in its own record, in the form controls/C20 reads (a run has a recorder; a RED or UNKNOWN run is handled in words before it counts). Per judge:

- **Tested (detective to advisory).** The control's `evidence` line of release/CTL24, CTL29, CTL30 and CTL31 is met by runs the workflow itself recorded (the run id is the recorder): at least one real ACT pull request judged PASS that applies, and one provoked run of the judge that fails (a pull request made to fail it, kept as a record). Every RED or UNKNOWN run on a real pull request has a `handled` explanation. The Owner turns a flag on only when the control reads tested under C20.
- **Sharp (advisory to preventive).** After advisory has run on real ACT pull requests with no false FAIL that is not handled, and no UNKNOWN that is not handled, Kai decides, per judge, whether to require it. The number of real runs is the control's to confirm; this PLAN proposes three for demand, verify and limit and none for hold until its adapter exists.
- hold Act has no advisory state before Testing's adapter; its first real PASS is the event that opens its gate.

### Cases the DO adds (ids chosen free in the DO), in Given-When-Then

- **The runner asks the right judge.** Given a data folder of a collector with one well-formed retro that reflects its carried Change and a pull request that changed only the retros folder, each of demand, verify and limit answers PASS and applies. Given each fault (two retros, a retro that does not reflect, a malformed retro, a path outside the ACT folders, no retro), the named judge FAILs or is UNKNOWN and says why.
- **Not an ACT is not a fault.** Given a pull request that changes a Change's PLAN files only, every job reports "not an ACT" and exits 0, flag on or off.
- **The flag decides a report only.** Given a FAIL, flag absent, `off`, `ON`, `true` or empty: exit 0 with the verdict written; flag exactly `on`: exit 1. Given UNKNOWN: the same.
- **hold Act says it cannot tell.** Given any ACT, hold Act answers UNKNOWN with its reason, flag off exit 0, flag `on` exit 1.
- **The pull request is data.** Given the workflow source, `pull_request` and never `pull_request_target`, no token, the second checkout has no credentials and is never installed or run, the judge is the default branch's.
- **One reading of the tree.** Given the library `tree-facts.mjs`, the Dispatcher and the runner import it and neither holds its own reader.

The Cases travel with the source in the DO (the phase judge that would excuse a RED Case at PLAN does not exist yet).

## Ids

Change `release/C122`, Intent `release/I65`, Requirement `release/F90`, Architecture `release/A101`; no new control: release/CTL24, CTL29, CTL30 and CTL31 stay the controls, and their `designed` becomes a reading of their evidence. The drafts are in `interface.md`.

## DO

On the merged PLAN, into this collector, with the Cases:

1. `05-src/phase/lib/tree-facts.mjs` (moved from the Dispatcher's reader when release/C116 is on `main`; until then the collector carries a copy that the Dispatcher's Change replaces), `05-src/phase/run-act-judges.mjs`, `05-src/wiring/workflows/act-judges.yml`, the elements of `interface.md`, and the Cases.
2. The accept list: none expected.

## What this does not do

It installs nothing and changes no `.github`, ruleset or variable. It does not require a check, does not turn a flag on and does not make any ACT control preventive. It does not judge anything for pull requests that are not into a collector.

## ACT

A 4L retrospective in the ACT before the promotion; one retro for the collector.
