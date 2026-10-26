# Skill Format: Intent

This is `engineer-skill/C1`, a PLAN Change. It is Engineer Skill's first Change. It ships no code and changes no checker behavior. It states what a canonical KAAL Skill is, so that Core's installation can keep it, and a later DO Change turns the planned tests GREEN.

Today the canonical format is defined twice. Engineer Skill's `checkSkill` accepts a standard `SKILL.md` with every standard field, `license` included. Core's `realize` renders every `SKILL.md` it installs (`core/F7`, `core/F21`), keeps only `name` and `description` in the frontmatter, and requires a `## Description` section to build `description`. So the installed canonical file is not the file Engineer Skill checked, and it loses `license`. The two also disagree on line endings: `checkSkill` accepts a CRLF `SKILL.md`, and Graph's Form reader, which `renderSkill` uses, refuses one.

- **engineer-skill/I1.** A canonical KAAL Skill has one definition, owned by Engineer Skill: a standard `SKILL.md` that `checkSkill` accepts.
- **engineer-skill/I2.** The canonical Skill a supplier ships is the canonical Skill a consumer receives, byte for byte.
- **engineer-skill/I3.** A provider derivative may differ from the canonical Skill only where its placement says so, and that transformation is Core's, not part of the canonical format.
