# Core/C44 PLAN: bounded immutable-assertion amendments

Proposal under accepted C40 (#813), based on Core collector
`aa7af6257e1b3988c46a352f191a1e5a73c38f4e`. Independent PLAN review is
required before any proposed hunk becomes a live test. C43 #841 remains a
separate DO; this PLAN needs neither its integration nor npm publication.

## Intent and boundary

C40 requires explicit mandatory initialization and one normalized verification
report. Three older assertions encode the earlier payload-only installation or
two-record reporting. Amend those assertions explicitly while retaining their
behavioral discriminators. No new product meaning, capability, framework,
workflow or required check is introduced.

`proposed-tests.patch` is the complete proposed amendment against the baseline
files. It is review material, outside every test suite and npm file list. This
Change does not apply it, edit live planned tests, change runtime/package bytes,
regenerate a manifest, or claim that future assertions execute or pass.

## Exact assertion changes

| Case | Amendment | Preserved or strengthened discriminator |
| --- | --- | --- |
| T43 | Exact assets become the existing generic payload plus `capability/Core.md` → `.kaal/capabilities/core/Core.md` and `skills/kaal-core/Core-Skill.md` → `.kaal/skills/core/Core-Skill.md`. | Deep equality remains. Catalogue keys must equal that independently fixed Core footprint; both additional Nodes must have their exact owner-authored bytes. No Foundation/Hosting asset or record is claimed by Core's Installation Contract. |
| T43 | Title names the two Core-owned additions. | Format conformance, capability, version, record path, Node 24 runtime, empty `provides`, absence of an opt-in surface, every existing payload digest and contract delivery remain unchanged. Shipping the Agent Skill does not deploy it through Agent Realization. |
| T47 | Removal compares the exact pre-removal snapshot minus the independently fixed Core footprint and Core record. An otherwise empty `.kaal` must still disappear when there is nothing to preserve. | Dependency declarations, dependency records, consumer content and other-owner files remain byte-identical. Core's record must claim exactly its own footprint. The modified AGENTS fixture and report assertion remain; explicit byte assertions for the greeting contribution and Guard record supplement exact residue equality. The expected footprint is never inferred from the implementation's record. |
| T91 | Parse exactly one final `kaal-core-verification {json}` line; reject the separate old `kaal-core-execution:` record. | One execution, one report; real exit equals `exit`; `result` is exactly the expected term. Candidate name/version and exact manifest digest are asserted. Counts are derived from exact per-case evidence rather than a human prose regex. |
| T91 | Verifier outcomes `passed`/`failed` become `pass`/`fail`. | `skipped`, `todo`, `not run` and all existing result/exit distinctions remain. These fixtures declare no applicability exemption. Testing's model/Run vocabulary remains `passed`/`failed`; this changes only the observable verifier report vocabulary. |
| T91 | Assert exact sorted `{file,name}` identities, explicit causes and the missing case's `not run` outcome. | No omitted, duplicate or substituted identity can pass. Healthy evidence still has exactly four successful executions and no cause. A missing manifest still yields cannot verify/2 and a cause. |

Core's Capability and Core Skill are existing owner-authored Nodes, not new
foundational Definitions. The two proposed Core target paths are Core's own
distribution choice. This PLAN defines no dependency declaration path, loader,
installation record or lifecycle authority.

Every T91 fixture remains: intact positive; missing declared case; skipped;
todo; undeclared execution; intact behavioral failure; changed, added and
missing shipped files; nested dependencies; source-only unshipped content;
tampered shipped source file; missing manifest; and empty inventory. The
consumer/package before-and-after comparison stays. T80's runner behavior and
C40 T98–T106 remain byte-identical. Exact Acceptance tar inventories, Graph
provenance, admission, ownership and negative cases are not loosened.

## Interfaces and remaining prerequisites

- Testing collector `18cfd96b5333000ed40acd4c9ebc112f841cdc6e` supplies
  `./model` and `./verifiers`. Its accepted model uses `passed`/`failed`, while
  testing/F44's observable verifier contract uses `pass`/`fail`. Core retains
  its distinct words `verified`, `failed`, `cannot verify`, mapped explicitly
  to Testing's three results. C40's candidate/manifest/causes fields supplement
  rather than replace testing/F44's package, host, digest and diagnosis data.
- Packaging collector `1c743dbd496d652c8343d2a4c0cb8a9a4950b755` reads the
  normalized result but its `conformSource` cannot statically follow Core's
  `node test/run.mjs` dispatcher. F14 remains unknown until an owner-reviewed
  interface resolves that mismatch. Preserve T80's comprehensive source and
  consumer-only installed execution; adding an npm command merely to satisfy a
  text reader is not a resolution. Core does not edit Packaging here.
- Foundation #836 proposes a declaration-only public data export at
  `@kaihacksai/kaal-foundation/capability`, exact C12 bytes, version 0.0.2,
  and no Foundation-owned Engine record. It has not reached the accepted
  collector and had no submitted review at inspection. Its proposed contract
  can inform review; it is not substituted for accepted owner authority.
- Mandatory CLI initialization still needs accepted Foundation delivery and
  explicit Hosting binding/lifecycle authority, then executable T108 and
  applicable T111 fixtures using real owner bytes. Published Foundation 0.0.1
  remains immutable. Core must not synthesize a dependency declaration.
- Scoped integration still needs owner-prepared imports, the twice-derived
  complete lock and Engineering's governed migration-admission delivery.
  Registry publication of dependencies is a publication prerequisite, not an
  implementation prerequisite once accepted local contracts/artifacts exist.

## Review and execution sequence

1. Independently review this exact patch and Core-owned footprint. No automatic
   approval is inferred from C40 or C43. Integrate only with separate Owner
   authorization and existing required checks.
2. After acceptance, apply the relevant reviewed hunks before their bounded DO:
   T43/T47 with mandatory initialization, T91 with report interoperability.
   Record the pre-implementation RED discriminator. A changed baseline or
   additional assertion change returns to PLAN review; do not resolve it by
   weakening a test during DO.
3. Reuse C43's internal preflight in initialization after its independent review
   and integration; preserve C42 navigation after #827 lands. Validate the
   complete prospective Engine and ownership-preserving Core record before one
   Hosting publication. This PLAN supplies no dependency-owned record.
4. Verify source, complete release suite, exact normal pack, clean consumers,
   negative cases, real Testing/Packaging interoperability and native
   Linux/macOS/Windows evidence on the final candidate.
5. Governed SYNC, focused promotion, runtime registry resolution, npm publication
   and registry-only acceptance remain later transactions with separate Owner
   authorization. Auto-merge stays off.

## Preparation evidence

The patch applies cleanly with `git apply --check` against the exact collector.
Both reconstructed proposed JavaScript files pass `node --check`. They were
not installed over the live tests and were not executed as product acceptance.
No source GREEN is attributed to the proposed assertions.

Foundation SHA-256 of the baseline/live files:

| File | Digest |
| --- | --- |
| `test/plan/lifecycle.test.mjs` | `2b0d5159e64c1e27a6874948361c95554b28501345480cd6e68e174af5617fa3` |
| `test/plan/release.test.mjs` | `388a5e239a04fe7d67b6ab48e205d6fe7c940551f8efba6a57124c872530edce` |
| Unchanged C40 `test/plan/initialization.test.mjs` | `ce4c4d36406b8605f500c153177329ebd6a5d60ed24783f46842655de87b6f79` |
| `proposed-tests.patch` | `a601ac7519a0506c9130b3496dfbb1f042fde7edff821f83acce9e099ad2684f` |

The immutable-test rule is C40 requirements.md's explicit amendment boundary:
"require a reviewed PLAN amendment before DO." This proposal makes that review
concrete. It grants no merge, promotion, publication or auto-merge authority.
