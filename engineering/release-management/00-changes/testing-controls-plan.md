# The testing controls and their lanes (PLAN)

PLAN, nothing is built or retired by this Change. It is the PLAN for test Integration (F16, into a collector) and test Candidate (F12, into `main`), which share the FAR rule (F18). The Owner's direction (9 Nov): argue each present lane from intent, keep it only if a control's Requirement needs it, retire the rest; a lane is not kept because it runs today.

## Finding

The testing controls have no lane of their own. The present checks are the jobs of the workflow `KAAL` (`ci.yml`), named by what they run, not by a control: `Hosting (Windows|Linux|macOS)`, `Acceptance (Windows|macOS)`, and the matrix lanes `Workspaces`, `Acceptance`, `Engineering`, then `Guard`, `Guard (Windows|macOS)`. Only some are required on a collector, which is how a change merged with `Acceptance (Windows)` red (#1331). None is traced to F12, F16 or F18.

## What a testing control must establish (from F12, F16, F17, F18)

1. **Regression:** the target's own Cases, as `main` holds them (pinned, F17), still pass with the candidate. No Case of the target is missing, edited or skipped without an Accepts entry.
2. **Features:** the Cases the candidate adds or changes pass, as candidate code.
3. **Accepts:** every applied exception is visible in the check output.
4. **What a consumer installs works** on the hosts we support. This is not a separate control: it is the Regression of the packages we ship (Intent I2, I5), judged at the candidate's own bytes.

A lane is needed only if one of these four needs it and no other lane already establishes it.

## Where the release judge runs on a package change (asked by the Hosting thread, 9 Nov)

Packages no longer carry copies of Engineering's release judge (`readiness`, `verification`), so a pull request that touches a package would get no early signal. The proposal: the judge runs **once, in Release management, as a Regression Case of test Integration (F16) and test Candidate (F12)**, against **every package the candidate touches**, on the candidate's own packed bytes. `readiness` runs from the first step (exact runtime versions, a version greater than every published one, required providers present); the installed `verification` joins it as soon as the Owner decides G12 (optional peers), and until then it is reported as not judged for a package that declares one, never as passed. Release management owns it, as part of the testing controls; a package's thread asks for nothing and adds nothing to its own suite. *version Package* (F3) at `main` stays the judge that binds a release; this is the same judge, run earlier, so a defect is found on the pull request and not at release preparation. The package set is read from the candidate's changed paths by the workspace manifests with a parser, never from a list.

## Lane by lane (proposed; verdicts are the Owner's)

| Lane | Proves | Needed by | Proposed verdict |
| --- | --- | --- | --- |
| `Workspaces` | every package's own `npm test` (embedded Cases), but Hosting's | 1, 2: the packages' own Regression and Features | keep, as the testing controls' lane for package Cases |
| `Hosting (Windows, Linux, macOS)` | Hosting's `npm test` on each host | 1, 4, and Hosting's own intent that a case is the same on every host (hosting/I10) | keep, the host matrix is Hosting's requirement; fold into the same control as `Workspaces` |
| `Engineering` | Engineering's own Cases (`test:engineering`): the Delivery Cases, this documentation, the engine | 1, 2 for Delivery | keep |
| `Acceptance` (Linux lane) and `Acceptance (Windows, macOS)` | a fresh install of the packed packages into new repositories, as a consumer would | 4, the one place where the packed bytes are installed | keep, but one definition, run per host; the Linux run is the matrix lane and the other two are the same lane on other hosts, not three lanes |
| `Guard` (Linux) | Guard's package suites and the shipped acceptance | 1, 2 | to verify: `Workspaces` runs Guard's `npm test`. If these suites are the same files, retire `Guard` as a duplicate (one place); if it holds extra shipped-acceptance Cases, move them to `Acceptance` |
| `Guard (Windows, macOS)` | the same suites on the other hosts | 4 for a shipped package (Guard) | keep only the host dimension Guard's own requirements need; to verify against Guard's requirements, otherwise retire |

**Evidence for a retirement (CPO review of this PLAN).** Two lanes cover the same ground only if, for every Case they run, all of these match: the Case (by id, not by file or command), the host (operating system), the installed artifact (the packed tarball or the source tree), the environment (Node, dependencies, working directory, variables) and the execution context (pull request, merge group or push; candidate or `main` copy). Matching files or commands is not enough. For each proposed retirement the Change records this comparison, Case by Case, as its RED evidence, and the Owner decides separately; a lane whose comparison shows any difference is kept or merged, never retired.

Everything marked "to verify" is verified first, as the first RED of the Change, by reading what each lane runs with the parsers already in Engineering (YAML for the workflow, the lane plan `lanes/plan.json`), never by reading names. A lane whose Cases another lane already runs is retired; its host dimension survives only if a requirement names it.

## Shape of the controls

- test Integration (F16) and test Candidate (F12) are each one control, realized in `lanes/` with its jobs named by the control (`test Integration`, `test Candidate`), one job per kept lane and host. The two gates `gate (integration)` and `gate (promotion)` need exactly these jobs (F18 reading `far.json`, interim and marked temporary: `interim-states.md`).
- **Gate behavior is fail-closed (CPO review of this PLAN).** For every lane and host a control expects, the gate judges one of: passed, failed, or no outcome. A lane that is skipped, missing, conditional (a path filter or an `if`), cancelled or on a host that is unavailable counts as no outcome and fails the gate. The only door is a FAR Accepts entry that names the lane and host, with its reason and decision. A retained lane need not be a separately required context: a gate may aggregate the evidence of several lanes into one required context, as long as it reads each expected lane and host from the control's own list, so that no required coverage can disappear by a job being renamed, dropped or skipped. A Case judges this with a fixture workflow in which one expected lane is missing, one is skipped and one is conditional.
- Every kept lane is judged by its gate, separately or as aggregated evidence. A lane that is not needed by a control is not run and not required.
- Windows `Acceptance` failing with "host directory is not empty" (#1331) is a defect to be fixed in Acceptance or Hosting before the lane becomes a required gate. It is recorded as a Defect and does not wait for this Change.

## Sequence

1. This PLAN, CPO review, merge into the collector. A landed PLAN is a go for steps 2 to 4; the gates and any ruleset change keep the Owner's own steps.
2. RED: a Case that lists the lanes of `ci.yml`, parsed, and fails for each lane that no control claims, naming it; a Case per proposed retirement that compares the two lanes Case by Case, host by host, artifact by artifact (see the evidence rule above) and fails if coverage would disappear; and the fail-closed Cases for a missing, skipped or conditional lane.
3. DO, engine first: the lane definitions move into `05-src/lanes/` with the FAR reading interim, parity Cases pinning that each kept lane runs what it ran.
4. DO, `.github` only: the jobs named by the control, next to the old ones. The Owner adds the contexts to the rulesets; the old lane names retire after (transformation, step 3).

## Not in this Change

`kaal-change/far` itself (the interim stands in), any ruleset or required-context change (the Owner's), promotion into `main`, and the fix of the Windows defect.
