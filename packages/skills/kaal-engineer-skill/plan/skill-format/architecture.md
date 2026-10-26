# Skill Format: Architecture

Each element names, in brackets, the Requirements it answers.

- **engineer-skill/A1** [engineer-skill/F1–engineer-skill/F4, engineer-skill/N1]: The interpretation lives where conformance is checked, in `skills/kaal-engineer-skill/scripts/validate.mjs`. `engineer-skill/C2` brings `checkSkill` to `engineer-skill/F3` and `engineer-skill/F4`: decoding becomes fatal UTF-8 with the byte order mark ignored, the YAML options are stated rather than left to defaults, and a lone CR stays an ordinary character. It also exports the interpretation itself, the frontmatter fields with the findings, so a consumer reads fields from Engineer Skill instead of re-parsing. How Core imports it, and where that sits in the dependency order, is `core/C22`'s to plan, with Engineer Skill reviewing.
- **engineer-skill/A2** [engineer-skill/F5–engineer-skill/F7]: Installation and placement are Core's. This Change states only what Core must keep. `engineer-skill/C2` adds `packages/skills/kaal-engineer-skill/.gitattributes` with `skills/** -text`, which the package does not have yet.

## Assessment: Engineer Skill's frontmatter and Graph's Form

Both read YAML with the same `yaml` 2.9.1, but they implement different contracts, so this is not a duplication.

| | Graph's Form (`kaal-graph/scripts/form.mjs`) | Engineer Skill (`checkSkill`) |
| --- | --- | --- |
| What it reads | a KAAL Node, whose id is the SHA-256 of its exact bytes | a `SKILL.md`, as the Agent Skills standard defines it |
| Line endings | LF only; a CR anywhere in the frontmatter is not in Form | CRLF and LF are both line breaks (`engineer-skill/F3`) |
| YAML | 1.2 core schema; no anchors, aliases, merge keys or tags outside the core schema | 1.2 core schema; aliases resolve, within `yaml`'s bound |
| Fields | any mapping, nothing interpreted | the six standard fields, each checked |
| Body | never read | its relative references must resolve inside the Skill |

Graph's strictness exists because a Node's identity is its bytes: two encodings of the same text would be two Nodes. A `SKILL.md` is not a Node and has no identity of its own. KAAL's Node for a Skill is the separate Skill Node in the package's `payload/` (`references/kaal-skill.md`), which is in Form and stays Graph's and Core's. The installed `SKILL.md` is identified by the digest Core registers over its exact bytes (`core/F34`), and byte preservation (`engineer-skill/F5`, `engineer-skill/F7`) keeps that digest stable without any line-ending rule.

So no responsibility moves. Graph keeps generic Node and Form semantics. Engineer Skill keeps the Agent Skill schema and its interpretation. Core reading `SKILL.md` through Graph's Form reader, which `renderSkill` does today, applies a Node's contract to a file that is not a Node. That use ends with `renderSkill` in `core/C22`. The shared `yaml` dependency is a shared library, not shared semantics, and needs no owner beyond each package's pin.

## Sequence

| Change | Owner | Depends on |
| --- | --- | --- |
| `engineer-skill/C1` PLAN, this Change | Engineer Skill | |
| `engineer-skill/C2` DO: `engineer-skill/A1`, `engineer-skill/A2`, the planned tests GREEN | Engineer Skill | `engineer-skill/C1` |
| `core/C22` PLAN: `renderSkill` retired, `core/F7` and `core/F21` amended, canonical bytes installed unchanged, digest registered (`core/F34`), placement table | Core | `engineer-skill/C1` |
| `architecture/C7`: `architecture/F5` and `architecture/T3` no longer assume `## Description` | Architecture | `engineer-skill/C1` |
| `architecture/C6` sync | Architecture | `core/C22` |
| `architecture/C5` revised | Architecture | `architecture/C6`, `architecture/C7` |

The collector `kaal/engineer-skill` is behind main. Its Skill and checker equal main's, so this PLAN needs no sync. Bringing main's tip in is the promotion's concern.
