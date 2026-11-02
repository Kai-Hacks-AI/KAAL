# Hosting dependency for Core 0.0.1: bounded delivery proposal

Date: 2026-11-02. This is an Engineering proposal for independent Owner review,
not a live admission rule, an integration decision or publication authority.

## Accepted state and the deliverable

Inspection pins: main `f30221f481c4682e81b092e6a772365f3d7a9f6d`, Hosting
`23796c979eaae412b366a10d2dd7cef50155e0d4`, Core
`f4c47049c9c54d0c15b62e7f53bb2049be7c23dc`. Reacquire all three before any
integration; these snapshots confer no future freshness.

The dependency is exactly `@kaihacksai/kaal-hosting@0.0.1`. Core consumes the
existing read/readFile/kind/initialize/update/reconcile operations and HostingError
types. Its shipped runner/verifier uses execute and reads. The publisher uses
the conformance interface. Core invokes its own kaal CLI, not Hosting's boundary
command. Hosting has no runtime Core or Graph dependency. Core retains published
Foundation 0.0.1 and YAML; Graph stays build-only. No Graph publication, exclusion
feature, generic boundary/BASS framework or new host operation is selected here.

All sixteen Core production files on Hosting equal main after normalizing only
the Hosting specifier. Local build/boundary 5/5 and collector run 41359368840
establish the existing contract integration. That run reports Hosting 139/139
plus real packed/installed 15/15 and installed Core 11/11 on all three hosts.
Those historical results do not qualify any future corrected release candidate.

## Review candidates and order

| Candidate | Owner and purpose | Integration prerequisite |
| --- | --- | --- |
| #831, hosting/C27 | Hosting's four demonstrated existing-contract defects | independently reviewed frozen tests, current mandatory checks and native host/packed evidence |
| #832, hosting/C28 PLAN | Owner decision on root containment versus existing sibling lock/staging/recovery footprint | product decision first; a separately reviewed bounded authoritative-doc/Skill DO follows only if accepted |
| #830, hosting/C29 | exact existing runtime versions and complete exit/causes verifier records | independent review and current source/normal packed consumer evidence; refresh after preceding Hosting integrations |
| proposed workflow-selector preparation | Engineering, .github-only | independently approved bounded delivery route and exact required CI; no publication trigger/default/permission changes |
| proposed migration admission | Engineering | independently approved PLAN and narrowly scoped DO; target-owned proof of the actual transition; no historical allowance copied as authority |
| #765 sequence | owning compatibility Changes, then staged main-to-Hosting SYNCs | actual previous accepted tips; every SYNC independently reviewed, verified and landed by merge commit |
| new Hosting promotion | Hosting and affected owners | current main ancestry, exact release scope, live admission/required checks, independent Owner approval and queue position |
| Release Pack, first publication, registry acceptance | Engineering orchestration and Owner | accepted main and separate release/publication authority; publish the tested artifact without repacking |
| new Core dependency integration | Core | accepted scoped Hosting state received through main; subsequent registry-only verification uses the published dependency |

Suggested ordinary Hosting order is C27 first, then the accepted disposition of
C28, then C29 refreshed onto the actual collector. C29's summary fields compose
with C27's duplicate/failure accounting; preserve both frozen suites and the
combined publisher command when rebasing. Nothing here arms or merges them.

## Separate workflow preparation

Main's Release workflow currently builds the unscoped Hosting workspace by name
in three places. Hosting's collector changes those to its scoped name. Carrying
that workflow difference in a multi-owner product promotion violates .github
isolation. Instead propose the exact three-selector change in
`release-selectors.patch`: use the unchanged workspace directory. The selector
builds either actual package identity and introduces no alias or fallback package.

Deliver that .github-only candidate through a separately approved bounded
Engineering route before the Hosting promotion. Then refresh Hosting's workflow
to the same accepted bytes through its required owning preparation/SYNC. Its
final product promotion must contain no workflow or gate modification. All
triggers, inputs, approvals, permissions, npm version, publication defaults and
required CI stay byte-for-byte unchanged by the proposed selector patch.

This document does not create or replace a collector. No existing collector may
be re-established under another name to escape staleness or unpromoted Changes.
The Owner must select the permitted bounded delivery route before opening a
promotion pair; ordinary working changes and staged SYNCs remain distinct.

## Main admission is an unresolved prerequisite, with a bounded proposed design

Current trusted-main Change Isolation enforces Core-travels-alone. The scoped
provider and its consumer declarations must change coherently: either isolated
half attempts to resolve a Hosting identity absent from its workspace/registry.
#823/#825 demonstrate that failure. Passing the collector's historical C11
allowance or path isolation is not main-side migration admission.

Propose a separately reviewed target-owned migration contract for this one
provider identity transition. Its DO must establish, rather than assume:

