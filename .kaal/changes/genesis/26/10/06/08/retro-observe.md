# Retro

## Learned

Separating candidate validity, Core realization, Extension-aware delivery and projection made the final projection step almost mechanical. Once 06/06 and 06/07 were admitted, the repository's own installer had exactly one legal transition to make: add the Core Extension Node and its seal. The absence of design decisions here is evidence that the preceding boundaries were cut correctly.

## Liked

Nothing in the projection is authored. The installed Extension definition is byte-identical to Core's admitted payload, its seal is the corresponding identity marker, and no existing installed byte or seal changes. The diff therefore says exactly what the installer says the lineage was missing and nothing more.

I also like that the temporary drift was explicit rather than hidden. Core isolation prevented 06/06 from updating the projection, P1 made that candidate valid without tolerance, 06/07 completed delivery semantics, and this Change restores projection currency through the normal installer.

## Lacked

Projection currency still has no automatic lineage-facing signal. We knew this projection was stale because the sequence tracked it and check-kaal-install named the two missing files when run, not because the branch itself surfaced the drift.

There is also still no concrete Extension installed. The projection now knows what an Extension is, but packages/kaal-github will be the first real package to exercise Extension delivery in the repository itself.

## Longed

For packages/kaal-github to land as the first concrete Extension package, using the type and delivery machinery now fully present in the installed KAAL.

For C3 to add the non-PR lineage projection-currency control so future package/projection drift is surfaced automatically, then cut the workflows over to the GitHub Extension and remove the remaining Bash controls.

**Observer conclusion:** the sealed Work is a faithful derived projection of the admitted packages. It restores lineage currency by adding exactly Core's Extension Node and seal, changes no existing sealed material, and introduces no new semantics. No blocking finding for #57.
