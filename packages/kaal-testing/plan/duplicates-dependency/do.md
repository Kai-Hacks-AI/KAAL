# Focused Testing dependency DO under PLAN #793

This delivers accepted C50/C51 semantics on the main-based `kaal/testing-duplicates` collector. Parent PLAN commit: `4de4808010ee9193af3d2aaa25ceb6fb2b9143d4`. It preserves `kaal/testing` and carries no unrelated collector feature. The new APIs have no live Engineering CI consumer, so current CI performance saving from this delivery remains zero.

## What changed

The pure `lib/duplicates.mjs` is byte-identical to C51 `7952449`; so are the added discrimination Cases, mutation runner and packed public-interface scenario. The four historical C50 contract documents are unchanged. The approved Foundation helper version in T104–T109 is byte-identical to merged #793; no assertion, fixture or helper changes in this DO. The packed scenario's bytes are unchanged, at `test/acceptance/duplicates.test.mjs`, which this target already discovers.

The package adds the public `./duplicates` export and selects the six planned Cases and two additional Cases once. Its exact packed-file inventory adds only this module. Foundation `0.0.1` is declared as a development dependency for the unshipped helper. Independent lock comparison proves that this is the only lockfile change. Package name/version and existing runtime dependencies are unchanged. The README describes the public API, original failed/unknown observations and independent execution/provenance limits.

No installed `npm test` verifier, C38 release layout, scoped rename, timing/redesign, model/verifier or discovery migration is included. No Core source, Case or invocation changes. No workflow, required-check or protection change and no cross-job result cache.

## Verified locally

Linux, Node v24.22.1:

- `npm test -w kaal-testing`: 78 passed, zero failed/skipped; all 70 existing source Cases plus the six planned and two additional Cases.
- `npm run test:acceptance`: 33 passed, zero failed/skipped; six packages packed once; four scenarios/fresh installations. The added scenario consumes the actual packed public API and preserves failed/unknown observations and independent executions.
- The unchanged mutation runner kills all 34 challenges by assertions against this target. Its callable inert substitute yields behavioural RED on T104–T108; T109's valid layout is GREEN and its injected duplicate script is RED. Missing-module errors are not counted as kills.
- Exact source-byte comparisons for eight transfers, the frozen Case-file comparison, runtime identity/dependency comparison and independent lock delta comparison pass. `do-evidence.json` records paths and Foundation hashes. The target-specific mutation receipt is in `test/engineer/duplicates-evidence.json`.
- The acceptance harness still reports physical containment and absence of unrecorded installations as unknown. These are not passing assurance.

Exact-candidate Linux/macOS/Windows CI and independent DO review remain required; local Linux is not a three-host claim. Source hashes identify bytes, not who executed them or authority to reuse observations.

## Integration boundary

Land this bounded DO by squash into `kaal/testing-duplicates` only after independent review and required CI. No self-approval, immediate merge, automatic promotion or npm publication. A separately authorized focused collector promotion into main must satisfy freshness and the current priority/order, then separately synchronize main into `kaal/ci-execution` by merge commit. Reconcile the full Testing collector's later receipt of this Change through its own reviewed synchronization, retaining one implementation and one selection per Case.

Engineering's accepted E-D01–E-D16 boundary is now on `kaal/ci-execution`; its real Testing dependency remains unavailable there until that governed main route completes. The earlier Core duplicate candidate stays rejected under D1. No adapter implementation or live suppression is introduced here, and no timing saving is credited from Guard C136.
