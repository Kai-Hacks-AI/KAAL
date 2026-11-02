# Testing C36 identity migration — PLAN amendment

Owner: Testing. Parent: the accepted 0.0.1 completion PLAN #837 and release contract testing/F59. This amendment makes the planned-test identity migration explicit before C36 DO. It implements no rename, changes no existing Case, and authorizes no integration, promotion, publication or gate relaxation.

## Evidence and bounded problem

Inspected collector: `6beff52be6dad2fa32e5c39bb39da5c16bbbdb41` (accepted #840); main: `f30221f481c4682e81b092e6a772365f3d7a9f6d`. C38 #718 head `dffb5ec8` is a separately reviewed prerequisite; it remains open at this CHECK. Its refreshed publisher/verifier bytes are not copied into this PLAN.

The current T74 first checks the real scoped identity, public metadata and exact dependencies, then uses a repository-wide `git grep` over JavaScript/TypeScript/JSON for quoted old-name strings. That search is broader than an importer check.

Concrete predicate checks:
- Testing's real `test/engineer/redesign-acceptance-evidence.json` contains the observed string `"kaal-testing"` and matches the current T74 pattern. Rewriting it would misstate historical evidence.
- Core's registered-kind fixtures contain `holder: "kaal-testing"` and corresponding expected owners. They are structured test data, not demonstrated package acquisition/import.
- A literal path component `join(root, "skills", "kaal-testing", "scripts")` also matches; the portable Skill's directory/name is distinct from npm scope.
- Planned host-applicability Cases use `kaal-hosting/special-entries` and `kaal-hosting/other` as fact identities, not imports.

These are demonstrations of what the predicate matches, not a claim that T74 reached that search: today's package-name assertion correctly fails first. A broad match supplies inventory for judgment; it does not justify replacing every string.

The companion inventory identifies **16 Testing-owned planned source files**, with baseline Git blob ids and exact occurrence lines, and concrete non-import examples. It deliberately includes both eligible and ineligible occurrences so review can see the distinctions. It is not a complete repository migration inventory or permission to edit Core.

## Amendment proposed for independent approval

### Preserve the semantic release obligation

testing/F59 still requires `@kaihacksai/kaal-testing@0.0.1`, public access, correct repository directory, exact registry dependencies and no active operational importer using the old package name. Exports and versions stay intact. No runtime alias is permitted.

Clarify F59's reference wording for this migration: active module resolution, dependency declarations, workspace selectors, acquisition commands and package instructions use the published identity. Historical observations retain the identities actually observed. A consumer's opaque fixture/holder identifier, a host-fact identity and the Agent Skill directory/name do not become npm specifiers solely because their bytes contain the old name. Their owners decide their meaning.

This clarification is explicit review scope. It is not silently applied in DO.

### Admit only necessary planned-Case adaptations

After approval, C36 may make the following identity-only adaptations in the inventoried planned sources:
- Static/dynamic imports and `import.meta.resolve`/resolver arguments move from the exact old package prefix to its scoped prefix, preserving the export suffix.
- Testing's exact runtime dependency expectation and host-boundary allowed-import expectation name scoped Hosting, with the same exact version and the same allowed dependency boundary.
- A Case's displayed package specifier may follow the new npm spelling; leading Case ids and target traces stay unchanged.
- T74's namespace-search portion is revised as specified below.

Every other assertion, fixture, Run shape, applicability rule, target, expected result, negative discrimination and import-free assertion is unchanged. In particular, the host-fact identities and Skill path component are retained. Unimplemented `/red` and composed `/plan` references, if their spelling must migrate, remain unimplemented/unverified; updating a name neither implements them nor selects those Cases into a passing suite.

The old planned files remain untouched by this PLAN. The new admitted versions need independent comparison against this inventory and their actual trusted predecessor. No test-boundary self-attestation is supplied here.

### Correct T74's namespace check without hiding active importers

Keep T74's identity/public metadata/version/exact-dependency checks and its no-old-active-importer objective. Retain broad discovery as an inventory if useful, then distinguish operational package references from non-import content using explicit, reviewed context and owner judgment. Reuse existing repository/Hosting inspection mechanisms where sufficient; do not build another public Testing parser or framework.

Before C36 DO, freeze the actual candidate-relative match/classification inventory as part of the planned boundary:
- An old active import, dependency/workspace entry or acquisition selector fails and names its path/context.
- Historical exclusions identify the exact evidence file and unchanged byte identity. They are not broad directories, mutable allow-lists or type-wide exceptions.
- Structured fixture/holder values require their owner's classification and exact context; Testing cannot classify Core's semantics on its behalf.
- Any unclassified or unreadable match remains a finding/unknown, never a silent pass.
- Candidate changes cannot turn the baseline/exclusion inventory into authority. Independent review and the existing accepted boundary-integrity process establish its validity.

Demonstrate the revised check discriminates with at least these cases: an old active module import fails; an old dependency or workspace selector fails; an old acquisition command fails; correctly scoped operational references pass; unchanged historical evidence is preserved; a newly inserted or changed purported historical exception cannot hide an active reference; and unresolved context cannot become GREEN. Use the existing Testing method and BRITTLE, not tests derived only from the current candidate's shape.

## Owning Changes and implementation/publication order

1. Independently review this amendment and its explicit boundary. Recheck collector/main, #718 and the exact inventories before DO.
2. Testing prepares its own scoped identity, public metadata, self-imports/instructions and Hosting runtime dependency against accepted scoped Hosting bytes. Keep `c8@12.0.0` and scoped Hosting `0.0.1` as F59's closed runtime set. Add no Foundation dependency or composed-Plan implementation.
3. Other capability owners prepare active importer compatibility. Engineering owns root workspace metadata, independent lock derivation, release selectors and the admitted migration route. Core and .github isolation remain enforced. Do not edit fixture identities merely to make a broad grep empty or route unrelated code through Testing.
4. Integrate in the independently reviewed route, preserving all existing exports, assertions and the accepted main C50/C51 users. C36 is not allowed to leave an alias or a broken intermediate consumer state and declare completion.
5. Regenerate and non-writing-check the shipped manifest intentionally. Run all T74–T79, comprehensive source, normal pack, exact inventory, clean consumer, negatives and actual installed-verifier acceptance on Linux/macOS/Windows. Missing registry access or a source-only pass is not consumer acceptance.
6. Hosting registry publication gates Testing publication, not implementation with accepted packed dependencies. Promotion/publication and first-release artifact/registry acceptance remain separately authorized under #837 and Engineering's Release contract.

## Acceptance of this PLAN

Review accepts the precise semantic distinction and proposed planned-Case versioning, not a generic waiver to edit tests. DO must return the complete active importer/root-support closure, exact old/new planned-source diff, frozen namespace-check inputs, discrimination evidence and current source/packed/three-host results. The current 16-file candidate inventory is a starting observation; no complete repository closure or implementation GREEN is claimed.

Consumer content and package boundary Test Plans remain consumer-owned. This is Testing's own release assurance, not a new boundary-testing feature or Packaging requirement.
