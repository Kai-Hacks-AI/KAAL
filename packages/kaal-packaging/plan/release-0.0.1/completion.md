# Packaging 0.0.1 completion — packaging/C12 PLAN

## Intent and authority

Complete @kaihacksai/kaal-packaging@0.0.1 by extending the existing contract, conformance, measure/conform commands, Skill and installed verifier. Packaging defines what a good KAAL package requires; Testing defines testing methodology and evidence semantics; each package owns its boundary definitions, Test Plans, Cases, fixtures, expectations and product judgments. Engineering owns orchestration, admission and release. The Owner authorizes integration and publication separately.

This is the overarching completion carrier, not a restart of C1–C9. C10 (#746) reserves C11 and F20–F24/T37–T50 for dependency traceability. Those identifiers are not reused here. C12 and later Change numbers are provisional.

## Exact inspected state, 2026-11-02

| State | Observed revision and consequence |
| --- | --- |
| main | f30221f481c4682e81b092e6a772365f3d7a9f6d |
| kaal/packaging | 1c743dbd496d652c8343d2a4c0cb8a9a4950b755; 12 ahead, 14 behind main |
| merge base | f0d1eb94b5196b290044764832cba4ddd22ed408 |
| #686 | Open promotion of the collector, not a frozen C1–C5 snapshot; its title/body and zero-behind assertion are stale. Keep held; never promote unchanged. |
| #710 / #713 | Integrated C8 PLAN/C9 DO. Reuse their implementations and preserve the recorded interim nature of self-conformance. |
| #746 | Open C10 PLAN, not integrated. Its dbbf2b4 amendment distinguishes npm field semantics and target-revision identities. Its C11 DO is a separate track. |
| Testing | Collector 9f112e6524861fba502a941c84c6e585b8c35698 supplies real model/check/tested and verifier contracts. #718 remains a separate installed-delivery Change; #837 is its completion PLAN. |
| Engineering | main already has the release engine. #834's workspace-directory selector remains a draft; trusted migration admission is separately owned. |

The collector diff from the merge base consists of Packaging plus root workspace/lock entries and Packaging's AGENTS.md section. Main has moved independently. A new collector cut from main and a transplant of historical Packaging commits would evade the required SYNC and is excluded.

## Minimum good-package requirements

Existing packaging/F7–F19 and N7–N12 remain authoritative: exact identity and dependency versions; recorded registry resolution distinguished from provenance; six shipped documents and linked Operations; declared source Test Plan; installed Embedded verification; exact file/Case manifest; Testing model traceability; declared runtime and Hosting-owned portability; intact consumer; behavior-based verification; practical Skill and thin commands.

**packaging/F25 — package boundary assurance.** A package identifies every material incoming and outgoing boundary, the contract owner and contract identifiers it provides or consumes, and how its ordinary owned Test Plan exercises its obligations. Its plan names Cases and the fixtures, expectations, helpers, configuration and dependency inputs giving them meaning. Evidence names the candidate and conditions; unresolved evidence remains unknown under Testing. The package owns its product judgments and refuses to infer another package's correctness from its own result.

Boundary direction means an interaction entering or leaving the package. A dependency can be incoming to one contract and outgoing to another; record the actual obligation rather than forcing all dependency fields into runtime obligations. Define permitted, prohibited and undecidable architectural interactions; exercise successful and refused public operations and demonstrate state preservation where promised. Test foreign contracts through their public interfaces only.

F25 is delivered in the six existing documents and ordinary Testing models/Plans, not a new boundary schema, runner, Testing export or generic consumer suite. The existing F8/F13 findings continue to check documents and model structure. Semantic completeness and adequacy are explicitly recorded validation by the package owner, never silently elevated to automated conformance. Missing or unresolved validation prevents a claim of full release acceptance.

### Packaging's own boundaries

| Interaction | Packaging obligation and test ownership |
| --- | --- |
| Incoming measure API / CLI | Accept an artifact and options; refuse invalid/tool-inconsistent inputs; report bytes and tool/artifact identities without a product budget. Existing T1–T14/T29/T34 plus focused new regressions. |
| Incoming conform API / CLI | Judge the installed package's generic contract, report each finding and preserve the consumer. Keep product verification beside generic conformance. Existing T15–T26/T29/T32/T35. |
| Outgoing Hosting | Use public execute/filesystem/conformance contracts, with no OS branches or direct OS realization added. Validate actual scoped exports and behavior before migration; Hosting owns portability challenges. |
| Outgoing Foundation | Use the public SHA-256 export and preserve digest semantics. Retain exact 0.0.1 unless an actual Packaging obligation requires another version; no declaration consumption is needed here. |
| Outgoing npm | Tool version >=11.18.0; bounded checked reports; no shell argument reinterpretation. Resolve dependencies from install records, without network provenance claims. |
| Caller-supplied Testing functions | Consume real check/tested for final F13 acceptance; absent functions remain unknown. No runtime Testing dependency and no Testing implementation. |
| Installed verifier to consumer | Check intact installed bytes and exact declared Case execution; diagnose according to testing/F43–F50; write only removed scratch and leave consumer content unchanged. |
| Engineering release consumer | Export the existing conformance/measurement contract; deliver one normally packed artifact, exact inventory and evidence that the release engine can independently judge. |

### BASS delivery

Bare: README and Operations give safe scoped installation and executable path commands.
Agent: root AGENTS.md points to the shipped Skill and states the ownership limits.
Skill: guide boundary inventory, ordinary three-loop Plans, RED → GREEN → REFACTOR, BRITTLE review, evidence interpretation and escalation by reference to Testing. Include a small worked Packaging-owned boundary example and a route using shipped docs when no Engine is present.
Script: retain measure, conform, the manifest generator, source dispatch and verifier; extend only repeatable checks demonstrated missing. Semantic product judgments remain guidance and recorded validation.

## Demonstrated gaps and exact Changes

| Proposed Change | Deliverable |
| --- | --- |
| C12 PLAN, this carrier | Approve F25, declare acceptance and the bounded amendments to existing planned identity/interim expectations. No runtime change. |
| C13 DO — boundary and practical guidance | Update shipped Requirements/Architecture/Testing/Operations/limitations, README and existing Skill; name Packaging's boundaries and ordinary owned Plans. Update root agent references in their permitted isolated Change if needed. Regenerate the shipped manifest. |
| C14 DO — installed verification and conformance interoperability | Extend the existing verifier, not a replacement runner: integrity/inventory preflight; exact Case accounting; dependency/startup unknown vs established failure; complete diagnostics and observed identity via accepted Hosting contracts. Add focused publisher regressions, consume Testing's actual pure contracts externally, and remove stale provisional-contract claims. Examine the existing result parser and N9 probe against discriminating cases; correct only established gaps. |
| C15 DO — scoped delivery | Set name @kaihacksai/kaal-packaging, public metadata and exact scoped Hosting dependency after accepted compatibility. Preserve CLI and Skill identifiers. Migrate only actual self-imports, docs, consumers and workspace/lock references, each through its owner and Engineering's admitted route. No aliases or collector transplant. |
| C16 CHECK / release acceptance | Run unchanged existing suites plus focused regressions, normal lifecycle pack, exact inventory, independent clean consumer, full self-conformance with real Testing functions, negatives and three-host acceptance; prepare fresh SYNC/promotion/publication evidence. Correct newly found defects through focused owned Changes. |

C13 and C14 can be developed against the existing public Hosting/Foundation interfaces before their next releases. C15 can be developed and locally verified with accepted packed dependencies before npm publication. No separate dependency-traceability implementation is imposed as a quality feature of Packaging 0.0.1. If Engineering admission concretely needs C11 output, record that external admission dependency and its accepted route.

### Explicit amendment before DO

T27 currently requires exactly two local-tarball dependency failures, naming unscoped Hosting and Foundation. Keep that interim observation; add a separate final registry-resolved self-conformance acceptance and require the real Testing functions with no stand-in fallback. A local packed-dependency run must still fail F7 and cannot satisfy final acceptance.

T28's declaration assertion names the current three scripts; any added declared publisher suite must be amended here before DO, preserving complete source execution and installed-only Embedded execution.

T36's path expectation names node_modules/kaal-packaging. Amend it to the package-owned scoped path, preserving the unrelated-bin negative and unreachable-registry control. Keep CLI/Skill names kaal-packaging.

Existing Embedded self-imports and deliberately conforming fixtures must receive only the scope/contract compatibility amendments explicitly approved for their corresponding target. Do not strengthen a generic requirement while leaving its positive fixtures nonconforming, or weaken an expectation to accommodate the implementation. All other existing assertions and negative fixtures stand. Record any additional planning defect separately before changing its boundary.

## PR and integration sequence

1. C12 PLAN into kaal/packaging; independent review and current-head required checks.
2. C13 and C14 focused ordinary Changes on the accepted collector, each independently reviewed. Source-only work can proceed while dependencies remain unpublished.
3. Owner-reviewed compatibility/admission preparations for C15, then its scoped Change and external owners' isolated reference/lock Changes. Engineering decides how its release-selector and trusted migration admission reach main; this work cannot promote its accumulated collector.
4. Prepare main → Packaging SYNC from the actual collector tip. Determine conflicts and isolation from exact Git ancestry; use staged main commits if necessary. The SYNC head is the merge itself and lands by merge commit only after separate authorization. No DO hidden inside it.
5. Re-run C16 on the integrated candidate. Refresh #686 around its actual complete diff and dependencies, or replace only with an explicitly tracked successor if governance requires it. Promotion is collector → main by squash, fresh and independently accepted.
6. After promotion and dependency registry availability, use Engineering's Pack run and exact artifact record. No repack in Publish. Packaging's first publication follows the Owner's first-name route; registry acceptance compares the tested bytes and verifies a fresh installation. No publication now.

## Implementation versus publication dependencies

| Dependency | Implementation / local acceptance | Promotion / publication |
| --- | --- | --- |
| Foundation 0.0.1 | Existing SHA-256 contract suffices; no 0.0.2 wait. Current registry availability must be measured by the release engine, not inferred from stale collector docs. | Exact pinned version must resolve from registry for F7/readiness. |
| Scoped Hosting 0.0.1 | Accepted exports and packed candidate suffice for compatibility work and bounded local checks. | Owning compatibility, admitted migration, main delivery and required CI before scoped promotion. Registry publication before Packaging publication/full F7 acceptance. |
| Testing model/verifier contracts | Real collector or accepted packed modules can be supplied by the caller/harness. No runtime dependency, no need to wait for Testing npm publication. | Accepted contracts and independent interoperability evidence required; Testing's publication alone is not a Packaging runtime gate. |
| Engineering | Existing engine/readiness is inspectable now. #834 selector and trusted migration admission remain Engineering work. | Main must contain the admitted release route; no workflow/check relaxation. |
| C10/C11 traceability | Separate concern; do not implement speculatively here. | A gate only if Engineering's accepted migration contract actually requires it; name the exact gate. |
| Owner | No additional product decision needed to inspect, plan or develop bounded changes. | Independent acceptance, each merge/SYNC, promotion and exact-artifact first publication separately authorized. |

## Acceptance evidence and current limits

See testing.md for concrete cases, boundaries and run requirements. The read-only inspection reconstructed the pinned Packaging/Hosting/Foundation source and checked original blob identity for conformance.mjs. Offline installation with the existing lockfile and normal Hosting compilation succeeded. A non-writing manifest check succeeded.

Normal npm 11.21.0 pack, lifecycle scripts enabled: 24 files; 23 manifest hashes all matched actual tarball members; exactly 31 declared Cases; no extra/missing inventory member. Packaging declares no prepack hook; none was invented. This is the current unscoped collector, not the scoped release artifact.

Testing's real model module at 9f112e6 reports no findings for the shipped model: 31 Cases, 35 traced targets. That alone is not full F13/self-conformance or consumer acceptance.

Diagnostic fixtures using unchanged test/verify.mjs report verified/0 for a changed hashed payload, a duplicate Case and an undeclared Case, alongside a passing control. They establish verifier regressions, not release acceptance. Source suite results and tooling limits are recorded separately; no three-host or fresh registry acceptance is claimed.

## Owner decisions remaining

- Independent review of C12, including F25, validation versus automated coverage, and the explicit T27/T28/T36 amendments.
- Integrate each reviewed Change and govern the compatibility/SYNC queue when exact candidates are ready.
- Accept the exact release candidate and authorize its promotion and first publication separately.

No merge, SYNC integration, promotion, auto-merge or publication is authorized by this PLAN.
