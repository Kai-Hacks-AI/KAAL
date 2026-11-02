# Core/C43 proposal: initialization preflight implementation

Observed 2026-11-02. This is a bounded DO preparation under accepted C40, not a
replacement release PLAN. Independent review and remote CI remain outstanding.
No merge, auto-merge activation, promotion or publication was performed.

## Verified repository state

| Ref | Inspected head | Consequence |
| --- | --- | --- |
| main | `f30221f481c4682e81b092e6a772365f3d7a9f6d` | Accepted Graph byte preservation; unchanged during this work. |
| kaal/core | `aa7af6257e1b3988c46a352f191a1e5a73c38f4e` | C40 #813, Graph SYNC #829 and C41 #816 are integrated. This Change starts here. |
| C42 #827 | `77bbb4a9c22af7189e329b0eb38bf2768a4521c1` | Open draft, six-path navigation diff against the actual Core collector; no prerequisite replay needed. |
| kaal/foundation | `f77de4efc57ddc239a6fb118fbdbe2e4b6a8326f` | Published 0.0.1 remains immutable. No consumer declaration delivery is present. #749 remains open and explicitly does not ship its declaration. |
| kaal/hosting | `ec5ce9f88f1ccd5bea3c68b78f8eb7e832c5b93d` | #830 is already integrated. Scoped Hosting and its Extension declaration exist here; C27 #831, C28 #832/#835 and governed delivery remain separate. |
| kaal/testing | `9f112e6524861fba502a941c84c6e585b8c35698` | Accepted collector exports the model reader. Local use does not require npm publication. |
| kaal/packaging | `1c743dbd496d652c8343d2a4c0cb8a9a4950b755` | Accepted collector exports conform/conformSource. It is absent from main, but was used locally as an external assessor. |
| kaal/engineering | `36b49dd855f29015da7bbeb76176bfc7e7add27d` | #833 route PLAN is integrated. Migration admission is a proposed, separately owned DO; selector #834 remains separate. |

## C42 review

The six changed paths preserve the immutable C40 tests, Skill bytes, runtime
code, package identity, dependencies and Graph provenance. The Installation
Contract catalogue and committed manifest follow the exact changed navigation.
The tracked Engine navigation equals the shipped navigation. No new blocking
defect was found in this diff inspection.

A separate clean checkout of its exact head passed `npm test -w kaal-core`:
201 TAP tests, zero failures/skips/todos/cancellations, plus delivered 12/12
verification. Its full `npm run test:acceptance` passed 40/40, with the two
existing containment/unrecorded-installation unknowns still explicit.

GitHub current-head product/security/isolation checks were successful, including
native Linux/macOS/Windows Acceptance, Hosting and Guard. Branching remained
unsuccessful with auto-merge disabled. There were no submitted PR reviews at
inspection. This local review does not arm or integrate the PR and was not
submitted to GitHub.

## Implemented slice

- Extract the existing contribution validator into `src/contribution.ts` and
  reuse it inside the same Hosting `update` callback. Registration retains its
  validation order, error context, input snapshot, admission rules and no-op
  behavior; it still publishes through Hosting.
- Add internal `planInitialization` and `initializeContributions`. They assemble
  and verify a prospective Engine before one Hosting `initialize`, preserve
  declared CASE kinds and check supplied exact name/id bindings. Empty input,
  malformed/type-invalid/wrong-kind/conflicting/changed declarations refuse.
- An existing valid bare Engine is refused as incomplete by this internal path,
  with explicit recovery direction and unchanged author guidance/configuration.
  A complete byte-identical contribution set is a no-op. Files merely present at
  arbitrary paths are not adopted as registered contributions.
- Add nine publisher Code tests. The first six were committed at `aa19277` with
  executable stubs and observed 6/6 RED before implementation; their bytes remain
  unchanged. Supplemental tests replace each bad binding separately so a prefix
  conflict cannot conceal its actual admission discriminator. Portable-path
  publication refusal and consumer-file preservation are exercised too.
- Enroll both new Code files in the existing publisher suite, regenerate the
  committed manifest, and extend the exact Acceptance tar inventory by only the
  two modules' four emitted `.js`/`.d.ts` files. The deep-equality inventory
  assertion and all previous entries remain intact. Initial Acceptance correctly
  failed on those four missing expected entries; the corrected run is below.

