# Skill Format: Intent

This is `engineer-skill/C1`, a PLAN Change. It is Engineer Skill's first Change. It ships no code. It states what a canonical KAAL Skill is, how its `SKILL.md` is interpreted and by whom, so that Core installs it without a parser of its own. `engineer-skill/C2`, a DO Change, turns the planned tests GREEN, and `core/C22` retires `renderSkill` against this contract.

Today two parsers decide what a `SKILL.md` means. Engineer Skill's `checkSkill` reads it as the Agent Skills standard does: every standard field, `license` included, with CRLF and LF alike. Core's `realize` renders every `SKILL.md` it installs (`core/F7`, `core/F21`): it reads the frontmatter with Graph's Form reader, which refuses CRLF, keeps only `name`, and derives `description` from a `## Description` section in the body. So the installed file is not the file Engineer Skill checked, a conforming CRLF Skill cannot be installed, and schema policy has quietly moved to Core.

- **engineer-skill/I1.** One semantic authority: Engineer Skill owns the Agent Skill schema, its conformance and the interpretation of `SKILL.md`. Core and other consumers use that interpretation and do not define their own.
- **engineer-skill/I2.** The canonical Skill a supplier ships is the canonical Skill a consumer receives, byte for byte, with no silent normalization.
- **engineer-skill/I3.** A provider derivative differs from the canonical Skill only where its placement says so. Placement is Core's. What the Skill's fields mean stays Engineer Skill's.
