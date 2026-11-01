# Engineering C51 adoption DO

Implements the independently approved #794 `run(input, ports)` contract on `kaal/ci-execution` after focused Testing #796 reached main and synchronization #798 landed. The accepted contract, fixtures, Cases and boundary inventory remain byte-for-byte unchanged. A scoped `.gitattributes` rule prevents Git from rewriting `engineering/execution/**` on Windows: the first Windows run reproduced its digest failure exactly by LF-to-CRLF conversion. Approved hashes and assertions are not normalized or revised. Testing continues to own equality, `schedule()` and `duplicates()`; no copied grouping algorithm or cross-call cache is introduced.

The adapter preserves every original invocation without a trusted activation grant, and every unqualified invocation even with one. Qualified work uses the public Testing plan within contiguous independently qualified domains. An original invocation or another domain is an ordering barrier. This conservative grouping never moves later work across an original operation to obtain more reuse. Consumer reference validation rejects missing readers, invalid run references and plans that cannot account for every declared file; affected originals then run intact. A completed failed/unknown scheduled observation is retained and never retried.

Readers hold the exact original observation object. Case identity, outcomes, incompleteness and provenance are not rewritten. The existing evaluator returns the original verdict object once after required work. Duplicate analysis is advisory and counts actual executions, not readers; incomplete observation evidence remains unknown. Analysis/publication exceptions retain the verdict. Acquisition/evaluation exceptions preserve later required work, are retained in an `AggregateError.report`, and never return a successful report. This error transport is for integration code, not a newly claimed live lane verdict policy.

## Executable evidence

- All 16 frozen E-D Cases pass without assertion or fixture changes. An independently callable inert adapter fails all 16 on behavioural assertions, with no import, syntax or dependency blockage.
- Seven additional tests cover malformed declarations/ports, absent/refused/unavailable authority, invalid schedule bindings, ordering barriers, acquisition run-to-end without retry, missing observations/evaluation and retained failed verdicts: 23 tests, zero skips.
- Eight child-local mutations are killed by the specified frozen Cases: extra execution E-D01, erased failure E-D02, lost reader E-D15, omitted Case E-D10, changed entrypoint E-D08, dropped domain E-D05, cross-context cache E-D11 and activation bypass E-D16. `mutation-evidence.json` records the adapter's Foundation digest and local runtime. The runner reproduces both RED and mutation evidence without modifying accepted files. Missing modules, syntax errors and timeouts do not count as kills.
- `engineering/acceptance/execution.test.mjs` is selected once by existing Acceptance discovery. It verifies frozen digests, runs the 23 tests and eight mutations, and separately installs the lane's once-packed Testing/Hosting into a fresh consumer. The packed transport fixture preserves real child exits 0/1/2, Case outcomes, completeness and original observation references, with two child executions when authorization is absent. It imports only the repository adapter by absolute URL; Testing/Hosting resolve from installed consumer bytes.
- The existing Acceptance lane therefore exercises the added scenario on Linux, Windows and macOS through unchanged CI. Exact-head CI results are recorded on the DO PR; local evidence is not a substitute for those results. Existing Core portability skips remain existing assurance limits, never counted as new passing Cases.

Explicit local commands:

```sh
node --test engineering/execution/test/plan/adoption.case.mjs engineering/execution/test/adopt.test.mjs
node engineering/execution/test/mutations.mjs
npm run test:acceptance
npm run test:engineering
```

## Activation and delivery limits

This is a bounded orchestration component and executable integration fixture, not active CI execution reuse. No production qualification/activation provider, supported original-observation CLI transport or lane adapter is wired. Fixtures' grants, domains, labels and receipts establish no production authority. The packed fixture demonstrates installed public API/child-exit transport, not actual production loaded-byte/configuration equivalence or full release readiness.

The bounded actual-CI investigation in `plan/candidates.json` established no eligible candidate. Core's publisher/boundary repetitions remain independently required under D1; same-labelled Graph/Core files have different subjects, and Guard's diagnostic repetition already uses C136's observation. C136 is already on main and none of its savings are attributed here. This DO changes no live test selection or suppression. Current execution-count reduction and demonstrated CI wall-clock/summed-Case savings: **zero**. There are no matched production before/after measurements; claiming a performance hotfix would therefore be unsupported.

Recommendation: **normal focused collector integration**. Engineering depends on focused Testing C51 already on main, its synchronized public APIs, the existing Testing acceptance collector and the current installed Hosting/Foundation dependencies. No dependency version or package contents change here, and no accumulated Testing/Engineering work is imported. Owner review and required CI remain independent. Land this ordinary Change by **squash** into `kaal/ci-execution`; any later promotion is a separate deliberate collector-to-main squash under freshness and promotion-order policy, not an automatic action of this DO.

Before activation, establish a real candidate with its owner; freeze/review provider and CLI integration Cases; prove exact loaded-byte/configuration and lifecycle equivalence while retaining existing behavior; obtain at least three matched before/after pairs on each of Linux, Windows and macOS; report actual execution inventory/outcomes/failures/unknowns, wall-clock separately from summed Case durations, and actual-path RED/GREEN plus mutations; then request separate Owner activation approval. If no candidate qualifies, report that finding and retain all existing execution.

No workflow, required-check or branch-protection change; no cross-job cache; no Core invocation removal; no Priority 3/4 integration; no hotfix, automatic promotion or npm publication.
