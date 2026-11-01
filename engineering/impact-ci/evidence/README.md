# Offline verification evidence

Baseline: main `be3a2d09a386967bd5a1cd4a850f389951bc0796`.
Source digests, commands, mutation replacements and limitations are retained in
`verification.json`. These are local Linux results on Node 24.22.1. Provider CI,
independent Owner review and live publication/source enforcement are separate.

| Evidence | Observed result |
| --- | --- |
| Original #760/#764 contract assertions | All 65 pass; test files unchanged from the source receipt |
| Initial full-path RED | 55 tests against an export-complete inert evaluator: 45 assertion failures, 10 pass; no missing-module failure counted |
| Final gate/policy/adapter/replay tests | 142 pass, 0 failures, 0 skipped |
| Complete Engineering command | 370 pass, 0 failures, 0 skipped |
| Behavioural mutation challenges | 8/8 discriminated by assertion failures; original source restored and tests green |

Initial RED establishes the missing full-assurance behavior. It does not by
itself prove that every non-success outcome is discriminating. Mutation evidence
separately removes cross-workflow waits, provider provenance comparison, complete
pagination, Guard Windows policy coverage, current-generation validation,
completion-time bounds, pinned attempts and expired-generation rejection. Each
replacement is recorded with its unchanged behavioural test pattern and result;
syntax/import/harness failures were excluded from discrimination.

Architecture tests exercise permitted pure predicates, a prohibited direct host
import and an undecidable hidden host lookup. Git-adapter tests check actual
committed bytes and actual tree/parent facts, including altered proof rejection.
Complete positive evaluation fixtures are synthetic and marked as such. They
exercise the offline contract, not authenticated GitHub assurance.

`pr773-actions.json` is a read-only API projection: exact run IDs, attempts,
workflow IDs/paths, head and repository identity, paginated job counts, job IDs,
runner labels and provider timestamps. Both CI runs and duplicate policy/security
runs remain visible. No new execution or timing recorder was introduced.

At the recorded merge instant, seven job instances across the two CI runs were
unfinished; the completion barrier cannot be green. The later replay shows that
the observed jobs completed, but remains unresolved: duplicate runs and absent
independent workflow/execution/current-PR bindings are not passing evidence.
The CLI always exits 2 for this historical analysis.

No claim is made that the readable rulesets today were the effective rules at
#773's merge time. Classic protection inspection was unavailable to the GitHub
integration, and source-bound publication, GitHub commit attribution, current
generation invalidation and real merge-blocking races remain prerequisites for
separately aligned live shadow and migration.
