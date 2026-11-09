# Declaration delivery: Architecture and execution

- **foundation/A15** [foundation/F25, foundation/F26, foundation/N15]: Add one
  exact file to package.json `files`: `capability/Foundation.md`; add export
  `./capability` to `./capability/Foundation.md`. Keep `./sha256` and
  `./package.json`. A package-local `.gitattributes` marks the authoritative file
  `-text`; it is publisher metadata and does not ship. No loader/helper/schema
  package is introduced. The existing manifest generator discovers the Node
  through npm's pack inventory, and the existing host-hash verifier protects it.
- **foundation/A16** [foundation/F27, foundation/N16]: No Foundation lifecycle
  adapter or persistent registration store is added. npm manages the installed
  package; Core manages its explicitly requested Engine operation. Foundation
  approves its declaration transport and lack of a Foundation state record;
  Core's owning Change must accept and test how it retains/removes registrations
  under its existing Engine lifecycle. This is an owner-specific interface,
  not a new generic cross-product registration standard.

## PR sequence

1. Existing #749: independently approve C12 against accepted #743 and integrate
   only after separate authorization. Do not add delivery/version work to it.
2. C15 PLAN, this PR: approve the exact delivery, lifecycle boundary and T9/T36
   amendments. It can be reviewed before #749 integrates; no Node is invented.
3. C16 DO from the then-current Foundation collector: reuse #749's exact Node
   and claim; implement only package export/inventory/version, byte attributes,
   delivered docs and tests; regenerate manifest explicitly. Apply only the
   independently accepted T9/T36 changes. Move planned cases unchanged into the
   declared publisher/embedded suites. Get independent current-head review.
   A stacked draft may make the candidate reviewable before these prerequisites
   integrate; its ancestry/cumulative diff is not independent integration proof.
4. Foundation acceptance CHECK: preserve all current-head source, normal pack,
   installed verifier, negative, reproducibility and three-host evidence. Add a
   Foundation-owned scenario under test/acceptance/ for the existing Testing
   discovery/Engineering packing lane. It consumes only the ledger-recorded
   candidate, uses the existing Hosting operations and runs installed Foundation
   verification plus public declaration resolution on Linux/macOS/Windows.
   No workflow change or weakening of checks is required.
5. Prepare a governed main → kaal/foundation SYNC, merge-commit flow. Current
   main and collector diverge: main is seven commits ahead, Foundation one.
   Compared heads change no Foundation product path on main, so no Foundation
   content conflict is currently indicated; prepare/judge the real merge tree
   and every conflict before requesting integration. Recheck moving heads.
6. After separately authorized SYNC, refresh acceptance and propose the focused
   kaal/foundation → main promotion, squash, under the current promotion queue.
   Open no promotion merely to reserve a queue position. C13 work does not ride
   this release unless separately approved and explicitly added by the Owner.
7. Separate Owner publication decision: Release workflow on main, package
   @kaihacksai/kaal-foundation, version 0.0.2. Pack once with the workflow's
   pinned npm; publish that exact recorded artifact through the existing
   trusted-publisher path after npm-environment approval. Registry Accept must
   compare tarball hash/integrity, provenance and a fresh installed verification.
   Confirm package-specific trusted publisher readiness; its existence is not
   proven by 0.0.1's manual bootstrap. Never repack for publication.

## Dependencies: implementation versus publication

Implementation needs #749's owner bytes and this PLAN's independently accepted
amendments. It needs no Core/Hosting npm publication, scoped Hosting migration,
Graph publication, #747, or new consumer boundary-testing framework. Foundation
continues to have zero runtime dependencies. Core may develop/tests against the
accepted contract and use a local 0.0.2 tarball for bounded integration evidence;
governed repository consumption still goes through main, never collector merges.

Publication needs final Foundation acceptance, independent review, governed
SYNC/promotion and separate Owner release authorization. Current Release exists
on main and already supports Foundation. Packaging's generic gate and Testing's
conformance are reported according to the accepted release policy: unavailable
means not run, never verified. Do not silently import collector-only interfaces
or turn the separate boundary-testing work into a Foundation release blocker.
Registry readiness, real dependency resolution, trusted publisher configuration
and exact artifact/provenance acceptance are publication evidence, not proof
supplied by a local tarball experiment.

## Concrete repository compatibility dependency discovered at CHECK

Current Core pins `@kaihacksai/kaal-foundation` exactly `0.0.1`, both in its
package manifest and root lock entry. `engineering/acceptance/embed.test.mjs`
asserts that exact dependency map and that Core has no nested node_modules.
Testing's existing acceptance ledger also judges Foundation installations
against the run's one Foundation candidate. A shared acceptance run cannot
silently mix a new 0.0.2 workspace with a nested registry 0.0.1 and claim the
single-candidate guarantee. Changing Foundation's package version alone is
therefore not repository-integration ready.

Before final integration/promotion, prepare a separate Core-owned compatibility
Change for consuming Foundation 0.0.2, its committed package manifest and the
relevant immutable dependency assertions under Core's reviewed PLAN. Existing
bootstrap behavior and regression tests stay. This dependency adaptation does
not require C40's mandatory initialization to be finished, or Core npm publication.
The delivering owner initiates the root-lock reconciliation through Engineering's
accepted dependency route; never hand-edit or manufacture a lock as evidence.

Core travels alone under the current trusted-main isolation checker. A combined
Foundation+Core promotion therefore needs Engineering's independently accepted
admission route or another explicitly governed bounded delivery sequence before
it can land; this PLAN grants no exception. Do not bundle Core edits into C16,
quietly repin existing consumers, suppress the nested-copy assertion or weaken
the acceptance ledger. Scoped Hosting migration work (#833/#834) is separately
owned; its existence does not prove that this version transition is admitted.
Root-lock and Core compatibility are repository-integration dependencies, not
Foundation product-code dependencies or npm publication-order dependencies.
