# C9 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

Reading fifteen past SYNC pull requests before drafting. My first guess had three chapters; the evidence and the CPO's challenge removed two of them, and what was left was the one fact every body had always carried and Git cannot show. Mutating a throwaway template to see which Cases turn red told me quickly whether a Case could fail at all.

## Learned

I restated in the body what the merge commit, the pull request base and the Branching verdict already hold, and I did so because the old bodies did. Asking what a reviewer cannot read elsewhere was the better question. The pull request tool appended a generated footer to the body of every pull request I opened, including the ones that were about banning footers, so each needed a second write. Toggling auto-merge to re-run a failed Branching check starts a run for each toggle, and the run from the disable event fails on its own stale state while the later one passes.

## Lacked

A way to open a pull request without a footer being added. A single list of all SYNC pull requests: their titles followed three styles, so I found them by searching words in titles and may have missed some. A statement, early on, that a Change split into an engineering part and a `.github` part travels as two syncs and two promotions, one at a time.

## Longed For

The template offered by default when a pull request opens from a merge of main into a collector, instead of through a link. The Branching verdict printed once where the reviewer reads it, so that the body can stay only the reason. Collectors that take main in without a pull request of their own, so that a sync exists only where a decision at a conflict does.
