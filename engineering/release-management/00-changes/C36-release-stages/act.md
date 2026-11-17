# C36 ACT: retrospective (4L)

Written by the agent that carried the Change.

## Liked

- The judge is one pure function over parsed files. T500 to T503 need no GitHub, no network and no clock, so the same four Cases run on any host.
- Keeping `authorization`, `readiness` and `bindingCoverage` as UNKNOWN in every verdict made the limit of the judge visible in the data, not only in prose.
- KAAL's own four Stages, with the parts Collecting, Hotfixing and Wiring under Integrating, passed the judge without special cases.

## Learned

- The CPO's PLAN round moved the line between structure and platform: stage names stay logical, and a platform word, a path or a glob in a declaration is a finding. Each rule became a Case-sized assertion, which is why the DO matched the approved PLAN at the first review.
- `reference.md` is equal to the draft in `interface.md`, so a wording fix is made in two places and T503 catches the case where only one changes.
- The first Branching run on a new or toggled PR fails before auto-merge registers; a later run passes, so it is not a verdict.

## Lacked

- The declaration judge is not wired to anything: no check on pull requests reads the Stage declarations, and nothing yet reconciles them with `stages.json`.
- SOUND says the structure is well formed; nothing says the Stages are authorized or that a binding covers them.

## Longed For

- A reconciliation of the declaration with KAAL's GitHub-bound `stages.json` and with the chain block of the release strategy (release/C38, T521).
- Binding adapters (GitHub, githooks) that report which stages a platform actually covers.

## Follow-ups

- A Change that compares the declaration with `stages.json` and the strategy, with its own RED Cases; the binding adapters. Neither is part of this Change, and nothing here installs, wires or publishes anything.