This internal path is **not wired to CLI init or the supported public API**.
It is not a public declaration transport, mandatory-roster policy or completed
record/lifecycle integration. It creates no dependency-owned record. No Core
declaration loader is invented for Foundation. Tests use exact existing Core,
Core Skill and Hosting bytes; they do not fabricate a Foundation substitute.
Generic bootstrap and the existing CLI retain their accepted implementation
until the actual owner bindings/lifecycle contract can be integrated. Therefore
this preparation does not claim T100 or CLI T101 GREEN.

## Local execution evidence

Linux, Node 24.22.1, npm 11.9.0; locked dependency installation, normal build and
normal prepack. No ignore-scripts consumer installation or test relaxation.

| Execution | Observed result |
| --- | --- |
| Focused new Code tests | 9/9, no failures/skips/todos/cancellations. |
| Final `npm test -w kaal-core` | 209 TAP tests passed, plus all 12 delivered cases executed and verified. |
| Final `npm run test:acceptance` | 40/40, no failures/skips/todos/cancellations. Seven packages packed once; installed Core verifies 12/12. Existing two assurance unknowns remain explicit. |
| Separate fresh consumer | Normal `npm install --omit=dev` of the exact Acceptance artifacts; installed Core `npm test` verifies 12/12, without Graph, TypeScript or source/PLAN directories in Core. |
| Full `node --test packages/kaal-core/test/plan/release.test.mjs` | 9/10; only T79 fails at the unchanged unscoped Core identity. T76/T80/T91/T92/T93 pass, including tamper, missing, skip/todo, undeclared and behavioral failure negatives. |
| C40 immutable file, separate stable run | T98 and T102–T104 pass; T99/T100/T101/T105/T106 remain RED on this pre-C42 collector. T106 reaches its final-line assertion after healthy 12/12 verification. |
| Manifest `--check`, whitespace | Passed. Build/prepack do not regenerate the manifest. |

The early C42 source invocation crossed a checkout transition and is discarded;
the separate clean checkout above supplies C42 evidence. An overlapping C40
diagnostic initially observed incomplete verification during Acceptance prepack;
it is discarded in favor of the stable separate run above. Neither is counted
as a candidate result.

Foundation SHA-256 identities:

| Subject | Digest |
| --- | --- |
| C43 Core tarball from final Acceptance | `37b4d70d72148636609faaa7596c6496311d5112e415f22376a963e7821a1d9d` |
| C43 committed manifest | `646653c1bd2b96a5c1aa024a6d62d509114ad266dc1dd14eeb9af5c5ae09b76c` |
| Immutable published Foundation 0.0.1 artifact, unchanged | `36be7a4d6e176a00ccf9d50e127261b481c4feb2661a0da35933fb2b2ed35ed0` |
| Baseline Hosting artifact | `4b66b40696e2f86cca94c2fcd9dc3f959588d3c7d057eebcea62a0b7d04dc6ef` |
| Unchanged C40 planned tests | `ce4c4d36406b8605f500c153177329ebd6a5d60ed24783f46842655de87b6f79` |
| Frozen first six new Code tests | `81396150f55cd2af46aad6ca6067680436623bb0076f36cf631465657fc1235b` |
| Supplemental binding tests | `611b1892e4b096099de58d4a87f264aba619acb57b12042491c72ac1e7816c44` |

Only Linux is newly evidenced for C43. C42's native-host evidence does not qualify
this different artifact. Neither tarball installation nor matching Foundation's
published digest is registry-only acceptance for unpublished scoped Core.

## Real Testing / Packaging interoperability findings

The accepted collector packages were exported into a separate local assessor
directory; no collector was merged or transplanted into Core. Packaging received
Testing's real `check` and `tested` functions, not a Core implementation. Its
`conform` ran against the separate fresh installation of the exact C43 tarball.

| Requirement | Actual finding |
| --- | --- |
| packaging/F7 | failed: KAAL runtime dependencies were deliberately supplied as local tarballs, not registry resolutions. This is a publication-acceptance gap, not a reason to stop Core implementation. |
| packaging/F8 | verified: six delivered product documents and README operations link. |
| packaging/F9/F10 | failed: current final human-readable line is not the supported normalized result record, despite exit 0 and delivered 12/12. |
| packaging/F11 | verified: all 71 listed files match and all 12 declared cases ran exactly once. |
| packaging/F12 | verified: Node >=24 and no OS/CPU restriction. |
| packaging/F13 | unknown: 132 document identifiers, no shipped Testing model. |
| packaging/F14, actual conformSource | unknown: `node test/run.mjs` does not statically state the declared suites it runs to Packaging's reader. T80's behavioral evidence does not automatically satisfy that reader. |
| packaging/N7/N8 | verified: unchanged consumer and declared module dependency boundary. |
| packaging/N9 | unknown: no normalized result was reported. |

