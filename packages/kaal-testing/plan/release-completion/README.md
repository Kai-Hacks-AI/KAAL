# Testing 0.0.1 completion — bounded PLAN

Owner: Testing. This completes the accepted C35–C38 release work; it does not restart Testing's architecture. The intended delivery is `@kaihacksai/kaal-testing@0.0.1`, useful when installed on its own, with a coherent approach and practical Agent Skill. No merge, synchronization, promotion or publication is authorized.

## CHECK: actual state

Inspected on 2026-11-02:
- `main`: `f30221f481c4682e81b092e6a772365f3d7a9f6d`.
- `kaal/testing`: `9f112e6524861fba502a941c84c6e585b8c35698`, 36 commits ahead and 34 behind main in the observed comparison.
- Existing release contract: `plan/release/{intent,requirements,architecture,testing}.md`, T74–T79.
- Existing general Skill already teaches the three loops, immutable planned tests, RED → GREEN → REFACTOR, TEST A FINDING, BRITTLE, model evaluation/current, acceptance, coverage and calibrated findings.
- C37's consolidated product documents already exist. C38 (#718) was unintegrated and seven collector commits behind. It is now refreshed at `d144a924225f3cbe80175826d69fddaae0d1b09f`, exactly 13 Testing paths, preserving all collector exports and source suite selections.
- Explicit current release-suite run: T77/T79 pass; T74 fails scoped identity; T76/T78 are blocked before behavioural assertions by missing scoped self-resolution; T75 fails because docs/architecture.md cites `testing/C46`. T75 stops there, so later document checks are not claimed successful. Shipped architecture also claims `/observe` and `/red` exports absent from the actual manifest: a release-document coherence finding, not authority to implement unrelated features.
- Actual manifest remains `kaal-testing@0.0.1`; it lacks scoped public/repository metadata, uses unscoped Hosting and has workspace-only source lifecycle at the collector baseline. C38 corrects source/installed dispatch without pretending to complete C36.
- #822's composed-file execution PLAN is accepted, but its implementation is separate work. C33 coverage accounting, C48 trace derivation and other open features are not release prerequisites introduced here.

## Minimum gaps and intended Changes

### 1. Finish C38 independently

Review the refreshed existing #718 and its current-head CI. Preserve its non-writing manifest check, all 12 delivered Cases, whole-consumer integrity and failed/unknown/verified distinctions. Keep the actual unscoped interim candidate clearly labeled. C38 is not the release acceptance decision.

Observed Linux evidence: 26 focused runner/manifest/verifier tests and 94 model/evaluation/parity/BRITTLE/timing/redesign/duplicates tests pass; normal pack contains exactly 34 files matching all manifest hashes; a fresh external consumer executes 12/12 delivered Cases and leaves 961 files unchanged. Tarball SHA-256: `52895a9a75bd35d0dfba5c409baf5ea43cd05950b120bd769751f5145b6b3d25`. These bytes were packed with npm 11.9.0 for C38 checking, not the pinned release-engine artifact.

Fresh #718 CI run 41403743875 passes Workspaces, Engineering and existing Acceptance/Hosting on Linux, macOS and Windows. Workspaces executes the complete Testing source entry and 12 consumer Cases. Existing three-host acceptance exercises the packed duplicates API; it does not execute all 12 installed-verifier Cases on those hosts. The Branching gate is intentionally red while auto-merge is off. No independent approval of this refreshed head is claimed.

### 2. Approach/Skill usability DO after this PLAN's review

Reuse existing semantics. Limit product changes to the existing Skill, an internal Skill reference/example where useful, README and consolidated product documents where required to correct actual delivery claims, including architecture, operations, testing and limitations. Preserve both existing Testing Node identities unless independent review demonstrates a necessary semantic correction.

The Agent should be able to:
1. Find the installed Testing capability and Skill meaning without requiring a repository checkout or an already initialized Engine. An Engine remains authoritative when present; installed package discovery and the shipped Node documents provide the standalone route. Every relative link inside the portable Agent Skill stays inside that Skill.
2. Start from consumer-owned targets and assign each Case to the existing loops. State RED's intended behavioural reason, GREEN's bounded evidence, REFACTOR with preserved acceptance and BRITTLE's discrimination.
3. Follow one executable, generic worked example using existing `model` exports: declare Plan/Suite/Case traces, validate it, submit an explicitly labeled illustrative Run and read `evaluate`. Demonstrate passed, failed and incomplete/unknown results without claiming a constructed example Run is an observed execution. The actual consumer supplies and executes its own Cases.
4. Treat incoming/outgoing package boundaries as ordinary consumer-owned Plan content. Identify the relevant authority and contracts, public interface, expected success/refusal/failure and evidence. Testing supplies the method and interpretation; it stores or owns none of that consumer's content.
5. Distinguish raw observations, model `passed`, installed verification `verified`, applicability and validation. A skip, stale or incomplete record never becomes passing assurance.
6. Use the existing source/installed verification commands and shipped APIs. Explain current primary `test/engineer` discovery and supported legacy `test/acceptance` consistently with the existing implementation; introduce no new location requirement for consumers.
7. Read an accurate delivered-file/export inventory, including C38's entrypoint/verifier/Cases and the already accepted timing/redesign/duplicates exports. Remove repository Change references as product authority under existing F60. Reconcile the architecture's `/observe` and `/red` claims against the actual manifest through reviewed release scope/limitations, preserving accepted semantic contracts; do not silently delete a promise or implement those additional features merely to make documentation look complete.

