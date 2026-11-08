# Engineering: Cases for the merge group binding (B1 F3)

Capability: Engineering. Target: kaal/engineering-b1-bindcases. Record number is provisional until integration (01 and 02 travel in #1119, 03 is F1a, 04 the queue workflow Cases).

## Intent

The first trial run on the squash queue stopped because the merge group jobs bound the group to the queued pull request by ancestry, and a squash queue builds one commit on the base whose tree is the pull request applied to that base. The fix (F3, `.github` only) binds a group by its parent and its tree, or, for a merge-commit group, by its first parent and ancestry, and fails closed on any other shape. This Change gives that fix its Cases, so the property the CPO approved is held by a test and not by reading.

## Content

`engineering/github/bind-group.red.mjs`, hand-run (no suite or lane names it). T143 to T153 take the real binding step out of each of the two workflows that have it (`branching` in `merge-group.yml`, `change-isolation-review` in `merge-group-review.yml`), run its `run:` text in a throwaway clone of a throwaway origin with a stubbed `gh`, and read the exit status and the exported environment. Each Case therefore runs once per workflow, and the evidence covers both workflows and not a standalone helper.

- T143: a squash group of the queued pull request on its base binds and exports exactly what the job needs.
- T144, T145: a moved head, and extra content in the group, do not bind.
- T146, T153: a merge-commit group containing the head on the base binds; one whose second parent is not the head does not.
- T147: a group whose parent is not the group's base does not bind, in either shape, including the right content on the wrong parent.
- T148: a missing or malformed base does not bind.
- T149: a squash group on an advanced base binds when the pull request applies cleanly, and the head's own tree on that base does not (the expected tree is the merge result).
- T150: a conflict with the advanced base is cannot judge, reported apart from a different tree.
- T151: three parents, and no parent, do not bind.
- T152: the step takes its inputs from the `merge_group` event and runs the shared script.

`KAAL_ROOT=<dir>` points the Cases at another checkout, for the RED run against `main`.

No ledger entry is carried.

## Check

Against `main`'s workflows (before F3): 10 of 22 pass, 12 fail, among them T143, the squash group the first trial refused. Against the F3 head: 22 of 22. Mutating the script (no tree comparison, the head's tree in place of merge-tree, no parent check on the squash path, no ancestor test on the merge path, any parent count accepted) turns the matching Cases RED.

These Cases are not proof of GitHub's queue behaviour; that is the live trial.

## Act

Hand-run until the trial; whether to wire them into `test:engineering` is a later decision, as for T112 to T142. `engineering/change-isolation/merge-group.red.mjs` (T112 to T127, in the B1 collector) asserts the old ancestry line of the review workflow and must be updated in that collector once F3 is on `main`; that is a separate step, named here so it is not forgotten. No queue, ruleset, promotion or publication.
