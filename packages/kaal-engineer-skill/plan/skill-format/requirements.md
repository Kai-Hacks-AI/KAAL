# Skill Format: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **engineer-skill/F1** [engineer-skill/I1]: A canonical KAAL Skill is a directory whose `SKILL.md` conforms to the Agent Skills standard and to `checkSkill`, with no `standard` or `kaal` finding. Nothing else is required of its form.
- **engineer-skill/F2** [engineer-skill/I1]: The frontmatter's `description` is the one authoritative description: discovery and selection metadata for an agent or host. The body owns the instructions. No body section is required, a `## Description` section in particular, and nothing in the frontmatter is derived from body prose.
- **engineer-skill/F3** [engineer-skill/I1]: The frontmatter is interpreted deterministically, and `checkSkill` is that interpretation. `SKILL.md` is UTF-8, and a leading byte order mark is not content. CRLF and LF are both line breaks and give the same interpretation, so the same Skill with either line ending has the same fields and the same findings. A lone CR is not a line break. The frontmatter is one YAML 1.2 mapping read with the core schema, by `yaml` at its pinned version. A duplicate key is not a mapping. The standard fields are `name`, `description`, `license`, `compatibility`, `metadata` and `allowed-tools`, each kept with its value as read.
- **engineer-skill/F4** [engineer-skill/I1, engineer-skill/I2]: Bytes that are not UTF-8 are a `standard` finding naming the reason. They are not decoded with replacement characters, because that would change the Skill's text silently.
- **engineer-skill/F5** [engineer-skill/I2]: Installing a conforming canonical Skill keeps every file's bytes unchanged, `SKILL.md` included, whichever line endings it has. Nothing is normalized, re-serialized or rendered.
- **engineer-skill/F6** [engineer-skill/I3]: A provider derivative is a copy of the canonical Skill unless its placement names a transformation. A transformation that needs a field's value takes it from Engineer Skill's interpretation (`engineer-skill/F3`), never from a parse of its own.
- **engineer-skill/F7** [engineer-skill/I2]: LF is a packaging convention for KAAL-authored Skills, not a requirement of the format. Each package that ships Skills marks `skills/** -text` in its `.gitattributes`, as `guard/C57` does for Guard, so that Git never rewrites the shipped bytes on any host and the digest Core registers is the same everywhere. `checkSkill` does not refuse CRLF: the Agent Skills standard does not require LF, and KAAL adds no parser restriction for it.

## Nonfunctional

- **engineer-skill/N1** [engineer-skill/I1]: There is one implementation of the interpretation, in Engineer Skill. Core does not parse or render `SKILL.md`, and a Skill that passes `checkSkill` is never rejected or rewritten by Core for a reason `checkSkill` does not name.

## Not in this Change

- Code. `checkSkill`, `scripts/validate.mjs` and the shipped Skill are unchanged until `engineer-skill/C2`.
- Core's installation. `core/C22` amends `core/F7` and `core/F21`, retires `renderSkill`, writes canonical bytes unchanged at `.agents/skills/<name>/`, registers their digest (`core/F34`) and defines the placement table.
