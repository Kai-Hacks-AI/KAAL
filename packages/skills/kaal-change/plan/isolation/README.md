# Change isolation: focused bridge PLAN

This is a bounded delivery of the Change capability through `kaal/change-isolation`,
targeting `main`. It is not a new capability and not a replacement for
`kaal/change`. The Owner explicitly chose this bridge to deliver useful isolation
without the other collector's unfinished work.

## Result to deliver

An installable, narrowly documented `kaal-change` slice exposes
`@kaihacksai/kaal-change/isolation`. Given a proposed Change and owner-supplied
trace, ownership and interface evidence, it explains the isolated scope, affected
surroundings, crossing interfaces and multi-loop testing obligations. It names
missing evidence. It executes neither the subject nor its tests.

The first delivery must work through its public interface in a clean consumer,
against a complete controlled model with incoming drivers and outgoing doubles.
That is a usable model-scoped library, not a claim that KAAL's repository already
has authoritative trace coverage or selective CI.

## Delivery route

1. Review this PLAN through a working PR into `kaal/change-isolation`.
2. One bounded DO supplies the minimal package foundation, isolation implementation,
   owner-boundary tests, consumer documentation and packed-consumer acceptance.
   Workspace registration and its derived lockfile are the explicit Engineering
   integration surface, reviewed by Engineering.
3. After independent review and full repository/host assurance, promote
   `kaal/change-isolation` to `main` through its own PR. Synchronize if main
   advances, using the existing judge and merge method. Delete the bridge after
   promotion. Reconcile the delivered slice into later Change development through
   the normal reviewed integration route.

The promotion is not opened early merely to reserve a place. No merge or npm
publication is performed by this PLAN. Engineer PRs land by squash; synchronization
uses a merge commit; promotion uses squash, as the repository judge determines.

## Source and dependency cut

Baseline inspected on 2026-11-01:
- main: `be3a2d09a386967bd5a1cd4a850f389951bc0796`.
- existing Change collector: `66a3222d4cd677db25be99ce47f3392d3ac92ea1`.
- main contains no `packages/skills/kaal-change` package.

| Concept/source | Treatment in the bridge |
| --- | --- |
| Change's responsibility and bounded alteration, #234 / Change and Change-Definition Nodes at the inspected Change tip | Reuse the meaning. Deliver the minimal Nodes and license; revise the Capability Node's inventory so it promises only what this slice actually delivers. Re-pin its own claim with Foundation. |
| `alters` / `scope` names and owner-identity forms, #744 | Reuse for a plain-value proposal input, with malformed statements refused whole. No import of the unfinished delivery assessor is required. |
| Engineering/C11 #683 / #739 | Extract the generic isolation intent, potential-impact/selected-scope distinction and missing-evidence negatives. Reimplement the product contract under Change; do not copy Git admission logic, fixture authority flags or Engineering's path defaults. |
| #760 / #764 | Keep in Engineering: selection of CI checks and observed execution are distinct from semantic isolation. Do not copy them into Change. |
| #769 / #777 | Keep the authoritative repository adapter and root-file/lock governance in Engineering. They are integration concerns, not dependencies of the standalone model-scoped product. |
| Graph's public traversal, Core's admission/types, Foundation's SHA-256 and Testing's existing acceptance facilities on main | Consume public contracts where needed. Graph traverses; Change does not invent another graph engine. Admission, new digests and test evidence retain their owners. |
| #662 delivery, succession/delivery satisfaction, lifecycle, classification, CHAOS, FAR and the full #636 release programme | Excluded from this slice. Do not merge/cherry-pick the whole Change collector or promise its undelivered exports. |
| Global P1–P3 migrations, full repository graph conversion, CI selection/activation and rulesets | Deferred integration work. Absence must remain visible; it must not be filled by mocks when asserting repository completeness. |

No entire source commit is pre-approved for cherry-picking. The DO records each
reused file or amended concept against immutable source and includes only its
dependency closure. Package identity follows the existing scoped naming decision;
this slice must not claim completion of the broader Change 0.0.1 release or publish
a version as a side effect.

## Ownership decision carried by this PLAN

Change owns the generic isolation contract and assessment. This supersedes the
earlier allocation of that generic meaning to Engineering in C11 and the C9
ownership table. Engineering retains Git/path admission, execution scheduling and
CI/merge enforcement. The existing `assess` delivery API stays unchanged:
`isolate` is a separate API. Other collectors' documents are not silently edited;
their reconciliation must cite this decision when the bridge lands.

| Responsibility | Owner |
| --- | --- |
| Proposed alteration, selected scope, isolation assessment and obligation orchestration | Change |
| Intent, functional/nonfunctional requirements, Defects, Architecture and interface meanings | Their respective owners |
| Relationship traversal and graph mechanics | Graph |
| Test/double/driver semantics, loops and execution evidence | Testing |
| Admission and foundational Node typing | Core |
| Filesystem/process mechanics | Hosting |
| Git/path rules, CI job/OS policy, trusted repository adapters and branch protection | Engineering |

See [intent](intent.md), [requirements](requirements.md),
[architecture](architecture.md) and [testing](testing.md). Proposed identifiers
I19–I21, F38–F45, N9–N11, A18–A21 and T41–T50 follow the inspected Change tip;
check other in-flight Change work for collisions before landing.
