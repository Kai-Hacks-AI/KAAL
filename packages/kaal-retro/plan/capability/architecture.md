# Architecture (retro/C2)

This amends retro/C1's architecture, which provisionally claimed Learning. Retro is the owner. The package gains two Nodes beside the Skill, as kaal-testing does, and the installable unit is unchanged:

```
packages/kaal-retro/
  capability/Retro.md      the Capability Node, typed by Core's KAAL Capability
  payload/Retro.md         the Skill Node, typed by Core's KAAL Skill
  ownership.kaal.json      owner: capability Retro, id = capability/Retro.md
  skills/kaal-retro/       the installable Skill, unchanged and independent
```

Registration path. Core admits a contribution through `register(engine, "capability", "retro", readContribution("capability"))` and `registerSkill(engine, "retro", readContribution("payload"))` on an Engine from `bootstrap`. The Cases perform exactly this on a temporary Engine. This repository's own Engine, `.kaal/`, registers no Capability today, so registering Retro there is not part of this Change; it is a separate decision that needs the Owner.

Collector. `kaal/retro/skill` already has the capability segment `retro`. No branch is moved.

C1's PLAN, DO and ACT stay as landed. The ownership statements in them are superseded by this Change; C2's ACT records that.
