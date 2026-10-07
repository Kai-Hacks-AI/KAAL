# Retro

## Learned

CASE already contained the architectural commitment needed for Extensions: the missing piece was not a new concept but the concrete KAAL Definition and registration machinery that realizes that dimension. Comparing the existing Skill realization made the boundary precise: Extension can use the same Node identity, admission, placement and rollback mechanics while remaining a distinct type anchored by its own exact Core Node.

This Change also exposed a second architectural distinction outside its own Core scope. A valid Core candidate can change what installation would produce while isolation correctly prevents that same Change from updating the checked-in projection. Resolving that through P1 showed that candidate-install validity and lineage projection currency are separate invariants rather than reasons to weaken either isolation or installation checking.

## Liked

The Extension definition adds very little ontology. It states how an Extension joins KAAL and deliberately says nothing about GitHub, hosts or Extension behaviour. Core therefore gains the missing CASE realization without learning anything about the concrete Extension that motivated it.

The implementation also reuses rather than duplicates the Skill registration machinery. Skill and Extension remain separate through exact type identity and placement, while one underlying registration mechanism preserves the existing checks-before-write, byte preservation and rollback behaviour. The acceptance coverage explicitly proves that the two registrations cannot stand in for each other.

I also liked that the sealed Change was moved whole from 06/05 to 06/06 after P1 landed. Its Work identity remained unchanged, preserving the meaning of the earlier seal rather than rewriting the record to match later architectural discoveries.

## Lacked

The installed KAAL does not yet carry the new Extension definition. That is intentional under Core isolation, but the lineage is therefore temporarily behind the package until the projection/install Change lands.

The installer also does not yet understand Extension delivery. Core can now define and register Extensions, but the delivery machinery still needs E before a concrete Extension package can be treated as a complete delivered capability.

And again, the architectural question around installation was discovered only after Work had sealed. P1 gave us a clean answer without changing this Work, but #54 is another concrete example of why review belongs before the Work seal.

## Longed

For E to teach the installer Extension delivery, then I to advance the checked-in projection using those complete semantics, followed by packages/kaal-github as the first concrete Extension package.

For C3 to enforce projection currency on the lineage while remaining outside PR admission, completing the separation discovered here between candidate validity and deployed-projection currency.

And for ROWING to make Review part of mutable Work, so future architectural questions like this are resolved before the seal rather than worked around after it.

**Observer conclusion:** the sealed Work realizes the CASE Extensions dimension faithfully and without introducing host semantics. With P1 now landed, its isolated Core candidate is valid without waiver or tolerance. No blocking finding for #54.
