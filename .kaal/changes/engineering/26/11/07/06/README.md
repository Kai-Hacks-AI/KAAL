# Engineering: bring the merge group Cases in line with the F3 binding (B1)

Capability: Engineering. Target: kaal/engineering-b1. Record number is provisional until integration (05 holds the F3 Cases and travels separately).

## Intent

The B1 Cases T112 to T127 were written before the merge group binding became one shared script (F3, #1134). Two assertions in `engineering/change-isolation/merge-group.red.mjs` no longer describe the workflows on `main`, so the file must say what is true now before #1119 is re-verified.

## Content

- T124: the review job calls `.github/scripts/bind-group.sh review`; the script holds the merge-group ancestry test and the squash-group `git merge-tree` equality test. How the script behaves on both group shapes is judged by T143 to T153 (`engineering/github/bind-group.red.mjs`), not here.
- T115: `merge-group.yml` sets `KAAL_DEFAULT` four times, not three. That count was already stale at the approved head c5cd575d (F1b added one use); T112 to T127 are hand-run, so it went unseen. It was found only now, when the file was run in full.

## Check

`node --test engineering/change-isolation/merge-group.red.mjs`: 10 of 10 GREEN on this head. Before this Change: T124 RED on the F3 workflows, and T115 RED on c5cd575d too.

## Act

Hand-run until the trial. No workflow, script, queue, ruleset, promotion or publication.
