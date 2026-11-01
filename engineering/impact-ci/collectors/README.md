# N1: full-matrix capability collector report

Source-only TDD/DO authorized by [PLAN #819](https://github.com/Kai-Hacks-AI/KAAL/pull/819),
Owner approval [5730383244](https://github.com/Kai-Hacks-AI/KAAL/pull/819#pullrequestreview-5730383244).
Base: `3337e5138fb1e2021327cfd10d7ed7d3ba27dbf0`, tree
`84c1e0ff2a2c93f0555d5bb3da6fe7f0c99494e9`. No #810 implementation is imported.

The public `reportFullAssurance(authority, manifest, evidence, current, now)` in
[report.mjs](report.mjs) consumes #790's existing opaque authority and invokes
`judgeFullMatrix` once. It retains that verdict, diagnostics, ledger and completion
barrier, adding versioned release labels and a descriptive collector hierarchy.
Nothing publishes a check or authenticates raw provider evidence here.

| Report profile | Existing independent evaluator policy | Required leaves |
| --- | --- | --- |
| KAAL, PR into main | kaal-main 1.0.0 / main-pr | 17 |
| KAAL, push to main | kaal-main 1.0.0 / main-push | 14 |
| KAAL Capability, ordinary collector PR | kaal-lineage 1.0.0 / lineage-pr | 17 |
| KAAL Capability, Guard collector PR | kaal-lineage 1.0.0 / lineage-guard-pr | 18 |

These are **report labels**, not installed GitHub check identities. The underlying
policy JSON/names/versions, expected workflow/OS inventories and source anchors
are unchanged. A source branch named main or hotfix does not select a smaller
policy. Main-to-collector synchronization uses the target collector's profile and
supplied tested result/tree. It does not establish Branching's structural SYNC
verdict; that remains a required independently supplied producer outcome.

## Collector structure and coverage

- Capabilities collects Hosting (3 hosts), Acceptance (3), Workspaces (1),
  Engineering (1) and Guard (3): all 11 CI leaves remain required.
- Governance collects the applicable Branching, Change Isolation, Promotion
  Source and Guard Acceptance Boundary obligations. Main push uses Branching audit.
- Security collects both CodeQL language analyses and applicable Dependency Review.

`catalog.mjs` maps the evaluator's expected leaves to these groups; it defines no
required CI population. `projectCollectors` checks group references, cycles,
reachability and unambiguous assignment of every expected leaf. Its public result
is descriptive and has **no verdict**. The report always uses the fixed reviewed
catalog and opaque authority, not caller-selected group definitions or inventory.
An unassignable new expected check fails projection instead of silently disappearing.

Nested groups retain their complete descendant leaf references. An inactive
group means the independent selected policy contains no such obligation. It is
reported `not-applicable`, never emitted as a skipped passing GitHub check.
`allowEmpty` permits that empty descriptive group; it cannot exclude an expected
leaf or make missing execution optional.

Group assurance is deliberately conservative: `certified-by-full-matrix` appears
only after the **entire** sole evaluator result passes. Otherwise every applicable
group is `not-certified`, with per-leaf `evaluationObservation` for diagnosis.
This increment does not implement independent group verdicts or combine bare child
GREENs. Missing, failed, skipped, cancelled, stale or competing evidence retains
the evaluator's non-passing result. A group cannot certify before its last leaf.

Product and Engine are separately identified coverage dimensions. Existing CI
suites remain `mixed`; repository policy jobs are `engine`; analyses/review are
`cross-cutting`. There are no invented Product-only tests. Every report explicitly
states `coverage.separatelyEstablished: false`. Separate Product and Engine
certificates require future discriminating Cases and verified delivery mapping.

Every result is `sourceOnly: true`, `publication: not-published`, and
`liveAssurance: unestablished`. Digests bind the report profile/catalog separately
from unchanged policy/matrix/context digests. Matching digests authenticate no
provider transport. Independent Owner review and CodeQL finding enforcement remain
controls declared by the selected policy, not outcomes this report claims to pass.

## Verification and calibrated findings

Three loops remain separately runnable:

```sh
node --test engineering/impact-ci/collectors/architecture.test.mjs
node --test engineering/impact-ci/collectors/acceptance.test.mjs
node --test engineering/impact-ci/collectors/implementation.test.mjs
node engineering/impact-ci/collectors/mutations.mjs
npx --no kaal-guard run --check Engineering --github
```

`collectors.test.mjs` registers all loops through existing Engineering discovery;
no npm/workflow routing changes. Results are in [verification.json](verification.json).
Architecture: 3 Cases; source-interface acceptance: 8; implementation: 18.
All 29 pass, and full Guard Engineering passes 530, no skips/todos. Eight mutations
are discriminated by behavioral assertions, not syntax/import failures. The 14
inherited gate/P1 test files remain byte-for-byte unchanged.

Initial skeleton RED had 25 failures among 28 Cases and no syntax/import failure.
The report/projection assertions failed before their algorithms were written.
One architecture assertion incorrectly assumed Hosting reported relative imports
as external modules; its documented exclusions explicitly say otherwise. Correct
that test to the actual inspection boundary, and record responsibility as judgment.
The catalog is declarative input established before algorithm DO. The final Hotfix
source-name acceptance Case was added after GREEN to calibrate the scope; no
test-first claim is made for that additional regression.

**Architecture judgment:** the three production modules have no direct host or
network operation. The catalog owns descriptive grouping, projection reconciles
references, and the report delegates its only assurance verdict to #790. Within
this source coverage, there is no second execution/selection completeness judge.
This is a source-review judgment, not a claim Hosting proves semantic ownership.
Hosting inspection finds no direct undeclared host access, detects an injected
filesystem import, and surfaces injected dynamic lookup for validation. Judgment
of that injected validation item: it would require review and is prohibited from
silent acceptance. Relative-import resolution, transitive host access, arbitrary
JavaScript semantics and production trust are outside mechanical coverage.

**Unknown:** acceptance uses synthetic provider evidence on local Linux; it is not
a fresh packed product, native Windows/macOS execution, authenticated acquisition,
live GitHub shadow, source binding or race-free enforcement. Fixture head labels
do not prove real Hotfix eligibility or a real SYNC. #773 history is retained.

## Next boundary

The next decision is N2's concrete workflow-only shadow prototype, including trusted
source, eligible event, revision/attempt association, permissions, bounded API
reads and live negative Cases. It needs separate Owner alignment. Existing required
checks remain authoritative. No App, credentials, receiver, SQL store, receipts,
selective CI, kaal-hotfix implementation, ruleset/protection change, synchronization,
promotion or npm publication occurs in N1. Source integration is by governed squash
after its own independent approval and required CI.