1. The trusted target and candidate snapshots and complete manifests; target
   Hosting has the old identity and the candidate the new identity/version. The
   proof is unavailable on missing/stale Git facts, and spent after adoption.
2. An explicit ownership-reviewed exact change ledger from the then-current
   accepted baseline. Core's algorithmic/runtime code must equal that baseline
   modulo the approved provider specifier; any additional exact byte-preservation
   inputs need their own Core review. No old Graph-collector Core may replace
   standalone Core. Preserve registration, embedded Node provenance, Foundation,
   build-only Graph, all assertions, delivered inventory and negative outcomes.
3. Owner-qualified adapters for manifest/import/workspace references, expected
   sorting where identity affects order, and deterministic verifier-manifest
   regeneration. The ledger must distinguish reference adaptation from changed
   meaning. Neither candidate-authored booleans nor path membership alone prove
   any of this; historical exact-path inventories are not current authority.
4. A complete lock independently derived twice from immutable target bytes and
   all candidate manifests using C16's existing helper, then clean npm ci and
   actual packed production-dependency installation. No alias, invented registry
   metadata, copied final lock or manually selected partial graph qualifies.
5. Unchanged required full CI, independent affected-owner review, Branching,
   source freshness, queue and protection enforcement. The migration changes no
   .github file or its own trusted admission policy. No generic impact-CI
   redesign or selective-test gate is a prerequisite for this bounded contract.

The DO's required negative challenges are: incomplete owner/path/manifest ledger;
changed Core algorithm or test predicate; missing provider/consumer reference;
forged lock integrity; source/target evidence mismatch; extra workflow/gate path;
reused authorization after identity adoption. The positive case must be the real
complete migration, including its packed consumer. Fixtures alone cannot qualify
the repository transition. Default isolation continues to apply to every other
Change. If a safe bounded rule cannot be demonstrated, admission remains blocked.

No gate DO is implemented or approved in this proposal. The current collector's
temporary checker and future Engineering plans must not be imported by accident
as part of a Hosting product promotion. Freeze the exact main-relative scope
after synchronization and obtain Owner disposition of any unrelated integrated
collector content; do not silently discard or promote it.

## Remaining staged synchronization

#786 and #826 are already accepted; do not redo them. The next historical
intermediate main state is ef78dcadf11007fb5826b41f47814299ebe8ddb9. Rejudge that
step against actual tips rather than trusting an old rehearsal.

Before taking #796's main state, Testing must adapt its newly arriving duplicates
acceptance Hosting references and complete manifest. Before #804, Engineering
must adapt the arriving execution acceptance/mutation references without
activating that inactive adapter or changing assertions. Before #809/#815,
Change/Engineering must preserve the newly accepted required production Graph
and Hosting providers while adapting scoped identity and the complete root lock.
Finally receive #828's Graph input preservation unchanged. Use real conflict
inventories; a cleanly arriving file needing extra adaptation belongs to a prior
owning Change, not a silent SYNC edit. #765 is tracking context, not an executable
direct-main PR; each actual SYNC head is its reviewed merge commit.

#766 and #823/#825 are historical proposals, not the accepted baseline. No
cross-collector merge or historical package transplant is part of this route.
Core #829/#816 proceed independently. C41 is not enlarged by this proposal.

## Release qualification and Owner decisions

Require fresh exact-candidate Hosting source and negative suites, normal prepack,
complete tar inventory, installed verification, boundary/usage checks and all
required Linux/macOS/native-Windows checks. Source-workspace success or diagnostic
ignore-scripts packing is insufficient. Release runs on pinned Linux/npm and
retains one authoritative tested tarball with its bound record. Existing
cross-host candidate artifacts differ; no cross-host byte identity is claimed.

The current C29 local first group is 142/144 because sandbox Unix sockets are
unavailable; prepack refuses. That limitation grants no skip or waiver. Its
controlled verifier integration 11/11 and C16 lock reconstruction pass separately.
C27's independent controlled rerun passes 9/9 with 5/5 mutation kills, without
establishing native FIFO/socket availability here.

Release readiness must use the accepted main contract at execution time. If
Packaging or Testing conformance reaches main first, its now-required checks
must run; today's explicit not-run status cannot be carried forward as a waiver.
No unfinished generic contract is invented as a present requirement either.

Owner decisions are the C28 semantics, the bounded admission design and delivery
scope, then the concrete promotion pair and order. FIFO applies unless an explicit
traceable Promotion-Order instruction names the older promotions on the relevant
promotion. No queue override is inferred from this request. Package publication
remains separately authorized: download and verify the Release artifact, first
publication by the Owner with 2FA, establish Trusted Publishing, then mandatory
registry acceptance of identical bytes and a fresh registry-only installation.

After publication, Core's separate scoped release Change declares Hosting 0.0.1
and verifies actual public API/CLI/installed cases without Graph installed. Keep
Foundation's published 0.0.1 immutable. No release-ready result is claimed here.
