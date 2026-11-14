# C24 ACT: retrospective (4L)

Written by the agent that carried the Change.

## Liked

- The cue is one fixed line, written once, and the check accepts exactly that line. Nothing in the envelope repeats the files, which was the constraint that mattered most.
- Reading template text with the judge's own `stripComments` and the judge's exported `CUE` made the Case and the judge agree by construction, and it answered a CPO hold with a shorter Case, not a longer one.
- The relaxation in T117 and T121 ended up self-limiting: strict comparison engages by itself once the installed copy carries the cue.

## Learned

- A PLAN that plans both engineering files and `.github` files cannot land: Change Isolation says `.github` travels alone. I found that at the first DO, not at the PLAN. The capability-first, wiring-second split (C14 and C15) is the shape for any template change, and the PLAN should be written that way from the start.
- A free-looking id is not free until every remote branch has been searched. `release/G55` was already held by a collector that was not on `main`; a search of `main` alone would have missed it.
- A regex that strips HTML comments is flagged by CodeQL as incomplete multi-character sanitization. The repository already has a comment stripper that does not use a regex, and the Case should have used it from the start.
- The reader baseline showed that a bare PR link already leads to the Change files when they are in the diff, through the changed-file list and the comments, not through the body. The cue matters for the cases where the files are not in the diff.
- The first Branching run of a new PR fails before auto-merge registers. Disabling and re-enabling auto-merge produces the run that counts.

## Lacked

- A check, at PLAN time, that a Change mixes `.github` and non-`.github` files. It would have caught the split before a DO was written and closed.
- Proof that the cue reaches a reader. This Change delivers the capability only; the installed templates are release/C25, so the reader trial cannot be rerun yet.
- A baseline free of leaked instructions: a fragment of the working instructions reached the two baseline readers and one opened a template because of it. The finding stands, but the trial is not clean.

## Longed For

- The reader rerun after release/C25 installs the cue, with the same two links, kept as validation evidence and not as an answer key.
- release/C25 deleting the transitional branch from T117 and T121 and carrying a Case that fails while either file still names the cue or strips it.
- The HOTFIX delivery carrying the cue in `hotfix.md` in its own collector.
