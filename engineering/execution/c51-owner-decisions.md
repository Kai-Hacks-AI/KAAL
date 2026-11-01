# C51 adoption: concrete decisions and acceptance proposal

Status: proposed for Owner/Core/Testing review, not an accepted decision or DO authorization. This addendum makes #787's open points reviewable; its CI transcript and unknown fields are unchanged. #787 remains draft, auto-merge off and unmerged under the Owner's current integration hold. No dependency is transferred and no execution is suppressed.

## D1 — Preserve Core's current invocation contract

**Recommended decision:** treat Core's publisher and standalone boundary invocations as independently required under the current accepted source-runner contract. Reject the observed repeated-label candidate for Engineering run sharing at this stage. Identical labels and two passing outputs do not qualify equivalent executions.

Why: `core/A34`, `core/F75` and `core/T80` require every declared source suite to run, continuing after failures. The existing opaque scripts rebuild and inspect artifacts in separate invocations; no accepted loaded-byte/configuration binding establishes that one original observation can satisfy both. Engineering cannot replace those invocations with a cached result or amend Core's immutable runner Cases.

This disposition clears an unsafe candidate from the adoption scope; it does not claim that both runs can never be redesigned. If Core later wants to remove overlapping file membership, it can propose a separate Core-owned Change that preserves every Case, the standalone boundary entrypoint, the source runner contract and publisher obligations. For example, disjoint publisher/boundary membership would need explicit review of what direct publisher execution promises. That is not implemented or authorized here, and any saving belongs to that Core correction rather than being credited to an Engineering C51 adapter.

Engineering can continue developing a generic, qualified orchestration contract against controlled fixtures. A live run becomes shareable only when its owner supplies an accepted execution contract and independent equivalence evidence. Until a real CI candidate meets that contract, adapter use is observational and current CI saving remains unestablished. Local comprehensive-runner overlap is not substituted for a live CI benefit.

**What approval records:** Core's current invocations stay intact; this candidate is ineligible for suppression. No Core package/test/script change is requested by D1.

## D2 — Prepare an isolated Testing dependency, with explicit adaptations

**Recommended delivery decision:** authorize preparation and review of a Testing-owned, main-based C51 dependency Change, separately from Engineering's adapter. Use a focused `kaal/testing-duplicates` delivery collector when that Change is authorized to be raised; do not move or reset the existing `kaal/testing` collector. This addendum itself creates no collector or dependency PR and promotes nothing.

The source anchors are C50 at `dc9bec4ca58b6527c9aae136f86fb5a7b01094cb` and C51 at `79524490a219b9f622052047d891f2bd30e631b6`. The inspected target is main `be3a2d09a386967bd5a1cd4a850f389951bc0796`. Refresh and verify the actual target before constructing the dependency Change; a moved main is not permission to re-establish an occupied collector.

The reviewable transfer inventory is:

| Exact target path / surface | Proposed disposition |
| --- | --- |
| `packages/skills/kaal-testing/lib/duplicates.mjs` | Preserve C51's exact module bytes and public `duplicates`/`schedule` semantics. No timing/redesign import, new runtime dependency or algorithm fork. |
| `packages/skills/kaal-testing/plan/duplicates/{intent,requirements,architecture,testing}.md` | Retain the four approved C50 source documents and provenance. Record the target adaptations as a new Testing PLAN; do not rewrite C50's historical dependency statements. |
| `packages/skills/kaal-testing/test/plan/duplicates.test.mjs` | Explicitly approve a new helper/file version before DO, solely to adopt Foundation as specified below. All six Case titles, assertions, fixtures, expectations and scheduling semantics remain unchanged. Preserve the old version by its source commit. |
| `packages/skills/kaal-testing/test/duplicates-inputs.test.mjs` | Preserve C51's two additional discrimination Cases, including file-path/Node separation and independent executions. |
| `packages/skills/kaal-testing/test/acceptance/duplicates.test.mjs` | Relocate C51's existing `test/engineer/duplicates.test.mjs` scenario to the location main's accepted discovery actually reads. Scenario bytes/assertions remain unchanged. Do not import discovery C44 or migrate any other scenario. |
| `packages/skills/kaal-testing/test/engineer/duplicates-mutations.mjs` | Preserve the mutation challenges and engineering-only execution. Keep it outside npm's normal source suite and retain the altered-script challenge for T109. |
| `packages/skills/kaal-testing/test/engineer/duplicates-evidence.json` | Generate a new target-specific receipt from actual runs. Do not copy the old target's GREEN counts as proof of this candidate. |
| `packages/skills/kaal-testing/package.json` | Add `./duplicates`, add the two source test files once, and add the exact Foundation development dependency required by the helper. Preserve every existing selection, runtime dependency, package name/version and delivered-file scope. |
| `packages/skills/kaal-testing/test/testing.test.mjs` | Extend the existing exact packed-file inventory by `lib/duplicates.mjs` only. Keep every existing expected member and assertion; do not transplant the collector's newer release inventory. |
| `packages/skills/kaal-testing/README.md` | Add the bounded public duplicate API usage/limits. Do not import unrelated consumer-verifier promises or the collector's complete six-document release set. |
| Root `package-lock.json`, Testing workspace entry | Regenerate/independently verify only the required Testing development-dependency change using the target's existing lockfile. Engineering reviews this supporting root metadata. No new root workspace or root script is proposed. |
| A new Testing-owned source PLAN/trace record | Record D2's approved scope, target adaptations, source versions, immutable Case revision and actual verification. Use the target's accepted Change numbering/admission rules rather than inventing a number in this Engineering addendum. |

### D2a — Exact Foundation helper correction

The old test imports `createHash` from `node:crypto` and its T109 helper is:

