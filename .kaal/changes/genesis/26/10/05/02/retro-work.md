# Retro

## Learned

The boundary I was asked to respect, that configuration governs only what sealed identity leaves free, turned out to be checkable rather than just stated: a delivery directory's name sits outside every Node's bytes, so the rename could be proved harmless by pinning three IDs instead of arguing it. I also learned that my first reading of the task was too large. I began from derivation and a standards file, and the design only became small when it was reduced to one property, one file and one structural check. Whatever I could not state in a sentence of the rule, I had been inventing.

## Liked

Writing the checker's fixtures by hand and independently of the checker. Every verdict I cared about, a commented file, an override, a repeated key, an instance that is not the package, could be read off a tiny directory, and the migration then went green without my touching a single fixture. I would keep the habit of leaving the old names in the fixtures as plain strings, so that renaming the repository cannot quietly rewrite what the test claims.

## Lacked

A way to land a Core-only change whose own repository check needs something Core cannot carry. The installed config could not travel with the Core change, so the installer had to learn about it first, and the first version of that test then broke the moment Core delivered the file. I found the order by running into it twice. I also lacked any view of a pull request's CI that told a stuck run from a slow one; I misjudged one in flight and had to undo it.

## Longed

For the Work to have somewhere to collect its evidence while it is being done, so that what I seal is what I observed along the way and not a section I assemble once everything has merged. I wrote the evidence last, from the finished tree, and I would rather have been able to see it accumulate.
