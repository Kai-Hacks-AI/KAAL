# verify Envelope: the pull request body and title are the Change's stable envelope (PLAN)

Change `release-management/C8`, control **verify Envelope** (the exact check name `track Work` already reads, #1363 and #1364; keep it). PLAN, nothing is built. The failing Cases T46 to T52 are in `04-test/verify-envelope.red.mjs`, carried unwired. This PLAN makes the proposal in `development-hooks-plan.md` ("CI check: the existing envelope control, extended") a numbered Change of the overarching plan to get release management into `main`, for the CTO and the CPO to align on (Owner, 10 November 2026).

## Intent

Every pull request carries the Change it belongs to in a **stable envelope**: its body follows `.github/pull_request_template.md` (Intent, Design, Verified by, Validated by) and its title says which Change and which phase (`<capability>/<C-ID> <PHASE>: <concern>`). Execution history lives in comments, reviews and checks, never in the envelope. A control that reads the envelope as a fact is what lets `track Work` report each piece of Work, Review judge the right Change, and the squash message carry its reason to `main`.

## What it verifies (verification, deterministic; whether the Change is the right one stays Review's validation)

1. **Body, parsed with commonmark, never a pattern over prose.** The headings `Intent`, `Design` (optional), `Verified by`, `Validated by` appear as headings, once each, in that order; a heading-like line inside a code block does not count. The `Intent` section holds text beyond the template's comment. Trailing attribution lines are allowed.
2. **Title form for a Change.** `<capability>/<C-ID> <PHASE>: <concern>`: a known capability, a numbered C id defined once in that capability's register (the same id parser as the commit check, one place), a PHASE from the closed list `PLAN`, `DO`, `ACT` (neither `RED` nor `CHECK`), and a non-empty concern.
3. **Promotions and synchronizations keep their forms**, chosen **from the lineage, not from the title**: base and head parsed by the lineage controls that already classify them (promotion Source, Branching). `PROMOTION <lineage> -> main: <summary>` and `Synchronize <lineage> with main` carry no Change and no phase. A Change-form title on a promotion or synchronization, or a promotion form on a Change, fails.
4. **Fall forward.** Pull requests opened before the activation boundary, and the in-flight ones registered against C2 to C5, are **not applicable**, never blocked retroactively (CPO, #1357). The boundary is a trusted value read from the base, never a timestamp the candidate supplies.
5. **Missing facts are no evidence.** If the title or body could not be read, the verdict is not a pass.

## Recovery (the contract of the recovery Cases)

A failing verdict names the field and the fix as a command whose event re-runs the check, for example `Recovery: gh pr edit <n> --title "<form>" (re-runs on: edited)` and `Recovery: gh pr edit <n> --body-file <file> (re-runs on: edited)`. The check runs on the `edited` activity type, which is why this control does not depend on `pull_request_target`: it reads the title and body from the event payload of a `pull_request` run, with no secret and no candidate code, in the design that the policy and GitHub's 2 December 2026 block require.

## Station and placement

Station: **Integration** (the pull request into a collector), a preventive control. Born in KAAL: `05-src/envelope/`; the earliest stage is integration, because a hook has no pull request (`earliestStage` says so). Naming: jobs are named by control, so the check is `verify Envelope`. It is not a required context until the Owner decides (a gate change is not part of this PLAN).

## Use or build

Use the commonmark parser (`records.mjs` and the commit/title id parser from the hooks Change); use the lineage controls for what a promotion or a synchronization is. Build only the judgment over title, body and kind.

## Cases (T46 to T52, unwired)

T46 the body headings by parsing. T47 an empty Intent fails. T48 the title form. T49 the kind comes from the lineage, not the title. T50 fall forward by a trusted activation boundary. T51 missing facts are not a pass and failures carry a recovery with an event that re-runs the check. T52 the exact check name `verify Envelope` (which `track Work` reads).

## Open for the Owner and CPO

- The activation boundary: which base value holds it, and who sets it.
- Whether `verify Envelope` becomes a required context, and when (a separate gate Change).
- Whether `Design` stays optional.
- How the C-id parser is shared with the commit `message` check (one place), once that DO lands.

## Sequence

1. This PLAN, CPO exact-head review (Cases written here, unwired).
2. DO (`release-management/C8 DO`): the pure judgment in `05-src/envelope/`, the Cases wired in the same pull request that makes them pass; the `.github` job as a separate step with the Owner's go.
3. ACT: what the first uses teach.

Nothing is wired, activated or changed by this PLAN.
