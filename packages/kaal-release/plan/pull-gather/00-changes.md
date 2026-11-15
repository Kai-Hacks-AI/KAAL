# Pull Promotion: expose the delivery candidates, with a verdict read at their exact head (Change A to B)

This is `pull/C13`, a PLAN Change. It ships no code, installs nothing, changes no workflow, ruleset or declaration and opens no PR. It is the first slice of the CTO assessment of 15 Nov 2026 (`pull-promotion/true-pull-architecture-assessment.md`, section 6, step 1). It authorizes preparation, not promotion or publication.

## A: the present

`laneStep` (pull/C10) and its `deliveries` selection (pull/C11) judge candidates `{class, source, name, out, in}`, but nothing produces them. A person writes the list. Pull Promotion therefore decides on facts that nobody gathered, and the only readiness it can derive itself is the PDCA qualification it computes at pull time (pull/C4). Candidates of the classes HOTFIX (`hotfix/`) and WIRE (`wire/`) are not seen at all.

## B: the target

A **gatherer** turns facts read from the host into the `deliveries` that `laneStep` takes, and invents nothing:

1. **Candidates by class.** Every head ref that starts with `hotfix/`, `wire/` or `kaal/` is a candidate of that class; any other ref is not a delivery and is ignored. `name` is the ref without its class prefix, and `source` is the ref.
2. **A verdict per candidate and side, read at the exact head.** `out` and `in` are each `PASS`, `FAIL` or `UNKNOWN`. A class declares, per side, the check contexts that say the stock is ready (OUT) and that `main` would admit it (IN). A side is `PASS` only when every declared context has a completed `success` check run **on the candidate's head SHA**; any declared context that completed with a failure gives `FAIL`; anything else (a missing context, a pending or neutral one, a run on another SHA, `held`, or a class with no declared contexts for that side) gives `UNKNOWN`. UNKNOWN never passes.
3. **No readiness is manufactured.** The gatherer runs no check, qualifies nothing and records no value, size or unit. For a KAAL collector its OUT is the verdict the Pull Promotion report already gives for the same exact head (qualifies, does not qualify, or no report); it is not recomputed. Until the stock publishes its own verdict, a class without declared contexts stays UNKNOWN, which honestly shows that HOTFIX and WIRE heads are not admitted into `main` today.
4. **Read-only.** The reader that fetches the facts uses GET calls only. It opens, approves, merges, comments and dispatches nothing. A fetch that fails gives UNKNOWN for what it could not read.

## Not in this Change

No admission of `hotfix/*` or `wire/*` heads (that is the Engineering Change that extends Promotion Source and Branching), no readiness check on the stock, no scoped execution of Engineering Cases, no dry-run caller, no workflow, no GitHub App, no ruleset, no recorded value, size or unit. `laneStep` is unchanged and still has no approve or merge action.

## Open points for the CPO

1. **Where the class contexts are declared.** Proposed: a `classes` section in `declaration.json`, next to the collectors, reviewed like them. Empty for HOTFIX and WIRE until their admission and readiness checks exist.
2. **KAAL OUT.** Proposed as above (the report's verdict at the same head, not recomputed). Confirm that this is not Pull judging readiness by itself, or name another source.
3. **Held.** The Guard result `held` is treated as UNKNOWN (CTO question 3).
4. **Dependency.** The DO needs `laneStep` and the `deliveries` shape on `main`, so it waits for `kaal/release/pull-lane`. This PLAN does not.

## Order

PLAN (this), then DO (the gatherer in the Script, the GET-only reader beside `read.mjs`, README, T51 to T54 to green), ACT, a concluding collector-level ACT, SYNC and PROMOTION. Collector: `kaal/release/pull-gather`, from `main`. Calling the gatherer on a schedule is the later dry-run caller, a separate Change.
