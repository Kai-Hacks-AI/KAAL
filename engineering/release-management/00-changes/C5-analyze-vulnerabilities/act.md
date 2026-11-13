# C5 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The first real run of the new job failed exactly as the order finding I had written from a local test said it would: the mechanism succeeded, and Guard answered that the check was not declared. A prediction I could check against a log was worth more than any amount of reasoning about it. The throwaway pull request with a known advisory then gave the control a real FAIL with two named findings, which no Case could have shown.

## Learned

I wrote that scope checks were off, and they are not: the pinned action counts runtime dependencies only, so a vulnerable development dependency passed in both the old and the new job. A fact read from the source is a claim until the job has run on it. Retargeting a stacked pull request onto another pull request's branch let its auto-merge land it there before anyone reviewed it, so isolating a diff cost an unreviewed merge that I then had to explain. The CPO's naming decision was cheapest when it came before the DO, and a mechanical rename needed a read-through afterwards for what it left behind.

## Lacked

A list of the Case ids already taken across every branch, which would have kept me from picking T91 twice. A way to take the merge-group observation without a real promotion or a ruleset of its own. A way to run the control by hand against a defined input and see what it did and did not analyze, which is what separates the control from the mechanism that realizes it today.

## Longed For

A stacked pull request that waits for the one below it, instead of auto-merging into its branch. The dependency graph's advisories for a package shown before the pull request is opened, so a throwaway observation is not the first look. A control that states its own coverage in every result, so the gap between what it promises and what the realization reaches is read from the result and not from my notes.
