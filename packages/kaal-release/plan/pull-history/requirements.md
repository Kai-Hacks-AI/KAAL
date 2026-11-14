# Pull Promotion: the history of a synchronized collector (target)

Scoped `pull/` (ids are global). Corrects pull/F31 (the history is a line by ancestry); nothing of pull/F25 to F34 is relaxed.

- **pull/F36. The history is the first-parent line from the head to the first commit already in `main`.** Given the commits the host reports as the collector's own (those reachable from the head and not from `main`), the head and the merge base:
  - the history is the first-parent ancestry of the head, followed while a commit is one of those commits, oldest first. Its last entry is the head. The commit before the first entry is a commit of `main`'s history and is not required to be the merge base;
  - a commit with a second parent on that line is a SYNC: it keeps its place in the order, but it is not read for evidence (its paths are empty), because what it brought in belongs to `main`;
  - the order comes from ancestry, never from the order the host listed the commits, so a host list in any order gives the same history;
  - it fails closed, with "could not order the history" naming the commit, when the head is not among the commits, when a collector commit is not on the line (a second parent that is itself a collector commit, a commit the host did not list, or a commit that is not an ancestor of the head), or when a commit's parents are not given. The collector is then reported as not judged, as pull/F31 says, and never passed.
  An unsynchronized collector gives the same history as before.