```js
const sha = (p) => createHash("sha256").update(readFileSync(join(PACKAGE, p))).digest("hex");
```

The proposed new version imports `sha256` from the public `@kaihacksai/kaal-foundation/sha256` export, removes the `node:crypto` import and changes only that digest helper to:

```js
const sha = (p) => sha256(readFileSync(join(PACKAGE, p)));
```

Declare `@kaihacksai/kaal-foundation: "0.0.1"` as a Testing development dependency, matching the existing main workspace package. The source test is not shipped; this adds no runtime dependency for the duplicate API or its packed consumer. Foundation's digest algorithm is consumed, not copied or re-tested exhaustively here.

This is an explicit PLAN-owned helper-version correction for target compatibility, not permission for DO/CHECK to edit an immutable helper. Review/admit that exact correction before implementation. Demonstrate old/new file-digest agreement over the selected real test files and preserve the complete T104–T109 and mutation discrimination on the actual candidate. If the diff changes an assertion, fixture or other helper behavior, stop and return it for Testing review.

### D2b — C38 and installed verification

For this bounded dependency, propose that C38's final publisher/consumer layout is not a prerequisite to exposing and exercising the pure API on main's existing layout. T109 still validates the exact target's own source scripts. This is an explicit sequencing adaptation requiring Testing/Owner agreement; it does not amend C50 by implication.

Retain direct packed API acceptance through main's existing `test/acceptance` discovery. Do not claim the installed `npm test` verifier, release readiness, scoped rename, publication or C38 integration is complete. When the full Testing collector later receives the dependency through governed main synchronization, reconcile the same Change/module and the approved helper/scenario versions; do not retain two competing implementations or select the Cases twice.

### D2c — Required dependency verification before admission

On the exact dependency target: existing Testing source tests plus T104–T109 and the two added Cases; all 34 mutation challenges by behavioural assertion; package export/file inventory; fresh caller-packed public API acceptance; and the unchanged repository assurance matrix across supported hosts. Preserve all failures, skips, uncertainty and provenance limitations. A missing module is blocked evidence, not behavioural RED. Baseline assertions, C51 implementation bytes and transferred scenario bytes must be compared with their source anchors; list every intentional adaptation above.

No existing collector is promoted by D2 approval. After independent review/CI and separately authorized dependency promotion in the Owner's queue, synchronize main into `kaal/ci-execution` by merge commit. Engineering's adapter remains a separate Change. If the bounded dependency is not approved, retain the original normal-Testing-promotion prerequisite and do not import the 111-path collector delta.

## Proposed Engineering acceptance boundary

These are proposed predicates for the subsequent contract/Cases review. They are not executable GREEN, immutable accepted Cases or permission to implement now. Their implementation and fixture/port shapes must be reviewed and frozen together before DO.

| Proposed Case | Required predicate |
| --- | --- |
| E-D01: qualified identical requests | One execution and a read for every requester; every read points to the original observation. |
| E-D02: original failure | Every reader retains the same failure and diagnostics; no retry or replacement verdict. |
| E-D03: original uncertainty | Every reader retains unknown/completeness gaps; no successful empty work. |
| E-D04: each Testing identity dimension | Changed file path, bytes, subject, platform or Node produces separate executions. |
| E-D05: wider execution conditions | Changed arch, cwd, flags/loader, dependencies, fixture/seed or coverage mode partitions domains before calling Testing. |
| E-D06: independently required contexts | Even identical Testing tuples stay separate when the owner requires independent assurance; include Core's D1 decision and Guard T106. |
| E-D07: invalid request mixed with valid | Findings remain visible; no original obligation disappears or is treated as completed from an invalid empty schedule. |
| E-D08: opaque entrypoint | Without an owner-approved execution contract, preserve the original script, lifecycle and outcome. |
| E-D09: missing/ambiguous loaded-byte binding | No qualification for sharing, no guessed version and no selection of the fastest/GREEN event. |
| E-D10: incomplete or substituted population | Missing, cancelled, skipped or stand-in Case retains the original failed/unresolved assurance; no omission is hidden. |
| E-D11: boundaries between runs | No sharing across job, attempt, workflow, host, fresh consumer or RED/GREEN subject; no retained cache. |
| E-D12: pure owner ports | Unit tests inject Testing's public scheduling/duplicate ports and Hosting execution seams, proving orchestration without duplicating owners' algorithms. |
| E-D13: real interfaces | Separate contract/packed tests prove the actual export, original observation binding and supported execution path; port stubs are not provenance evidence. |
| E-D14: original exit/run-to-end | A failed/unknown required result and required later work survive analysis, scheduling, reporting and their exceptions. |
| E-D15: mutation discrimination | Kill extra execution, lost reader, overwritten failure, omitted Case, changed entrypoint, dropped domain dimension and cross-job reuse through assertions. |
| E-D16: live candidate and measurement | Require an independently admitted real CI candidate and the three-host matched before/after evidence from #785 before any activation or saving claim. Controlled fixtures and the rejected Core candidate do not satisfy it. |

The next executable contract Change should name its public operations, exact domain/observation inputs, authoritative qualification ports and error behavior, then freeze those tests and their meaning-bearing files. A candidate's own `qualified: true` claim must never be accepted as independent authority. Until that boundary and a real candidate are approved, observational analysis may be prepared without changing the original verdict or executed population.

## What a review can decide now

- **D1:** preserve Core's current required invocations and reject this candidate for sharing.
- **D2/D2a/D2b:** accept or reject this exact narrow Testing dependency route and its two target adaptations, before a separate Testing-owned PLAN/DO.
- **Acceptance scope:** review E-D01–E-D16 as the obligations of the future immutable contract/Cases Change.

None of those decisions is inferred from silence, green CI or the existence of this document. The current integration hold, draft status and auto-merge-off instruction remain in force.
