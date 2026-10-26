# Canonical Skill Bytes: Testing

The planned outer tests live in `packages/kaal-core/test/plan/skill.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `core/C23` turns them GREEN and adds them to Core's `npm test`. They use kaal-core's public interface only.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T19 (amended by `core/C22`): every Skill file Core deploys is the source's bytes unchanged, at `.agents/skills/<name>/` and in the Claude Code copy. This includes a standard `SKILL.md` with a prose `description` and `license`, and a `SKILL.md` with no frontmatter at all | core/F21, core/N13, core/A24 | Requirements |
| core/T49: `kaal-core/agent` offers no `renderSkill` | core/N13, core/A24 | Architecture |

`core/C22` also amends two tests in place in `test/plan/installation.test.mjs`, both GREEN before and after `core/C23`. core/T17 builds its earlier `SKILL.md` from source bytes instead of `renderSkill`. core/T20 checks only that the same inputs give the same plan. core/T19 moves from that file to `skill.test.mjs`.

## RED evidence

The tests run with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/skill.test.mjs`. At `core/C22`:

- **core/T19 is RED.** `realize` throws for the standard `SKILL.md`, because it has no `## Description` section to render: Core refuses to deploy a Skill the standard accepts. Where it does render, the canonical `SKILL.md` it plans has only `name` and `description` and loses `license`.
- **core/T49 is RED on its behavioural assertion.** `kaal-core/agent` exports `renderSkill`.