These are actual results, not conformance GREEN. The dynamic-dispatcher/source
reader mismatch needs an explicit interface resolution with Packaging while
preserving Core's source-versus-installed semantics and T80; changing a fixture
or treating unknown as success is not a resolution.

Pinned assessor source digests, computed by Foundation: Testing `lib/model.mjs`
`e350cc9837b80bbd09056729862274983de1fae24db6c88165328fb8357657f8`;
Packaging `lib/conformance.mjs`
`c8bf1ae25b06d343158de2708cb9795faccabac2c1f95176f689af8a297e5300`.

## Remaining Changes and transaction order

1. **C42 #827**: independent approval and separately authorized ordinary squash
   integration. Auto-merge stays off without Owner authorization.
2. **This C43 preparation**: independent review/remote CI, then ordinary squash
   into the actual Core collector. After C42 lands, refresh this working branch
   by ordinary rebase; retain C42 navigation and both new source Code files.
3. **Narrow immutable-assertion PLAN amendment** before the affected DO: enumerate
   the Installation Contract/payload expectation in T43, dependency-preservation
   expectations in T47, and T91's result-line/record parser and outcome spellings.
   Preserve exact inventories, ownership, every negative case, exact case
   identity and candidate/evidence assertions. C40 T98–T106 stay unchanged.
4. **Mandatory initialization DO**: acquire the actual Foundation 0.0.2 public
   declaration and agreed Hosting binding; supply the closed mandatory roster,
   ship Core-owned contribution bytes, plan Core's record with the complete
   prospective Engine, wire CLI init/default/external paths, and execute T100,
   T101, T108 and applicable T111. Owner transport/lifecycle decisions are
   implementation prerequisites; npm publication is not.
5. **Core scoped integration DO**: scoped metadata/imports/docs and exact
   Foundation 0.0.2/scoped Hosting 0.0.1 dependencies, with owning consumer
   preparations and Engineering's approved migration-admission route. Preserve
   C16's twice independently derived complete lock. Local accepted artifacts can
   qualify implementation before registry publication. No alias or unrelated
   collector content is introduced.
6. **Release interoperability DO**: one normalized report from the existing
   execution, Testing model in the existing manifest, full unfiltered
   `test:release` enrollment, Packaging reader interoperability, and the existing
   permitted Core Acceptance support path retaining that same report. Run
   T105–T110, installed negatives and native three-host assurance on the exact new
   candidate. No new workflow or required-check relaxation.
7. **Release transactions**: accepted dependency/main states reach Core only by
   governed merge-commit SYNC. Recheck focused promotion scope, freshness and
   queue; prepare the Release artifact/record. Actual runtime registry resolution,
   separate promotion/publication authorization and registry-only acceptance of
   the identical bytes are publication prerequisites. Graph publication is not.

Steps 4–6 may proceed against accepted local contracts/artifacts and can be
split further for review. Their final integration order follows actual accepted
prerequisites, not npm publication timing. No final promotion is opened to
reserve a queue place.

## Owner decisions and access blocker

- Independently approve C42, then explicitly authorize its squash integration
  and any required auto-merge arming. Product GREEN alone grants neither.
- Review this C43 implementation before integration; its internal helper is not
  completed mandatory CLI initialization.
- Approve the concrete Foundation/Hosting delivery and lifecycle contracts from
  their owners. Foundation 0.0.2 is already selected; no version choice is reopened.
- Review the narrow immutable-assertion amendments and resolve the observed
  Packaging F14/Core dispatcher interface. Retain T80 and source/installed
  discrimination throughout.
- Engineering owns the bounded migration admission and selector delivery.
  Focused promotion scope/order and npm publication remain separate later
  authorization decisions.

The connected GitHub PR/file tools repeatedly returned backend `Unknown tool`.
Direct public Git/API reads worked, but `/user` was unauthenticated and a
working-branch push dry-run failed because no GitHub credentials were available.
Consequently no remote C43 branch, PR, CI run or submitted review could be
created. The local commits and patch are the reviewable handover; restoring
authenticated GitHub access is needed to submit them. No browser fallback,
credential substitution or protected-ref write was attempted.
