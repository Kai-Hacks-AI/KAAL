# C110 ACT: retrospective (4L)

Written by the agent that carried the Change.

## Liked

- The slice stayed small: one library function with its command from the same code, three git starts, no new runtime dependency. The Skill folder holds the one implementation, as the BASS idea asks.
- RED Test Cases first paid off. The CPO's review of the PLAN produced T265 (literal `under`), and that Case found a real defect in the first draft (`ls-tree` pathspec magic) before any consumer could depend on it.

## Learned

- `execute` is text-only, so a byte-exact read needed its own internal start. The cost was small, but any future reader of binary content in Hosting meets the same edge.
- A fixture that holds odd file names must not depend on the host's index rules: Windows Git refuses `:(glob)lit` as an index path. Writing the tree object directly made the Case run on every host. Linux-only local runs hid this until CI.
- The interface table lives twice (Architecture and the Change record's contract); `hosting/T41` reads the second. A new bin needs both rows.
- A new pull request's first `Branching` run fails until auto-merge is registered; the `auto_merge_enabled` event re-runs it green.

## Lacked

- Case ids: T258–T263 and T268–T271 were already taken by unpromoted Hosting Defect branches, so the PLAN's provisional ids had to move to T272–T279 at DO time. Ids provisional in a PLAN cannot be confirmed against branches that are not on main.
- A sandbox with the sibling packages' dependencies installed: `hosting/T71` could not run locally (`commonmark` missing) and was judged by CI.
- macOS was not run locally; CI covers it.

## Longed For

- The first consumer: the Engineering collector check reading its revision through one `readRevision` call. Until it exists, the function has no caller and the seven separate revision readers remain.
- An allocation of Case ids that sees open branches, so a PLAN's ids are final when it merges.

## Follow-ups

- Engineering collector-check Change (own PLAN, Engineering's code) as the first consumer.
- The other revision readers, a GitHub transport entry and the Guard N6 amendment remain later options from the assessment; none is started.
- No npm publish and no pin moves; `.kaal/hosting` is untouched.