BASS here uses existing capability meaning (Bare), Agent guidance, portable Skill and existing library/verification scripts. It requires no additional Agent Node, runner, boundary framework, storage service, CLI or schema. A successful independent Agent walkthrough and existing Skill conformance checker are appropriate evidence for guidance usability; text-presence tests are not evidence of that usability.

### 3. Complete C36 scoped identity and dependency interoperability

Keep public exports and version intact. Supply public access and repository directory metadata under the accepted F59 contract. Reconcile Testing's self-imports, commands, dependency entries and Hosting references with their scoped identities.

This is not permission for an unreviewed global rename. Inventory actual module specifiers, dependency/workspace entries and executable selectors; distinguish package identity from a capability/registration holder, historical evidence or repository pathname. Other capability owners prepare their importer compatibility, Engineering owns root metadata/lock derivation and workflow selectors. No consumer content or assertion is authored by Testing.

Planned test sources also contain old package specifiers. DO/CHECK cannot silently edit those immutable boundaries. Any necessary identity-only adaptation, its exact path closure and preservation of every assertion/fixture must be admitted by a separate reviewed PLAN amendment before DO. The C35 T74 requirement to migrate every importer is retained; obsolete import spelling is not a reason to delete or weaken acceptance. No temporary alias is introduced.

Main's current isolation checker still enforces Core-travels-alone and .github-travels-alone. Establish the actual migration inventory and admitted sequence; do not bypass these controls. No assumption is made that Testing's rename automatically needs Core changes merely because a Core fixture contains the string `kaal-testing`.

Hosting's scoped contract and packed bytes can support implementation before publication. Hosting's exact registry version must exist before Testing publication. This PLAN adds no Foundation runtime dependency; the separate composed-file feature must not expand F59's closed runtime dependency set.

### 4. Release assurance closure

Run source comprehensive `npm test`, normal lifecycle packing, exact actual tarball inventory/hash agreement and fresh external consumer verification. Keep publisher tools/plans/evidence/claims out of the packed artifact. Regenerate the manifest only as an intentional publisher step; non-writing `--check` must catch stale bytes.

T74–T79 must all execute and pass on the scoped candidate; T74/T76/T78 remain RED/blocked beforehand. Do not leave the full release suite outside release acceptance indefinitely or claim success from C38's 12 embedded passes.

Required evidence on Linux/macOS/Windows must identify the actual packed candidate, every declared installed Case, original process/result summary and unchanged consumer. Add Testing-owned packed acceptance through the existing harness, with unchanged assertions and no repository/Graph/Core/Engineer fallback inside an installation. Existing green generic Acceptance jobs alone do not satisfy this.

Retain meaningful negatives: missing/stale/unreadable manifest or installed bytes, absent/incomplete dependency, missing/duplicate/undeclared/skip/todo Case, native file failure, consumer mutation and failed-versus-unknown aggregation. Run Testing's existing conformance contract independently through Engineering's harness and Packaging's accepted conformance against the actual installed artifact; report unavailable checks as not run, never verified. Hosting owns its boundary inspection and portability mechanisms. Do not copy any of these mechanisms into Testing.

A normal pack currently has no Testing prepack hook. Introduce one only if the accepted release contract needs generated delivery inputs; demonstrate actual normal pack behavior either way. The release engine's pinned npm and once-packed artifact produce final release evidence; local diagnostic tarballs are not substituted.

### 5. Governed integration and release preparation

After separately authorized owning Changes:
1. Rehearse and prepare main → Testing synchronization against then-current tips. Preserve main's focused C50/C51 dependency delivery and acceptance scenario, new Engineering users and accepted Core state. Resolve only genuine conflicts inside SYNC; prepare non-conflict compatibility separately. Every actual SYNC uses a merge commit.
2. Prepare the exact focused main-relative Testing promotion inventory, including allowed importer/root support under the admitted route. Promote by squash only after independent review, current required CI and Owner authorization.
3. Use Engineering's release engine after its scoped workspace-selector route (#834) and necessary dependencies are accepted. Pack once; preserve the authoritative artifact and release record.
4. Hosting 0.0.1 must be on npm before Testing's registry-only consumer can install. Verify actual registry state at release time.
5. For first publication, the existing Release contract requires the Owner's download/hash-check/manual 2FA publication of those tested bytes, followed by trusted-publisher setup and mandatory registry acceptance. No credential, re-pack or publication is performed by this PLAN.

## Review boundary and acceptance of this PLAN

This is an execution/completion PLAN, not a replacement semantic architecture or newly executable framework. The companion boundary inventory names the unchanged C35 acceptance and existing model/Skill contracts that implementation must preserve. New guide examples must run against the actual public API; review should reject examples that only look plausible or claim observed provenance.

Independent review should decide:
- Is the bounded usability work enough for a useful 0.0.1?
- Is the importer/test-boundary migration amendment and owner sequence concrete before C36 DO?
- Does the actual three-host evidence exercise Testing's installed verifier, rather than infer it from a lane's name?
- Are any unavailable Engineering/Packaging checks accurately recorded, with an explicit release decision before publication?

No further architecture, generic package rule, consumer-specific Plan or new Testing feature is authorized. Independent review is still required; author checks are not independent approval.
