# Known failures: ACT (testing/C67, testing/C68)

A 4L retrospective of the Change, from the viewpoint of the agent that carried it. It does not close the Change's open points, and it claims no collector qualification, promotion or publication.

## Liked

Kai's split of the problem: the finding, the register, the mechanics and the placement belong to different capabilities, so Testing could stay small. It lists what a register says against what was observed and decides nothing. The CPO's gate on the DO, that provisional absence and incomplete-run semantics are kept and pinned, turned a vague worry into a unit test on synthetic reports. Mutants made the Cases honest: six mutants of the reference each failed the Case that named them.

## Learned

A Case can pass for the wrong reason. T377's mutant with an extra `pass` field slipped through because the register never produced that state; the Case now runs a register that produces every state. A list that looks like a verdict becomes one: an exit code for an unexpected RED, or a field named `pass`, would have made Testing decide, so the output has counts and lists and no deciding field. An id that is missing is not the same in a complete and in an incomplete run, so absence carries a reason and `complete` is repeated next to it. Adding an export or a Skill section moves two pins (T160 and T369), so the DO has to update them, and in a sandbox without the workspace built, CI is the only check for them. The first Branching run on a new PR fails before auto-merge registers; enabling auto-merge right after creation is part of opening a collector PR.

## Lacked

A real consumer. The register's home, who adds and removes entries, and how a merge or release is judged on the list are all outside Testing, so the comparison was shown on fixtures only. The whole Testing suite in my sandbox: the run-cases and other tests need built workspace dependencies. A fixture for Node 22 and 24 differences beyond the one the standalone Change found.

## Longed For

The consumer's side: a Defect mechanic that reads its own register and hands Testing the file. A rule that an entry which turns GREEN leaves the register in the same Change, enforced by whoever owns the list. A test-design quality trial for Testing, kept apart.

## Open

Not closed. The register's location and ownership, the judgement of a list by a merge or release, and removal of stale entries are for the consumer's Changes. The comparison is shown on fixtures and synthetic reports, not on a real repository. Collector qualification, promotion and publication are separate decisions.
