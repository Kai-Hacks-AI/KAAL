# Stable full-matrix gates: offline Engineering increment

The source-only [P1 publication adapter](github/README.md) continues approved
PLAN #800. It reuses this evaluator through an unwired authenticated acquisition
and publisher protocol; it makes no live enforcement claim.

Implements the offline evaluator scope of [PLAN #776](https://github.com/Kai-Hacks-AI/KAAL/pull/776).
`KAAL Main` covers main PRs and main pushes; `KAAL Lineage` covers PRs into
single-segment `kaal/*` collectors. All applicable checks are required. C11,
impact selection and non-impact exclusions play no part in this path.

This is repository-owned Engineering code, not a new published capability.
There is no workflow change, check publication, App installation, ruleset change,
live shadow, promotion or release. Existing CI/review/security rules still decide
integration. A local `passed` result assesses supplied offline evidence; it is
not an authenticated GitHub required check.

## Focused delivery and dependency provenance

Collector `kaal/ci-gates` was established at then-current main
`be3a2d09a386967bd5a1cd4a850f389951bc0796`, independently of the large Engineering
collector. This PR explicitly proposes the bounded transfer and extension of
Engineering's own gate contracts from #760/#764, pinned at
`5f0f160afd8255061c21f02dc6351f154fa3d412`. It does not merge the Engineering
collector or transplant another capability's work. Owner review of this PR
reviews that dependency transfer as part of the Change, before any landing.

`dependencies.json` records exact source paths/blob identities and retained test
digests. All three original test files are byte-for-byte unchanged (65 cases).
Execution is extended in its existing module. Selection's one predicate is moved
to `selection-contract.mjs`, re-exported through its original interface and reused
by full mode. The old selective entry point still refuses main. No caller can
replace the execution judge with a passing function.

## Authority, policy and evidence

`full-policy.mjs` establishes an opaque, immutable handle from independent
context and exact target source bytes. `full-matrix-anchors.json` pins all ten
workflow definitions and nine Guard declarations at the accepted main baseline.
Unexpected, missing or modified source paths fail policy reconciliation. The
required inventories are independent of observed jobs. Two separately versioned
policy documents own their own applicability and complete check/OS inventories:

| Policy | Explicit profile | Target/event | Required instances |
| --- | --- | --- | --- |
| `policies/main.json`, `kaal-main` 1.0.0 | main-pr | PR into main | 17 |
| `policies/main.json`, `kaal-main` 1.0.0 | main-push | Push to main | 14 |
| `policies/lineage.json`, `kaal-lineage` 1.0.0 | lineage-pr | PR into a single-segment kaal/* collector other than kaal/guard | 17 |
| `policies/lineage.json`, `kaal-lineage` 1.0.0 | lineage-guard-pr | PR into kaal/guard | 18 |

Neither policy is constructed from the other. Guard's profile explicitly lists
its full required population. `workflow-definitions.mjs` provides shared producer
and job definitions; it decides no gate applicability or required membership.
`assurance-policy.mjs` reconciles each selected policy's explicit references
against that catalog, rejects unknown check/OS/event references and overlapping
applicability, and never imports another gate's inventory as a default.

Authority and manifests bind policy ID, version, profile and selected-policy
digest. The digest includes the selected policy, not the policy set, so a
version/inventory/applicability Change to Main does not implicitly change Lineage
or vice versa. Tests exercise both directions and compare every untouched
profile, its required inventory, digests and independent controls. Changes to
shared definitions and source anchors still need their own reviewed governance.

All presently reviewed obligations are preserved. CodeQL's separate
finding-based code-scanning rule remains necessary even when analysis jobs pass.
Release/manual/scheduled work remains independent of these event matrices.

Workflow API IDs came from captured runs: CI 41297155698, Change Isolation
41297155747, Branching 41297160286, Promotion Source 41297156627, CodeQL
41297156634, Dependency Review 41297156629, push audit 41297271189 and Guard
Acceptance Boundary 40555775338. Paths, API IDs and provider App 15368 jointly
identify the observed producers. This **does not** prove the future stable
publisher's source boundary: the preferred dedicated App and same-App spoofing
challenge remain live-shadow prerequisites.

Public call sequence:

1. Obtain current repository/PR/push, head/base, synthetic merge/tree/parents,
   governance revision, publication SHA, generation and deadline independently.
   Pin each expected workflow's run ID and attempt in `context.producers`; null
   means not yet observed and never grants success. A new run/attempt needs a
   freshly established generation, not reuse of an earlier handle.
2. `authorityFromGit(root, context)` reads committed target bytes through
   Hosting/Git and verifies local object/tree/parent facts. Alternatively,
   `establishFullMatrix(context, snapshot)` consumes independently read bytes.
   An opaque handle or a matching digest is not authentication of the input
   transport. Current provider facts must still come from a trusted observer.
   Git parent/tree proof comes from commit-object headers, which preserve the
   parents in a depth-one checkout; history-display output is not that proof.
3. `fullManifest(authority)` gives the expected full schema. Compare a proposed
   manifest against this independently established authority; observations may
   never determine the expected population. Full mode uses `matrixDigest` and
   `contextDigest`, not a fictional impact digest or a capability-pr label.
4. `judgeFullMatrix(authority, manifest, evidence, currentContext, now)` verifies
   complete paginated inventories, producer and expanded job identity, workflow
   definition digest/revision, event/repository/PR/tested revision, runner labels,
   run/attempt/check-suite binding, successful completion and timestamps.
   It then invokes the reused selection and execution contracts.

Normalized `kaal.full-evidence/v1` holds `contextDigest` and `runPages`. Each page
has `page`, `per_page`, `total_count`, `runs`; each run has the independently read
producer bindings and `jobsPages` with the same pagination fields and `jobs`.
`full-fixtures.mjs` is the explicitly **synthetic** executable schema example.
It cannot be used as captured provider assurance. The raw history adapter refuses
to fill absent execution/source/PR facts with those synthetic values.

The evaluator returns passed, failed, unresolved or pending, plus the gate,
stage, errors and retained ledger. Missing/unfinished producers wait until the
generation deadline, then fail; an expired evaluation cannot re-emit an old
success. Missing/truncated inventory or duplicate distinct
runs is unresolved. Every non-passed verdict is non-success. A complete newest
attempt may supersede the previous attempt only with a newly pinned authority;
partial reruns cannot borrow children from earlier attempts. Future completion
timestamps cannot authorize a present success. `successNotBefore` is at least
the maximum required job/producer completion time; completion after the generation
deadline fails. Late callbacks with changed head, target, PR, generation or pinned
producer are rejected against current context.

The future publisher must atomically recheck/serialize finalization, invalidate
old success and handle one head shared by PRs/targets and main-push/PR overlap.
This pure evaluator can reject a stale tuple but cannot make GitHub enforce
tuple-scoped freshness, invalidate a real check, authenticate provider data or
prove a race-free merge boundary. No implementation here claims that live proof.

## Reproduction and interpretation

```sh
npm ci --ignore-scripts
npm run test:engineering
node --test engineering/impact-ci/*.test.mjs
node engineering/impact-ci/replay-cli.mjs engineering/impact-ci/fixtures/pr773-actions.json 2026-11-01T10:23:18Z
```

The CLI prints an offline history report and exits 2 (unresolved), deliberately
never successful assurance. The stored API projection retains both CI runs and
all observed duplicate policy/security runs. At #773's merge instant, required
Guard/Acceptance work was unfinished. Even after completion the historical
capture cannot certify full assurance: duplicates and missing independent
execution/source/PR bindings remain unresolved. `evidence/` retains both reports.
No new run recorder or timing/history ownership is introduced.

Verification is split across the unchanged contract regressions, full-interface
behaviour/provenance/completion tests, permitted/prohibited/undecidable pure-module
boundary tests, the Hosting/Git input adapter and real-history replay. No package
is changed or published, so no new packed-consumer claim is made. Root
`test:engineering` registers these cases without changing workflow routing.

Next, separately aligned work must capture independently authenticated producer
facts, prove the publisher/source and merge-blocking races in live shadow, obtain
the administration-visible effective protection inventory, and seek an explicit
staged migration/rollback decision. C11 completeness remains a dependency of
future selective lineage assurance, not of this full-matrix evaluator.
