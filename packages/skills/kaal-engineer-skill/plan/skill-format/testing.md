# Skill Format: Testing

The planned outer tests live in `packages/skills/kaal-engineer-skill/test/plan/skill-format.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `engineer-skill/C2` writes them, turns them GREEN, and adds them to the package's `npm test`. This Change writes no test code.

| Test | Checks | Loop |
| --- | --- | --- |
| engineer-skill/T1: a Skill with `name`, `description`, `license`, `compatibility`, `metadata` and `allowed-tools` passes `checkSkill`, and the exported interpretation returns each field with its value as read | engineer-skill/F1, engineer-skill/F3 | Requirements |
| engineer-skill/T2: a Skill without a `## Description` section passes, and its `description` is the frontmatter's even when the body has such a section | engineer-skill/F2 | Requirements |
| engineer-skill/T3: the same Skill with LF, with CRLF, and with a leading byte order mark gives the same fields and the same findings; a lone CR is not read as a line break | engineer-skill/F3, engineer-skill/F7 | Requirements |
| engineer-skill/T4: a `SKILL.md` whose bytes are not UTF-8 gets a `standard` finding naming the encoding | engineer-skill/F4 | Requirements |
| engineer-skill/T5: the shipped `kaal-engineer-skill` passes `checkSkill`, keeps `license` and `compatibility`, and has no `## Description` | engineer-skill/A1 | Architecture |
| engineer-skill/T6: the package's `.gitattributes` marks every file under `skills/` `-text` | engineer-skill/F7, engineer-skill/A2 | Architecture |

`engineer-skill/F5`, `engineer-skill/F6` and `engineer-skill/N1` are validated by Core's tests in `core/C22`: a conforming canonical `SKILL.md`, LF or CRLF, is installed equal to the shipped one byte for byte, and Core imports no `SKILL.md` parser of its own. `engineer-skill/I2` is validated when that Change ships.
