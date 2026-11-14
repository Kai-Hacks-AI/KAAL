# kaal-retro

Retro is the capability for conducting a retrospective on any subject: finished or ongoing work, a decision, an event, an experience, a process or a product. This package is its home. It is not part of Core. Core provides the `KAAL Capability` and `KAAL Skill` types and admission, and Retro joins through them.

```
capability/Retro.md   the Capability Node, typed by Core's KAAL Capability
payload/Retro.md      the Skill Node, typed by Core's KAAL Skill
skills/kaal-retro/    the installable Skill: SKILL.md and references/4l.md
```

The installable unit is `skills/kaal-retro/` alone. It works installed by itself and depends on no other package, on Core or on the two Nodes above. 4L is its first method; others can be added as further references.

`npm test` checks the written contract of the Skill, 4L records against the reference, the Nodes' form, the ownership claim, and that Core admits the Capability and the Skill on a fresh Engine. Whether an agent follows the Skill is nondeterministic and is judged from trials, not from the tests: see `plan/skill/do.md`.
