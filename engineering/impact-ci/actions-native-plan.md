# PLAN: capability collectors and release-process gates

Owner direction, 2026-11-01. Collector: `kaal/ci-gates`.

## Decision and first useful delivery

Prefer GitHub Actions and existing KAAL evaluators. Establish stable capability
collectors, then compose release-process gates from their evidence and applicable
governance. The first delivery aggregates the **complete existing matrix** in
shadow. It adds no selective execution, App, database, receiver, receipt service,
credentials or scheduler. Extra infrastructure requires a demonstrated limitation
and a separate decision.

This document supersedes the infrastructure-first sequence in PLAN #800 and P2
PLAN #807. #790's evaluator and #803's unwired implementation remain accepted
source. #810 is held in draft, unarmed and unmerged; it is not a prerequisite.
Existing policy JSON, source anchors, algorithms and assertions remain unchanged.
The old `KAAL Main` / `KAAL Lineage` names describe those existing contracts, not
live required checks. New names/profiles require a versioned TDD/DO Change.

**This Change is documentation only.** It proposes sequence, scope and Cases for
Owner review. It does not authorize workflows, live experiments, installation,
check publication, ruleset/protection changes, synchronization or promotion.

## 1. Architecture: Product, Engine and release process

| Layer | Responsibility | Example |
| --- | --- | --- |
| Execution evidence | Exact tests/jobs, host, source, tested revision and attempt | A Linux package-consumer test or an actual GitHub policy run |
| Capability collector | Collect separately identified Product and Engine obligations; nested capability collectors are allowed | Branching Product plus Branching Delivery |
| Capabilities | Collect the required capability collectors for this target/profile | Full population initially; independently justified impact scope later |
| Release-process gate | Require Capabilities plus the path's governance and security obligations | KAAL, KAAL Capability, Hotfix |

The **Solution / Product** is the reusable capability: its Skill, package,
contracts and behavior. The **Delivery / Engine** is its installation and
configuration in a consuming repository. Branching package conformance and wired
GitHub Branching enforcement need distinct results. A product test cannot certify
installed triggers/rules/permissions; a working installation cannot certify the
whole product. Their failures must be distinguishable in reports.

Capabilities own their meanings and assurance obligations. Engineering owns this
repository's CI composition and consumes the products; it does not redefine them.
Branching owns branching/merge semantics, Change owns isolation, Testing owns
test/evidence contracts, and Hotfix will own the emergency process. Repository
configuration is an Engine realization of those contracts.

Do not relabel today's mixed suites as proven Product-only or Engine-only.
Initially preserve them as mixed leaf obligations, with their exact coverage
recorded. Later isolate Product and Engine Cases through discriminating tests,
retaining the original coverage until replacement is demonstrated. Cross-product
integration obligations remain explicit; they need not be falsely assigned to
one package. Group reporting must not create a job per diagram box by default.

Shared catalog entries describe identities, not policy authority. Each release
policy independently lists its required groups/leaves and controls. Reconcile a
collector DAG to the expected leaf inventory and reuse #790/#760/#764 for
completeness. Reject unknown references, cycles, missing groups and incompatible
evidence. Do not introduce another successful-job counter or trust child GREEN
names without their current evidence. The root must never certify before its
last required leaf completes.

## 2. Target-based release policies

