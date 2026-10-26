# Skill Format: Testing

The planned outer tests live in `packages/skills/kaal-engineer-skill/test/plan/skill-format.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `engineer-skill/C2` writes them, turns them GREEN, and adds them to the package's `npm test`. This Change writes no test code.

| Test | Checks | Loop |
| --- | --- | --- |
| engineer-skill/T1: a standard Skill with `name`, `description`, `license`, `compatibility`, `metadata` and `allowed-tools` passes `checkSkill` with no finding | engineer-skill/F1, engineer-skill/F2 | Requirements |
| engineer-skill/T2: a standard Skill without a `## Description` section passes `checkSkill` | engineer-skill/F3 | Requirements |
| engineer-skill/T3: the shipped `kaal-engineer-skill` passes `checkSkill`, keeps `license` and `compatibility`, and has no `## Description` | engineer-skill/A1 | Architecture |
| engineer-skill/T4: the package's `.gitattributes` marks every file under `skills/` `-text`, so Git never rewrites the shipped bytes | engineer-skill/F4, engineer-skill/F6 | Architecture |
| engineer-skill/T5: a `SKILL.md` that is otherwise valid but contains CRLF or a lone CR is refused with a `kaal` finding naming line endings, and the same Skill with LF passes | engineer-skill/F6 | Requirements |

`engineer-skill/F4` and `engineer-skill/F5` are validated by Core's tests in the `core/C…` Change: the installed canonical `SKILL.md` equals the shipped one byte for byte. `engineer-skill/I2` is validated when that Change ships.
