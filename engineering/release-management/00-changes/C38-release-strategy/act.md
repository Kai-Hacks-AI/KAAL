# C38 ACT: retrospective (4L)

Written by the agent that carried the Change.

## Liked

- A small chain block that a test can read: T521 compares it with `stages.json` in a few lines, so the strategy and the configured stages cannot drift without a red Case.
- Keeping the document to 40 lines and testing its size and its absence of GitHub settings kept it a strategy and not a second copy of the rulesets.

## Learned

- The CPO's two rounds sharpened the content more than the structure did: the first named the missing Promoting > Integrating challenge and the forward direction of Promoting > Publishing, the second separated installation and integrity of the hooks from proof that a hook executed. Stating a direction and a limit in the draft made each one assertable.
- The draft in `interface.md` doubles as the expected text of T520, so a wording fix is made in two places and the Case catches the case where only one changes.
- The first Branching run on a new PR fails before auto-merge registers; the later run passes, so it is not a verdict.

## Lacked

- Nothing yet makes `verify Stages` read the strategy: T521 runs as a Case, not as a check on pull requests.
- IN, STOCK and OUT are stated in prose and are not mapped to controls.
- Hook execution has no evidence, only installation and integrity.

## Longed For

- A register of controls (controls/C8) to which each IN, STOCK and OUT item points.
- A reconciliation of the chain block with release/C36's platform-free stage declaration.

## Follow-ups

- A Change that lets `verify Stages` test `stages.json` against the strategy, with its own RED Cases; the controls work that maps IN, STOCK and OUT to controls; reconciling with C36. No workflow, ruleset or publication is part of this Change.
