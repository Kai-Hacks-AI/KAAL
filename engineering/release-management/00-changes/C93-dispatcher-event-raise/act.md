# C93 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The concept arrived as a small idea (the open PROMOTIONs are the queue) and the slice that came out of it did one thing: raise a draft when a final step merges. That made the whole path testable with fake data, from the merge event through `decideFinal` and `raiseAll` to the single write, for all three classes. Closing the earlier verdict PLAN (release/C92) instead of landing it kept code and Cases out of `main` that two Changes would have deleted. The CPO's two corrections made the contract better: a WIRE copy is recognised positively, and the raise contract was extended explicitly instead of being promised.

## Learned

Two facts the PLAN first got wrong: the raise accepted only `kaal/<capability>/<concern>`, so promising hotfix and wire heads needed an end-to-end Case that was RED for that reason, not a classification Case; and a template tells a step apart by its chapters, but the WIRE pull requests have no template, so the contract had to be written from the structure they already use. Turning the raise into a draft meant retiring the schedule of the old scan in the same Change, otherwise a variable turned `on` would also draft a PROMOTION for every old collector. The Cases that pinned the old shape (T944, T946) were cheap to amend because each states its list in one line.

## Lacked

A WIRE pull request template, so the contract would be the template's own instead of a reading of past pull requests. A live observation of the closed-and-merged workflow: whether `pull_request` closed starts for a merge by auto-merge or the merge queue, and which definition of the workflow it reads, is not known until the workflow is installed. The `final` command is covered by a hand run and by the workflow Case, not by a Case that runs it.

## Longed For

The WIRE that installs `dispatcher-raise.yml` and the amended `dispatcher.yml`, then one observed dry run of the event on a real merge into an integration branch. After that the PICK: the first green draft by priority, a SYNC when it is behind, and the ready mark that makes it the seat. The principles of the closed verdict PLAN (name every collector, the seat separate from the verdict, facts that never filter, a labelled order) belong in its Cases.
