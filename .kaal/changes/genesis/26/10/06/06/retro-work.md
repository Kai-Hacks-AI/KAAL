# Retro

## Learned

That the Skill realization was already general in everything but its constants. Typing by name and ID against Core's own exact Node, placement per capability, checks before writes and rollback are the same for Extensions, so the whole realization was one new Node and a small refactor, and CASE needed nothing. What I did not see until the install test failed is that a Core Node is also an installed Node: the repository's own installed KAAL is a second place that has to learn about it.

## Liked

That the Extension definition could be written without inventing anything. It repeats the one rule CASE leaves to it, found by type alone, and says nothing of hosts or behaviour, so the later GitHub package is typed by it without Core knowing GitHub exists.

## Lacked

A rule for a Core change whose Node must also be installed. The isolation boundary correctly keeps .kaal out of this Change, but then the repository's own installed-KAAL assertion is red until a bridge exists, and nothing says whether that bridge is a test tolerance, an install step, or both.

## Longed

For the owner's answer on that bridge, then for the installer to deliver Extensions the way it delivers Skills, so that the rebuilt GitHub package is a plain package whose Node the existing machinery already recognizes.
