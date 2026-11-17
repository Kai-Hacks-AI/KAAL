# C45 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The SYNC template now says why a SYNC is allowed at all: exactly one of two purposes, `for PROMOTION` or `to unblock development`, each with its own evidence (the promotion queue, a concrete blocker), and never routine branch maintenance. T653 judges that wording in the Reason chapter, and T650 to T652 judge the HOW TO WORK table. All four went from RED to green with one file, `05-src/wiring/templates/sync.md`. This is the template that the C48+C49 SYNC #1807 was written against by hand.

## Learned

The Successor row has two endings, and the template has to keep them apart: for PROMOTION the promotion review starts, and it is not an automatic promotion; to unblock, the blocked development resumes. A single sentence for both would have hidden that approval of a SYNC never starts a promotion. Writing the SYNC for #1807 by hand also showed that the branch must be made from the collector's current tip, and the Worker row now says so.

## Lacked

A check that a SYNC pull request names one of the two purposes. The Cases judge the template, and the Reviewer judges the PR.

## Longed For

The promotion of this collector, and then the WIRE that installs the template under `.github`. The Owner has ruled that WIRE travels alone, that approval does not install anything, and that the templates can be installed in one WIRE.

## Follow-ups

- Promote C45 with the other template collectors, in the CPO's order.
- Install the SYNC template in the WIRE of the templates, after the promotion; the WIRE travels alone and its scope is reviewed on its own.
