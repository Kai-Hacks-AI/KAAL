# C1 change

## PLAN

This amendment reconciles the Change with what `main` holds now and with the split of the controls. `reconcile.md` classifies every document, element and Case, and every earlier step. `evidence.md` observes the baseline against `main`.

1. Valid and delivered on the collector: the layout, I1, F1, A1 to A13 and D1 with their Cases, and C1 with its Cases T29 to T33. Nothing of it is on `main`.
2. Valid, interim: the expected-RED runner `run-red.mjs` and the baseline stand-in `baseline-judge.mjs`. They are removed when Testing provides expected-RED execution on `main`.
3. Superseded: the claim that the PLAN has accepted RED. That rested on the stand-in, which is not `main`, and the baseline of this Change is `main` (`evidence.md`).
4. Rebuild the expected RED against `main`. The unconditional markers T19 and T29 to T37 are now Cases that assert intended behaviour and fail on an assertion against `main`, as the Cases of create Plan do, and they pass on the collector where their targets exist. T16 is re-expressed with A2 in DO step 5. T17, T18, T26 and T27 are removed or moved with their elements in DO step 5. A missing module is not RED, so the Cases that import the judgment (T1 to T15, T20 to T25, T28, T38 to T42) cannot supply it: they are green only where the judgment is.
5. Review each file by hand for language: migration wording under `00-changes/`, standing target state elsewhere.

## DO

The Change is the whole lot, and it closes only when verify Plan is on `main` and wired. It reaches `main` after create Plan and in separate promotions, because Change Isolation keeps `.github` and engineering apart. Each promotion needs the Owner's go.

1. Judgment, so that the F1 Cases pass (#1384, on the collector).
2. Readers and the check body, with the interim runner writing the evidence rows (#1386, on the collector).
3. A check that covers every PLAN pull request, whatever its capability, limited to what only verify Plan does (see Scope). #1389 is parked; its pieces are rehomed or dropped when this step starts.
4. Bring the collector level with `main` by a SYNC, so that create Plan and the check of the PR body are in the tree that this Change is judged in.
5. Reconcile the documents with the classification of `reconcile.md`, one concern per pull request: F1 cites F2 and F3 and no longer restates what create Plan owns; A8 to A11 move to a portable branch of A1, beside the GitHub adapter; A3 and A4 and their Cases T17 and T18 are removed, because the template is create Plan's; A12, A13 and their Cases T26 and T27 leave this Change for the preventive control. No implementation moves in this step except the elements named.
6. Promote the engineering collector to `main`.
7. Deliver the `verify Plan` workflow (A5) in its own `.github` pull request, once the engineering code is on `main`. The workflow takes the judge and the runner from the target branch and the plan from the pull request. Test the complete adapter path with a throwaway PLAN pull request before anything requires it. It runs beside the envelope check of release/C12, which it does not repeat.
8. Rename each passing Case from `T<n>.red.mjs` to `T<n>.test.mjs` and wire it into its lane. A promotion carries red markers only for Cases whose target lies outside the promoted paths, and the pull request names each of them.

Not in this Change: the PLAN pull request template, which is create Plan and is on `main`; requiring the status `verify Plan` before a pull request merges, which is the preventive control `guard Integration` with its own PLAN and the Owner's go.

## ACT

1. Record what the first enforced PLAN shows, and adjust F1 through a new Change. Record the learning on contamination of the PR body, with the pull requests #1406 and #1407 as regression examples.
2. Close C1 and its Gaps once verify Plan is on `main` and its workflow is wired.

Open for the Owner and the CPO: whether C1 waits for `guard Integration` before ACT, or closes when verify Plan reports on every PLAN pull request and enforcement is its own Change.

## Scope

Cross-cutting conformance of a pull request is not verify Plan. The body checks of release/C8 (on `main`) and the envelope check of release/C12 (on its collector) cover, for every PR type: title shape, body structure derived from the declared template, contamination, route, and for PLAN, DO and ACT the agreement between the Change id in the body and the `Driven-by` trailer of every commit. This Change does not repeat any of it, and it reads the Change id from the body's Change chapter and not from the title.

What only verify Plan does, and what stays here: rules 1 to 7 of F1 over the PLAN files (drivers and Gaps, Requirements serve Intents, Architecture addresses, Case targets, ids and placement, a meaningful observed RED, Change-oriented and target-oriented Cases apart), the verdict with findings and Recovery where UNKNOWN never passes, and the one adapter check that the changed files lie under the capability folder of the Change.

Taken out of this Change: the `Driven-by` trailer check of `check.mjs`, the reading of the Change id from the title, and F1 rule 8's parsing of template headings. They belong to release/C12 and release/C8.

## Dependencies

create Plan owns the structure of a PLAN (F2) and the interface that presents it (F3, A14 to A16). verify Plan consumes both and redefines neither. Testing owns expected-RED execution, Case design, identity and placement, and the In, Stock and Out model. The common metamodel owns the relationship vocabulary, and the common control contract owns verdict semantics. verify Plan consumes them. This Change does not define them, and does not bring Guard or gate ownership into scope.

## Later

The language review of PLAN step 5 can become a Case for verify Plan. The judgment of the whole PR body against F3 and F13 can become Cases that reuse release/C8, with the contaminated bodies #1406 and #1407 as regression examples.
