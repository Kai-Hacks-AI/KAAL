# Skill Format: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **engineer-skill/F1** [engineer-skill/I1]: The canonical KAAL Skill is a directory whose `SKILL.md` conforms to the Agent Skills standard and to `checkSkill` with no `standard` or `kaal` finding. Nothing else is required of its form.
- **engineer-skill/F2** [engineer-skill/I1, engineer-skill/I2]: The canonical frontmatter keeps every standard field it carries: `name`, `description`, `license`, `compatibility`, `metadata` and `allowed-tools`. `description` is a frontmatter field, written by the Skill's author, not derived from the body.
- **engineer-skill/F3** [engineer-skill/I1]: The body has no required section. In particular, `## Description` is not required, and when present it is ordinary body text (decision below).
- **engineer-skill/F4** [engineer-skill/I2]: Canonical installation keeps the canonical Skill's bytes unchanged: every file, frontmatter and body.
- **engineer-skill/F6** [engineer-skill/I1, engineer-skill/I2]: A canonical `SKILL.md` has LF line endings only. `checkSkill` refuses one containing a CR with a `kaal` finding that names the reason. Git never rewrites the shipped bytes: the package's `.gitattributes` marks `skills/** -text`, as `guard/C57` does for Guard (decision below).
- **engineer-skill/F5** [engineer-skill/I3]: A provider derivative is a copy of the canonical Skill unless its placement names a transformation. Defining placements and transformations is Core's (`engineer-skill/A2`).

## Nonfunctional

- **engineer-skill/N1** [engineer-skill/I1]: `checkSkill` remains the single gate. A Skill that passes it is a valid canonical Skill, and Core does not reject or rewrite one for a reason `checkSkill` does not name.

## Decision for the Owner: `## Description`

This Change proposes that `## Description` is **not** required by the canonical format. It mattered only to render a provider derivative's `description` from the body (`core/F21`). Once the canonical frontmatter keeps its own `description` (`engineer-skill/F2`) and is installed unchanged (`engineer-skill/F4`), the section has no reader, and requiring it would make a standard Skill fail KAAL for a reason the standard does not know.

The consequence: `architecture/F5` and `architecture/T3`, which assume the section, change in `architecture/C7` before `architecture/C5` is revised. If the Owner keeps the section required instead, `engineer-skill/F3` becomes "`## Description` is required", `checkSkill` gains that `kaal` finding in the DO Change, and the `architecture/C4` boundary stays as it is.

## Decision for the Owner: line endings

Graph stays LF only, because a Node's identity is the SHA-256 of its exact bytes, and Core reads `SKILL.md` through Graph's Form reader. This Change proposes that a canonical KAAL Skill is **LF only**, so `checkSkill` refuses CRLF (`engineer-skill/F6`). Every Skill that passes `checkSkill` can then be read by Core, and no layer converts line endings.

The option not chosen: Core reads `SKILL.md` through Engineer Skill's rules instead of Graph's, and accepts CRLF. That keeps today's `checkSkill` behavior, but gives Core two readers for one file, and the canonical bytes a consumer receives could then differ by host while Node identity does not.

## Not in this Change

- Code. `checkSkill`, `scripts/validate.mjs` and the shipped Skill are unchanged.
- Core's installation. Amending `core/F7` and `core/F21`, writing canonical bytes unchanged at `.agents/skills/<name>/`, registering the digest (`core/F34`) and the placement table are a `core/C…` PLAN that depends on this one.