| Proposed gate | Applicable integration | Intended scope |
| --- | --- | --- |
| KAAL | Ordinary promotion into main; pushes to main | Complete capability Product and Engine assurance plus applicable governance/security |
| KAAL Capability | Changes and SYNCs into kaal/* | Target collector's policy; later impact selection across Product, Engine and dependencies |
| Hotfix | Separately governed hotfix/* to main | Emergency eligibility plus affected Product/Engine assurance and applicable governance/security |

All three own independent applicability/version/control definitions. Hotfix is
not yet an admitted route. Ordinary Main remains full assurance. Main pushes
remain full assurance independently of which PR path produced them; post-merge
testing is not a substitute for required pre-merge evidence.

A `main` to `kaal/*` SYNC uses the **target collector's** policy, never Main's
profile merely because main is the source. Verify the resulting merged tree.
For impact selection, consider the complete change relative to the target,
including adopted incoming changes, explicit conflict resolutions and dependency
effects. Branching's narrower resolution set for Change Isolation admission is
not a complete testing-impact population. A broad/unknown impact can require the
full matrix. SYNC lands by merge commit; ordinary Changes/promotions by squash.

Collector and emergency testing can become faster when authoritative scope is
available. Change's supplied-model isolation result alone proves neither repository
coverage nor actual execution. Bind selection to trusted inventory, owner inputs,
target/head/base/result tree, policy version and dependencies; require an explicit
justification for every exclusion. Missing selection authority falls back to full
testing; a failed test, wrong attribution or stale execution remains non-passing.
No reduced mode is enabled in the first increment. Mandatory security and
governance controls are not implicitly excluded with an unaffected capability.

## 3. Smallest Actions-native implementation to evaluate

| Approach | Useful assurance | Added operation / limit |
| --- | --- | --- |
| Native Actions jobs | Same-run dependency barrier, existing job/check publication and read tokens | No new service; must establish trusted source and cross-workflow/current-attempt association |
| App publisher hosted in Actions | Distinct source identity; can publish an external check on the verified subject | App installation/key and protected trusted workflow configuration; still asynchronous |
| External service plus durable receipts/store | Potential independent observation/recovery | Not justified for the first delivery; #810 stays optional preserved work |

Prefer `needs` plus `if: always()` for related jobs in the same run. The final
applicable job must execute and explicitly reject failed, skipped, cancelled or
unexecuted required work. Inspect exact expanded check/OS instances against the
independent inventory: a successful root cannot prove a deleted matrix member ran.
No `continue-on-error` or success fallback may erase a required failure. [D1,D2]

`needs` joins jobs in one workflow, not separate workflow runs. Current CI,
CodeQL, Dependency Review, trusted policy checks and Guard's extra boundary are
separate producers. Do not solve that by moving privileged policy code into a
candidate-executing job. Preserve their existing trust/permission boundaries.

For the first cross-workflow prototype, prefer a bounded read-only API observer
inside an eligible PR/push Actions run. Acquire complete run/job/check pages,
exact attempts and trusted context using existing GitHub/Hosting/Git seams;
normalize facts into #790, retaining unavailable fields as unresolved. Polling
has a fixed deadline and ends non-success on ambiguity/outage. A `needs` object
is not itself #790's normalized evidence. If required source fields cannot be
obtained without receipts, report that precise gap before proposing new machinery
or a separately reviewed evidence-contract revision. Never populate fixture facts.

Normal runner checks need no custom Checks-write publisher. Use minimally scoped
`contents: read`, `actions: read`, `checks: read` and `pull-requests: read` only
where acquisition needs them; preserve current PR/fork behavior. No broad write token or candidate code
in a privileged observer. A plain `workflow_run` observer job is not an eligible
PR-required native check under GitHub's documented event rules. [D2]

Source trust is a migration prerequisite. Expected App 15368 identifies Actions,
not an immutable workflow: a same-App matching job name can be forged. Evaluate
organization required-workflow source binding, availability and real behavior.
Do not assume KAAL's entitlement. Required-workflow rules use default PR activity
types and ignore custom event filters; do not assume metadata/auto-merge changes
rerun them. Preserve the existing policy triggers and test their invalidation.
CodeQL init/analyze cannot run within required
ruleset workflows, including their reusable callees; preserve separate analyses
and independent finding-based enforcement. [D3]

If native source binding demonstrably cannot meet the accepted assurance,
propose the smallest App fallback **running in Actions**, with selected-repository
installation and a protected environment restricted to trusted workflow/ref
execution. Keep its key inaccessible to candidate workflows. App identity does
not justify a server, database or scheduler, and does not solve merge races.

## 4. State, freshness and actual platform limits

| Meaning | Native gate behavior |
| --- | --- |
| Required work running | Job remains in progress within the bounded wait |
| Complete, attributable, successful current population | Successful job |
| Required obligation failed/skipped/cancelled | Failing job |
| Missing/ambiguous/stale/unauthenticated input or deadline reached | Failing job with UNRESOLVED diagnostic |
| Gate never starts or run is cancelled | No accepted aggregate success; verify actual enforcement in the live probe |

GitHub accepts skipped/neutral required checks, so never use them as evidence of
applicable assurance. Keep applicable final gates free of path-filter/job-skip
shortcuts. Unsupported event/target is not a GREEN for an applicable policy. [D2]

Bind evidence to repository and head-repository IDs, PR or push, target, head/base,
tested commit/tree, governance and policy revisions, workflow/job/App identities,
run IDs/attempts and completion observations. A matching SHA alone is insufficient.
Keep competing runs visible; do not union partial reruns with old successes.
Final re-reads can detect changed facts but are not an atomic GitHub snapshot.

A same-run dependency barrier proves no early success for that run. It does not
prove an older same-SHA GREEN is revoked before a new run registers. Retargeting,
policy/metadata changes, duplicate runs and uncertain writes remain live Cases.
Cancellation/concurrency settings alone are not a merge fence. Neither proposal
claims atomic check invalidation and merge. Do not implement an outbox/SQL system
as an assumed remedy for a platform enforcement gap.

Main and Hotfix target the same ref. Current required-check rules cannot be
treated as an OR between those contexts. Requiring full KAAL for every Hotfix
defeats reduced pre-merge testing; accepting a skipped KAAL blindly creates a gap.
Before Hotfix activation, review a concrete enforcement design: for example one
always-required main admission gate selecting a trusted release profile and
requiring its full evidence. That would explicitly change KAAL from full-matrix
assurance to release acceptance for Hotfix and needs Owner alignment. Otherwise
retain full testing. No branch-prefix exemption or successful placeholder is
authorized by this PLAN.

## 5. Separate kaal-hotfix Skill proposal

Develop `kaal-hotfix` as a reusable product Skill in its own focused lifecycle,
not inside the CI adapter. Its initial contracts must address emergency intent,
affected capability ownership, bounded scope, assurance obligations, independent
review, landing/freshness and reconciliation into affected ongoing collectors.
Corrected behavior stays owned by its capability. The Skill consumes Branching,
Change and Testing rather than copying their algorithms. Product Cases exercise
the procedure/contracts; Engine Cases verify the actual installed emergency route.

Existing Branching explicitly allows only same-repository kaal/* into main and
defines `kaal/hotfix` with unchanged checks. The proposed `hotfix/*` path and
reduced assurance therefore require a separate Branching/Hotfix policy Change,
source tests, workflow/ruleset proposal and Owner decision. Preserve the current
route until that replacement is verified. This PLAN creates no Skill/package,
Engine registration, emergency branch or relaxed enforcement.

## 6. Discriminating verification and focused delivery

| Stage | Bounded delivery and exit |
| --- | --- |
| N0 This CHECK/PLAN | Independent Owner review of target policies, Product/Engine separation, native-first scope and explicit unresolved limitations |
| N1 TDD/DO, source only | Versioned group/profile projection and report using #790; full leaf inventory unchanged; no production workflows or P2 store dependency. Independently useful source may be promoted after its own verification, before live setup. |
| N2 Separately aligned workflow-only prototype | Exact eligible event/target/job/source/permissions and bounded acquisition; non-required shadow; source anchors updated in a separate governed source Change |
| N3 Live shadow campaign | Recorded real executions and merge-blocking/source probes in an explicitly approved isolated scope; existing required checks unchanged |
| N4 Focused promotion then migration proposal | Current-main dependency check, necessary SYNC by merge commit, full candidate CI plus Owner review; squash promotion only for the reviewed scope; no automatic migration |
| Independent follow-ups | kaal-hotfix product/Engine realization and Change authoritative selection; neither blocks full-matrix shadow |

Architecture loop: prove capability/release policy ownership, single completeness
judge, group DAG reconciliation, and separation of Product/Engine and privileged
execution. Acceptance loop: drive independent Main/collector/SYNC profiles through
the public adapter, including nested collectors and mixed-suite attribution.
Implementation loop: establish behavioral RED before DO and designate mutations
that omit a group, drop an OS, accept a skip, substitute target/source policy,
borrow an attempt or accept mismatched revision/source. Preserve #790/#803 Cases.

Live Cases must cover full Main and ordinary/Guard collector positives on all
three hosts; delayed last leaf and child collector; failed/missing/skipped/cancelled
jobs; deleted matrix member; partial reruns and competing runs; changed head/base,
target and policy; same-SHA PR/push and cross-target reuse; API truncation/outage;
gate cancellation and same-App forged name. Observe actual required-check source
binding and merge eligibility in an authorized platform probe. Withheld review
protects experiments but is not evidence that CI itself blocked a merge.

Record existing-required, expected full-policy, group and published gate results
side by side, with immutable revisions/run links/timestamps. Full leaf coverage,
late completion and correct policy routing must be independently replayable.
Synthetic tests and #773 history do not satisfy live Cases. Any unexplained GREEN,
same-SHA reuse or source/enforcement gap blocks migration, not source investigation.

## 7. Dependencies, source inventory and migration boundaries

Checked 2026-11-01: collector `84fccd9873f21dc4c02ff7a3e2021814c57e6968`, tree
`4173d5a265c14d23304c55ed7db8e961395bb6be`; main
`01b5528848bb3b59c031bbfcc03f6a88ad7feff2`. No main/other collector is imported.

| Source / dependency | Use and qualification |
| --- | --- |
| #759 / #776 | Original stable-gate objective and full-matrix PLAN; this direction narrows infrastructure while retaining assurance |
| #790: policies/main.json, policies/lineage.json, assurance-policy.mjs, workflow-definitions.mjs, full-policy.mjs, full-gate.mjs, full-matrix-anchors.json | Independent expected population and sole full evaluator; Main PR 17/push 14, collector PR 17/Guard 18; no renaming or inventory mutation here |
| #760 / #764: execution-gate.mjs, selection-contract.mjs, selection-gate.mjs, target-policy.mjs | Existing execution/selection completeness; selective Main/Hotfix exceptions are not already supported |
| #803: github/acquire.mjs, auth.mjs, controller.mjs and their Cases | Reuse useful pagination/attribution negatives and state lessons; current App/receipt ports are not a native production implementation |
| #807 / #810 | Historical alternative and held P2 work; no accepted dependency on SQLite, receipts or producer registry for N1 |
| #769 / C11 plus Change's authoritative repository adapters | Future scope authority for reduced collector/Hotfix testing; not dependencies of full-matrix aggregation |
| Current main: packages/skills/kaal-change/{docs/architecture.md,docs/limitations.md,skills/kaal-change/SKILL.md} | Supplied-model isolation, obligations not assessed, repository authority unestablished; no selective CI authorization |
| CI, codeql, dependency-review, lineage-synchronization, change-isolation, promotion-source, guard-acceptance-boundary and branching-audit workflows; their Guard declarations/checkers | Preserve all producers, exact OS instances, trusted execution boundaries and extra Guard control; release/manual/schedule do not substitute |
| git-input.mjs, existing Hosting/Git interfaces and Foundation SHA-256 | Existing acquisition/host/digest boundaries; no copied host or hash implementation |
| engineering/github/branching.md, lineage.ts and accepted Branching product | Current source/freshness/merge/Hotfix semantics; consume accepted product through scoped dependency integration when needed |

Readable active rulesets remain main **24951062** (11 checks) and lineage
**24952357** (14 checks), both source-bound to Actions 15368, strict/up-to-date,
with independent approval/thread rules and CodeQL high-or-higher security/error
enforcement. Main's checks are Change Isolation, Branching, Promotion Source,
Hosting Linux/Windows/macOS, Workspaces, Acceptance, Engineering and both CodeQL
languages; lineage adds Guard Linux/Windows/macOS. The full policies additionally
cover all-host Acceptance, Dependency Review and the applicable Guard boundary.
Classic-protection visibility was previously 403 and remains unestablished here;
obtain an administration-visible effective export before migration.

Migration requires accepted real shadow evidence, no missing coverage, demonstrated
source trust and explicit resolution/acceptance of freshness/enforcement limits.
Refresh exact effective rules, review/security controls and publisher identities.
After separate Owner approval, add stable enforcement alongside individual checks,
prove blocking, then remove redundant individual names. Rollback restores and
verifies individual/full required coverage before removing the aggregate. Preserve
independent Owner review, CodeQL findings, Branching, Change Isolation and Guard's
boundary. Observing GREEN once is not acceptance. No enforcement is changed here.

## Primary platform references

Checked 2026-11-01; documentation establishes platform contracts, not live KAAL
assurance. Source binding, rerun races and GitHub eligibility require experiments.

- D1: [Actions job dependencies and always](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_idneeds).
- D2: [Required-check eligibility, skipped results, attribution and expected sources](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks).
- D3: [Ruleset workflow source/name constraints and CodeQL restriction](https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/troubleshooting-rules).
