# C11 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The four Hotfixes on record gave the Change real evidence, so the interface was derived from what authors had already written and not from a guess. The CPO's challenge of the first five chapters was cheap to take while the PLAN was still only documents: three chapters went in one pass, and a Case turned each violation red with a message that named the fault.

## Learned

The observed Hotfixes were not about production at all. Cost, a Windows byte problem on `main` and an ordering decision were all called hotfixes, and only a look at the registry showed that production and `main` already differ for Guard under the same version number. A chapter I dropped because the title held the identity had to come back when the title convention changed: a dropped element is only as safe as the thing that made it redundant.

## Lacked

A recording of what production contains. The registry carries no commit and the repository no tag, so "what is in production" had to be rebuilt by downloading the tarball. A way to open a PR without the tool adding its footer: the body was corrected after creation each time, and the first Branching run of a new PR failed on the auto-merge race and needed a toggle.

## Longed For

A Hotfix written from the template, to show whether three chapters and the identity line are enough. A release record that ties each published version to a commit. The delivery path (`hotfix/*`, differentiated admission, full admission at `main`) as its own Change, so that Route and Recovery have a home.
