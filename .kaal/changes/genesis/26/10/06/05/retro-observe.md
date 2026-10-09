# Retro

## Learned

The repository-self install assertion had been carrying two different responsibilities: proving that a candidate delivery is valid, and proving that the checked-in projection is current. Core isolation exposed the distinction because a valid Core candidate necessarily changes what installation would produce while being forbidden from changing the installed projection in the same Change. Starting from the admitted projection in scratch, then running the real append-only installer and the complete existing check, gives a direct proof of candidate validity without weakening either installation or checking semantics.

## Liked

This Change solves the conflict by changing the object under test rather than adding an exception. There is no tolerated path list, no special Core case and no relaxed checker. The real installer must be able to advance the copied projection without changing sealed bytes, and the real complete checker must then find no problem. The explicit lagging-projection and conflicting-sealed-bytes cases demonstrate both sides of that contract.

I also like that projection currency remains named as a separate invariant rather than disappearing when the PR-facing assertion changes. That makes the later lineage control an explicit responsibility instead of an accidental side effect of an acceptance test.

## Lacked

Projection currency is temporarily only mapped, not enforced automatically on the lineage. Until C3 adds the lineage-facing control, a stale checked-in projection can be detected by running check-kaal-install but is not surfaced automatically after merge.

The current process again meant Owner review happened only after Work was sealed. This Change appears sound, but that ordering continues to make architectural review unnecessarily expensive when a finding does occur.

## Longed

For C3 to add the non-PR lineage projection-currency control so candidate validity and deployed-projection currency are both enforced at the boundary where each belongs.

And for ROWING to move Review before Work sealing, so this kind of architectural distinction is tested while Work is still legitimately mutable rather than relying on the sealed candidate already being right.

**Observer conclusion:** the sealed Work realizes its Intent and Requirements. It separates candidate installation validity from projection currency without weakening installation, seal protection or the complete installation check. No blocking finding for #55.
