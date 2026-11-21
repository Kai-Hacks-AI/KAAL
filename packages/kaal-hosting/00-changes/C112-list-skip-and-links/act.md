# C112 ACT: retrospective (4L)

Written by the agent that carried the Change.

## Liked

- The request came with the exact shape and its Cases (skip at depth, a skipped file, a link under each setting, defaults unchanged, UTF-16 order), so the PLAN needed no design round. The CPO's review kept the boundary: Hosting owns the traversal, Testing owns what a Case means.
- Backward compatibility was cheap to prove. `walk` takes one optional parameter and `read` passes none, so T297 (no options, `{}` and the defaults written out give one listing, a link to a directory still `INVALID_PATH`) was GREEN before the DO and stayed GREEN.
- Each RED Case failed for the reason the PLAN states (the assertion, `INVALID_PATH`, `Missing expected rejection`), checked before the PLAN was raised.

## Learned

- The shipped `docs/` may cite no Change: a sentence in the Requirements ("these win from `hosting/C112`") failed T218 on all three hosts. The Case was right, and I had run the publisher suite only up to the first failing step, so its later steps (including the one that checks the docs) had not run locally. Each step of that chain has to be run on its own when an earlier one fails for a known reason.
- A Case that makes a junction must give it an absolute target, or a Windows junction resolves it from the working directory.
- Allocated Cases carry no bracketed ids in their titles; the allocation row in `testing.md` is the trace, and the manifest check refuses an id that is both covered by a delivered Case title and allocated.

## Lacked

- Windows and macOS runs of my own; CI ran them: Hosting (Linux, Windows, macOS) and Guard and Acceptance on all three passed at the DO's merged head (7644a8e2). The CPO asks for that cross-platform evidence before promotion, and it is this.
- A real `node_modules` in a Case. The Cases make their own links; Testing's catalog is the first real caller, on a real checkout.
- The sandbox still fails the same five publisher steps as the unmodified collector (sibling validator and dependency set), so the whole chain cannot be shown green here.

## Longed For

- Testing's catalog (its C74) on `list`, with no `node:fs`.
- One command that runs every step of `test:publisher` independently and reports each, so a known failure does not hide the steps after it.

## Follow-ups

- Testing's C74 pins to this once it is on main (a PROMOTION, by the flow threads).
- No npm publish and no pin moves; `.kaal/hosting` is untouched.
