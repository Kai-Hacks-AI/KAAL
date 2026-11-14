# Architecture (retro/C1)

The first increment is a package holding one Skill:

```
packages/kaal-retro/
  ownership.kaal.json
  skills/kaal-retro/SKILL.md
  skills/kaal-retro/references/4l.md
  test/            Cases, fixture 4L records and the test-only record challenge
  plan/skill/      this Change, and the trial accounting (trial.json)
```

The installable unit is `skills/kaal-retro/` alone; the tests and the plan are outside it.

Ownership. Independence of installation does not make a capability. Retro is a learning practice, and Learning owns learning practices, so the proposal is that `ownership.kaal.json` claims the existing Learning capability for `packages/kaal-retro/`, with no new capability. Ownership is a claim, not a dependency: the Skill does not mention or require Learning, and the rest of Learning stays on `kaal/learning`. CPO decides; the alternative is a new Retro capability.

Collector `kaal/retro/skill`, because `kaal/learning` exists and a branch `kaal/learning/<x>` cannot. Methods other than 4L are later files under `references/`.
