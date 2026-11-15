# Pull Promotion: expose the delivery candidates and consume the verdicts that already decide OUT and IN (Change A to B)

This is `pull/C13`, a PLAN Change. It ships no code, installs nothing, changes no workflow, ruleset or declaration and opens no PR. It is the first slice of the CTO assessment of 15 Nov 2026 (`pull-promotion/true-pull-architecture-assessment.md`, section 6, step 1), revised after the CPO review of #1694. It authorizes preparation, not promotion or publication.

## Principles (CPO)

- **OUT is universal, its evidence is class-specific.** A source stock is OUT-ready only when (1) the Intent is fulfilled, (2) the delivery is correct and (3) the Change is complete, all PASS. KAAL PROMOTION, HOTFIX and WIRE prove these with different files, Cases, lifecycle records and procedures. The gatherer therefore consumes **one common verdict with its exact revision and producing authority**, never a common evidence structure, and requires no Change-folder layout of any class.
- **Passing development CI is not OUT.** A collector may be green in CI while planned RED Cases remain; that is valid development admission. OUT must reflect actual GREEN without development-time exemptions plus a completed Change lifecycle. Missing evidence or traceability is UNKNOWN, never PASS.
- **IN belongs to the destination.** It is the result of the actual merge checks and protections of `main` on the delivery PR. Pull does not copy that policy. Until the delivery PR exists and its checks have run, IN is UNKNOWN.
- **C13 implements neither stock readiness nor destination admission.** It discovers, reads and consumes.

## A: the present

`laneStep` (pull/C10) and its `deliveries` selection (pull/C11) judge candidates `{class, source, name, out, in}`, but nothing produces them. A person writes the list, and HOTFIX and WIRE heads are not seen at all.

## Trace of the existing authoritative mechanisms (read on `main`, 15 Nov 2026)

| Class | OUT: what exists | OUT: missing connection | IN: what exists | IN: missing connection |
| --- | --- | --- | --- | --- |
| KAAL | The Pull Promotion qualification (`pull-promotion.mjs`, run by hand): PLAN and DO files, expected Cases green at the exact head by scoped id, one concluding 4L ACT. | It does not separate development-time RED from GREEN, does not trace the affected Intents to the applicable product Cases, and publishes no verdict with a revision and an authority. Change Isolation by reverse traceability is not on `main`. A producer of the OUT verdict is missing. | The `old promotion` ruleset: required checks (Change Isolation, Branching, Promotion Source, CI jobs, code scanning), CODEOWNER approval, merge queue. The delivery PR is `kaal/*` into `main`. | None for Pull: it reads the PR's checks. |
| HOTFIX | The `hotfix` PR template (four chapters), the KAAL Defect reference check (release/C23) and the nine Hotfix Cases. Today the route is the collector `kaal/hotfix` (`branching.md`). | No producer says "the correction is complete: RED Case now GREEN, Defect recorded". The target branch name `hotfix/<name>` is not realized. | Same ruleset. Promotion Source passes only `kaal/*` heads (`lineage.ts`), so a `hotfix/<name>` PR cannot pass IN today. | Admission of the class is Engineering's later Change; Pull sees UNKNOWN or FAIL until it exists. |
| WIRE | The install judge `wire-judge.mjs` on `main` (release/C27, A47): targets equal their sources, sources on `main`, moved files match their declared sha256. | The judge is not yet a published check with a revision and an authority. Wiring it is Owner-gated. | Same ruleset, `wire/<name>` heads not admitted by Promotion Source today. | Same as HOTFIX. |

C13 closes none of the missing connections. It makes the gatherer ready to consume each one the day it appears, and until then every missing one reads as UNKNOWN.

## B: the target

A **gatherer** turns facts read from the host into the `deliveries` that `laneStep` takes, and invents nothing:

1. **Candidates by class.** Every head ref that starts with `hotfix/`, `wire/` or `kaal/` is a candidate of that class; any other ref is ignored. No evidence layout is required of any class.
2. **OUT is a consumed verdict.** For each candidate, `out` is `PASS` only when a verdict `{verdict, revision, authority}` exists for the source with verdict `PASS`, `revision` equal to the candidate's head SHA and `authority` equal to the authority the class registers for OUT. A `FAIL` at the exact head is `FAIL`. A missing verdict, another revision, an unregistered authority, `held` or any unrecognised value is `UNKNOWN`. The gatherer inspects no evidence behind the verdict.
3. **IN is read from the destination.** `in` comes from the delivery PR into `main` and the protections `main` actually has: with no PR for the candidate's exact head, or when the required checks of `main` cannot be read, it is `UNKNOWN`; with a PR, it is `PASS` when every check `main` requires has succeeded at that head, `FAIL` when one has failed, otherwise `UNKNOWN`. No list of IN checks is stored in `declaration.json`.
4. **Read-only and inventing nothing.** The reader uses GET calls only; what it cannot read stays UNKNOWN. No value, size or unit is recorded.

## Not in this Change

No producer of OUT verdicts for any class, no admission of `hotfix/*` or `wire/*` heads, no scoped execution of Engineering Cases, no dry-run caller, no workflow, no GitHub App, no ruleset, no recorded value, size or unit. `laneStep` is unchanged and has no approve or merge action.

## Open points for the CPO

1. **Authority registration.** Where the authority a class registers for OUT lives (proposed: the Guard registration of #1652 once on `main`, not `declaration.json`). Until then the caller supplies it and the tests pass it as input.
2. **Verdict carrier.** How a producer publishes `{verdict, revision, authority}` (proposed: a check run on the exact head whose output carries them). Producers are later Changes; the gatherer only needs the shape.
3. **Held.** The Guard result `held` is UNKNOWN.
4. **Dependency.** The DO needs `laneStep` and the `deliveries` shape on `main`, so it waits for `kaal/release/pull-lane`. This PLAN does not.

## Order

PLAN (this), then DO (the gatherer in the Script, the GET-only reader beside `read.mjs`, README, T430 to T433 to green), ACT, a concluding collector-level ACT, SYNC and PROMOTION. Collector: `kaal/release/pull-gather`, from `main`. The OUT producers, the class admission and the dry-run caller are separate Changes.
