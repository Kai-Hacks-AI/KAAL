# C21 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The Owner's ruling was small and exact: the head sits under hotfix/, the base is reported as not judged. That let the Change stay one rule and one contract. Writing the verdict beside ok first showed that ok alone could be read as a pass, so the Cases pin the contrast.

## Learned

Not judged has to be visible in the output and exit with its own code, otherwise it passes by omission. The DO changed the delivered HOTFIX Case that accepted any head, and naming it in the PR kept that honest. A red required check on a PR is mine to act on at once: a refused re-run while the run was still going, and no timed re-check afterwards, left the Windows Acceptance failure unattended until review.

## Lacked

A rule for threads to keep a PR from review while a required check is red or running. The Hotfix delivery path, so the base of a HOTFIX is still not judged. A stable Windows acceptance harness: a host-directory NOT_EMPTY error failed a Case this Change does not touch.

## Longed For

The Hotfix delivery path as its own Change, so UNKNOWN can become PASS. A timed re-check built into how a thread holds a PR. The envelope check, DEFAULT and HOTFIX promoted together.
