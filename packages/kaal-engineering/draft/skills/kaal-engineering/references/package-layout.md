# Package layout

The layout of a KAAL capability package. This capability owns it. It is a template for a new package or a package that is being cleaned up, and it moves no existing package: migration comes later, package by package.

```
packages/<capability>/
  AGENTS.md          the Agent: how to work in this package (BASS: Bare to Agent)
  README.md  LICENSE  package.json  *.kaal.json
  00-backlog/        what we might do
  01-changes/        in flight, temporary
  02-controls/       only controls over this package itself
  10-intent/         intent, test-cases/
  11-requirements/   requirements, test-cases/
  12-architecture/   architecture, test-cases/
  13-source/
    skill/           SKILL.md and payload (BASS: Agent to Skill)
    scripts/         deterministic (BASS: Skill to Script)
    unit-tests/
  14-defects/        defects, test-cases/ that prove them
  dist/              generated from 13-source for npmjs; never edited, not committed
```

## Rules

- The numbers only order the folders for people. They carry no other meaning.
- Each concern carries its own tests in its own folder: `test-cases/` beside intent, requirements, architecture and defects, and `unit-tests/` beside the source.
- Only scripts, unit tests and test-cases are deterministic. Everything else is validated by review.
- `02-controls/` holds only controls over the package itself: its development, its delivery and its solution. A control about how a consumer runs its own repository is consumer space and is not package content.
- `dist/` is generated and never edited.
