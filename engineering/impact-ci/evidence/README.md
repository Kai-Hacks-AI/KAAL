# Offline verification evidence

Baseline: main `be3a2d09a386967bd5a1cd4a850f389951bc0796`.
Source digests, commands, mutation replacements and limitations are retained in
`verification.json`. These are local Linux results on Node 24.22.1. Provider CI,
independent Owner review and live publication/source enforcement are separate.

| Evidence | Observed result |
| --- | --- |
| Original #760/#764 contract assertions | All 65 pass; test files unchanged from the source receipt |
| Initial full-path RED | 55 tests against an export-complete inert evaluator: 45 assertion failures, 10 pass; no missing-module failure counted |
| Independent policy separation RED | 5/5 new identity/digest assertions fail against the original shared model |
| Shallow-input RED | Valid depth-one commit proof is refused by the old history-display adapter |
| Final gate/policy/adapter/replay tests | 170 pass, 0 failures, 0 skipped |
| Engineering through the CI Guard command | 398 pass, 0 failures, 0 skipped; `pass: Engineering: exit status 0` |
| Behavioural mutation challenges | 10/10 discriminated by assertion failures; original source restored and tests green |

Initial RED establishes the missing full-assurance behavior. It does not by
itself prove that every non-success outcome is discriminating. Mutation evidence
separately removes cross-workflow waits, provider provenance comparison, complete
pagination, Guard Windows policy coverage, current-generation validation,
completion-time bounds, pinned attempts and expired-generation rejection. Each
replacement is recorded with its unchanged behavioural test pattern and result;
syntax/import/harness failures were excluded from discrimination. The two new
mutants couple identity to the policy set or omit the independent version from
identity. Both are discriminated while current full-matrix obligations stay fixed.

Main and Lineage now have separate versioned policy documents with explicit
target/event profiles and inventories. Tests extend and version either policy
and alter its applicability, comparing all untouched profiles of the other
policy, including inventories, digests and independent security/review controls.
The 17/14 Main and 17/18 Lineage populations are verified by check and OS, not
counts alone.

The previous provider Engineering job 124853919395 failed in the new Git adapter
test: history display hid parent IDs in a shallow checkout. The adapter and test
now use raw commit headers; wrong-parent/tree proof still fails. A real depth-one
clone regression is GREEN, including a detached shallow source with no local
branch refs. The same Guard command as CI is GREEN locally; provider CI must
independently verify the updated head.

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
