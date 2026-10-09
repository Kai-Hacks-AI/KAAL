# Retro

## Learned

Once Core owns the semantic distinction between Skill and Extension, delivery can remain deliberately ignorant of what either capability means. The installer only needs Core's installed references, the exact Node identity carried by a package, and the corresponding Core registration operation. That keeps Extension delivery parallel to Skill delivery without moving Extension semantics into engineering.

The package-kind question clarified another boundary: Skill versus Extension is semantic typing of Nodes, while the package cut is configuration. One package delivers one configured kind so that Skill and Extension remain independently selectable; a broader capability that needs both is represented by two packages rather than by collapsing the registrations.

## Liked

The implementation follows Core rather than inferring from package names or directory structure. Installed Extensions come from installedExtensions(), package resolution is by exact Node ID, and projection is produced through registerExtension(). Existing Skill delivery stays on the same path it already used.

I also like that Extension packages are not forced to invent an Agent Skill. A package with no Agent Skill can be a legitimate Extension delivery and uses its package directory as its configuration name, while host Agent Skills remain a property of Skill packages. The throwaway package root provides real sealed Extension evidence before kaal-github exists.

The final XOR wording correctly records the Owner decision as a package delivery/configuration rule rather than attributing it to CASE.

## Lacked

There is still no real Extension package in the repository, so this path is proven with real Nodes but synthetic package delivery. packages/kaal-github will be the first repository package to exercise it end to end.

The checked-in KAAL projection still lacks Core's Extension Node and seal. That is intentionally deferred to I, so check-kaal-install over the lineage remains the visible projection gap until that Change lands.

## Longed

For I to advance the checked-in projection using these complete Extension-aware delivery semantics, then for packages/kaal-github to become the first concrete Extension package and prove the path against the repository itself.

For C3 to complete the host cutover, enforce lineage projection currency and remove the remaining Bash controls.

And for ROWING to move this kind of Owner design decision before Work sealing; the package-kind interpretation was again settled after the Work seal, even though this time the behaviour already matched the eventual decision.

**Observer conclusion:** the sealed Work realizes Extension delivery without teaching the installer Extension semantics, preserves existing Skill delivery, and the package XOR behaviour is aligned with the Owner's configuration-boundary ruling. No blocking finding for #56.
