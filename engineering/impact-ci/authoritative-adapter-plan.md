# PLAN: authoritative C11-to-CI adapter

## Intent and boundary

#760 and #764 are merged into `kaal/engineering`. They check execution and
selection completeness against supplied evidence. They do not establish the
authority or completeness of that evidence.

This PLAN advances #759 and the unfinished authoritative-input scope of #762:
complete C11's owner-defined inputs, establish the governed CI matrix, derive
expected checks from trusted target evidence, then compare against full CI.
It proposes no selective-CI activation. Owner review of this PLAN precedes DO;
workflow and required-check changes need a separate later Owner decision.

## Evidence baseline

Inspected on 2026-11-01. The implementation target is
`kaal/engineering@5f0f160afd8255061c21f02dc6351f154fa3d412` (#764's merge).
C11 #739 remains draft at `a98b6f79c80b4b8e61cec19a8144c6b7980f1277`,
targeting `kaal/hosting`; its fixture implementation is not on this Engineering
snapshot. Its eventual integration route must follow the repository's approved
Engineer / Synchronize / Promote flows; this PLAN does not authorize moving
another capability's code between collectors.

Evidence:
- [C11 prerequisite and gap contract](https://github.com/Kai-Hacks-AI/KAAL/blob/a98b6f79c80b4b8e61cec19a8144c6b7980f1277/engineering/change-isolation/traceability.md).
- [Engineering target tree](https://github.com/Kai-Hacks-AI/KAAL/tree/5f0f160afd8255061c21f02dc6351f154fa3d412).
- [Existing CI inventory](https://github.com/Kai-Hacks-AI/KAAL/blob/5f0f160afd8255061c21f02dc6351f154fa3d412/.github/workflows/ci.yml).
- [Merged gate contract and limits](https://github.com/Kai-Hacks-AI/KAAL/blob/5f0f160afd8255061c21f02dc6351f154fa3d412/engineering/impact-ci/README.md).

A PLAN merged into an owner's collector is not an implemented dependency, and an
implemented dependency in another collector is not evidence present on this target.

## Dependency ledger: what is still missing

| Dependency | Observed owner-side progress | Missing before authoritative use |
| --- | --- | --- |
| P1: Change's `alters` and `scope` | change/C9 PLAN #744 merged into `kaal/change`; prerequisite delivery DO #662 is still open | C9 implementation, its owner-approved interface and well-formedness evidence, then availability on the trusted target. Change is absent from the inspected Engineering tree. |
| P2: Intent and Requirement traces | Intent PLAN #740 and DO #748 merged into `kaal/intent`; Requirements PLAN #741 merged into `kaal/requirements` | Requirements C11 tests/C12 DO, actual owner-held Requirement/Intent Nodes and Serves Edges, and target-side conversion/completeness evidence. Intent's DO alone is not complete trace coverage. |
| P2: Architecture to Requirement | C11 delegates this relationship to Architecture, reusing its Placement contract | Owner-provided traversable traces and conversion/completeness evidence on the target. No accepted complete inventory was established by this inspection. Engineering must not infer it from prose. |
| P2: Case to tested target | Testing PLAN #745 remains open; it defines `derive`, `edges`, `incoming` and completeness-aware `impact` | Accepted DO and a complete Case/file inventory. Findings, unreadable files and untraced Cases must prevent established impact. No `traces` implementation is present on the inspected target. |
| P2: realization/package dependency | Packaging PLAN #746 remains open | Owner-approved decision and DO for manifest-derived relations, plus target availability. Imports and root script selectors are explicitly outside Packaging's proposed derivation and need their owners' evidence too. |
| P3: already present claims | The inspected target contains JSON claims for Core, Graph and Testing | Revalidate each claim's Node identity, coverage and conflicts at every pinned snapshot; presence alone is not authority. |
| P3: Foundation | PLAN #743 merged; DO #749 remains open | Claim and Capability Node must land and become available on the trusted target. The claim is absent from this Engineering snapshot. |
| P3: Hosting | DO #751 remains draft/open | Accepted claim on the target; it is absent from this Engineering snapshot. Its historical sequencing note is not a new CI dependency rule. |
| P3: Guard | DO #753 remains open against `kaal/guard-release` | Both package and engineering-test claims on the target; neither is present on this Engineering snapshot. |
| P3: Engineering and Engineer Skill | Engineering root-claim PLAN #750 remains open; Engineer Skill has no claim on the inspected target | Engineering's Capability Node/root DO and Engineer Skill's own claim. #750 covers exactly root package.json and package-lock.json; it must not silently claim all Engineering drivers/tests. Any remaining locations need explicit owner claims. |
| Graph integration (C11 P4) | C11 says Graph already supplies incoming traversal and needs no new relationship semantics | Connect actual target Nodes/Edges and owner-derived relations to Graph, verify pinned identities and handle findings. #739 still uses fixture inputs; an empty traversal or a provisional `converted` boolean is not proof of complete conversion. |

Engineering owns this integration ledger, not the missing relationship meanings.
Before marking a row ready, record its owner, accepted implementation/commit,
target snapshot containing it, public interface and positive/negative evidence.
Unlocated owner work is explicitly unresolved; it must not be called nonexistent
merely because a search did not find it.

## Proposed obligations

### 1. Resolve authority before deriving selection

The trusted caller independently obtains repository identity, event, target
branch, immutable target/base SHA, PR head SHA, complete changed paths (both sides
of renames), and the tested revision/tree. Never obtain these facts solely from a
candidate manifest. A target/head update invalidates earlier evidence.

Load the adapter, owner implementations, approved Change statements, Nodes,
ownership claims and policy from the pinned trusted target. Never execute
candidate-authored selector code or let the candidate redefine scope, ownership,
conversion status or test policy for its own evaluation.

Resolve P1 through Change's interface, P2 through the relationship owners and
Graph, and P3 through the retained JSON claim contract. Reuse C11; do not create a
second path-based impact engine or parse bracket prose as an Engineering-owned
relationship. Foundation supplies all KAAL SHA-256 digests.

C11's Core-alone isolation default is not permission to omit CI when a Change
Node is absent. Missing CI impact evidence remains unresolved. Preserve C11's
Core and .github isolation obligations independently.

### 2. Govern the complete CI inventory and its meaning

Propose a versioned, target-owned policy mapping contract/Case identities to
checks, hosts, commands and accountable owners. Dependency reachability establishes
potential impact; it does not itself prove which suites may be omitted.

The observed `ci.yml` baseline has 11 job/host identities:

| Check family | Required baseline hosts | Actual job names |
| --- | --- | --- |
| Hosting | Linux, Windows, macOS | Hosting (Linux), Hosting (Windows), Hosting (macOS) |
| Acceptance | Linux, Windows, macOS | Acceptance, Acceptance (Windows), Acceptance (macOS) |
| Guard | Linux, Windows, macOS | Guard, Guard (Windows), Guard (macOS) |
| Workspaces | Linux | Workspaces |
| Engineering | Linux | Engineering |

This is an observed execution inventory, **not** an approved impact mapping.
The Linux and other-host Guard commands differ; they cannot be interchanged.
Shared suites such as Engineering may exercise another capability's contracts.
Reconcile policy against workflows, Guard declarations and actual commands.
A new/renamed job, host or contract without a policy disposition is unresolved.

Repository invariants and security checks remain mandatory under their existing
rules. The 11 jobs above are not the entire repository required-check inventory.
Shared CI/runner/security/release changes require full assurance or an explicit
unresolved result, never an inferred path-based exclusion.

### 3. Build the adapter and independent comparison

From complete target-owned C11 closure and the governed policy, derive:
- complete check/OS inventory;
- required impacted checks;
- non-impact evidence references for every excluded check;
- immutable input identities/digests and named unresolved findings.

An independent validation boundary reconstructs the expected matrix from those
trusted inputs, rather than trusting or replaying the candidate's lists, claimed
closure or `authoritative: true`. Compare the proposed manifest through #764,
then actual execution evidence through #760. A boolean or matching caller-supplied
strings can never replace provenance verification.

Keep the pure contracts' fail-closed results. Until independent full-matrix
validation exists, `main` remains unresolved in this selective contract and the
existing full CI continues to decide integration. All PRs to main and pushes to
main require full cross-capability/host assurance; only PRs to kaal/* are eligible
for governed selection. npm retains packed-consumer and release verification.

The Actions observation adapter must bind repository, workflow identity/version,
run ID, attempt, job/check identity, platform, PR head and tested revision/tree.
Document the relationship between PR head and GitHub's synthetic merge revision;
do not accept a stale merge tree after the target advances. Check names alone and
`needs.*.result` alone are insufficient provenance.

### 4. Shadow and challenge before activation

First replay captured full runs without changing workflows. Record each run's
immutable inputs, derived closure, proposed matrix, actual full results and every
difference. Incomplete authority yields an explicit unresolved report while full
CI remains mandatory; it must not be recorded as selective success.

A later non-required live shadow job is a separate workflow Change for Owner
alignment. Shadow may observe all jobs while proposing fewer; observed unselected
jobs must not be misreported as selective passes. Preserve the complete baseline
for comparison and feed #760 exactly its selected observations.

Planned discriminating challenges:
- Remove impacted Guard Windows from both selected and excluded.
- Add a dependent with valid owner traces, without editing Engineering's selector.
- Remove/alter ownership, a trace or conversion evidence; supply a partial graph.
- Remove an edge from an otherwise consistent graph: independently checked owner
  source/conversion completeness must detect the gap, not infer no impact.
- Omit an untraced/unreadable Case or a shared-root/import/script dependency.
- Forge candidate Change scope, policy, non-impact evidence or authority flags.
- Omit/rename a policy job or required host; tamper with an input digest.
- Replay stale head, target, workflow, run or attempt evidence.
- Return missing/skipped/neutral/cancelled/timed-out/failed execution outcomes.
- Attempt selective assurance for main or for CI/security/release infrastructure.

Each challenge must fail closed or retain explicitly reported full assurance.
Record behavioural RED against deliberately incomplete implementations; missing
exports or unavailable dependencies are blocked evidence, not discriminating RED.
Keep a positive with proven unaffected Guard and one with actual Guard impact.

## Delivery sequence and exit evidence

1. Review this PLAN and refresh the dependency ledger with owner evidence.
2. Complete C11 P1–P3 and Graph integration in their respective owner Changes.
   Integrate accepted dependencies through normal repository flows; no ad hoc
   cross-collector copying.
3. Review the governed contract/Case-to-check/OS policy with affected owners.
4. Raise a bounded adapter DO against kaal/engineering, unwired, with executable
   authority/provenance and omission negatives. Preserve #760/#764 regressions
   and provide current-head Engineering CI evidence.
5. Produce retrospective shadow comparisons, then separately propose any live
   shadow workflow. Investigate every unexplained omission.
6. Return to the Owner with authority evidence, complete matrix, challenge
   results, shadow differences, actual protection/check-source inventory and
   proposed migration/rollback. Only a separate Owner decision can authorize
   workflow routing or required-check migration.

No fixture-only green, self-attestation, or unverified dependency row satisfies
an exit. This PLAN changes Markdown only and authorizes no merge, synchronization,
promotion, publication, workflow activation or branch-protection mutation.
