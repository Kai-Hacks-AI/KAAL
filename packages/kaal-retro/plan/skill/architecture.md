# Architecture (retro/C1)

Capability: Retro, a new small capability that owns the Skill. Learning does not own it, so the Skill carries no Learning dependency. Learning, Process and ACT may consume it later, each by its own Change.

Package `packages/kaal-retro/` (npm name decided in the DO), with its own `ownership.kaal.json`:

```
skills/kaal-retro/SKILL.md
skills/kaal-retro/references/4l.md
scripts/check-retro.mjs        advisory checker, no dependencies
test/                           Cases and fixtures
plan/skill/                     this Change
```

The installable unit is `skills/kaal-retro/` alone. The checker and tests are outside it, so installing the Skill never pulls them.

Collector `kaal/retro/skill`. Methods other than 4L are later files under `references/`.
