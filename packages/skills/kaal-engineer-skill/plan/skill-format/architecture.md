# Skill Format: Architecture

Each element names, in brackets, the Requirements it answers.

- **engineer-skill/A1** [engineer-skill/F1–engineer-skill/F3, engineer-skill/N1]: The format is defined where it is checked. `skills/kaal-engineer-skill/scripts/validate.mjs` (`checkSkill`, `FIELDS`) is the executable definition, and `skills/kaal-engineer-skill/SKILL.md` with `references/kaal-skill.md` is the authored one. `engineer-skill/C2` adds the LF finding to `checkSkill` and `packages/skills/kaal-engineer-skill/.gitattributes` with `skills/** -text`, which the package does not have yet. The Skill itself is a conforming example: it carries `license: MIT` and `compatibility`, and no `## Description`.
- **engineer-skill/A2** [engineer-skill/F4, engineer-skill/F5]: Installation is Core's. This Change only states what Core must keep. The sequence, from #485:

  | Change | Owner | Depends on |
  | --- | --- | --- |
  | `engineer-skill/C1` PLAN, this Change | Engineer Skill | |
  | a Graph assessment, no Change expected | Graph | `engineer-skill/C1` |
  | `core/C…` PLAN: `core/F7` and `core/F21` amended, canonical bytes unchanged at `.agents/skills/<name>/`, digest registered (`core/F34`), derivatives copied unless the placement table names a transformation | Core | `engineer-skill/C1` |
  | `architecture/C7`, only if `## Description` is not required: `architecture/F5` and `architecture/T3` changed | Architecture | `engineer-skill/C1` |
  | `architecture/C6` sync | Architecture | `core/C…` |
  | `architecture/C5` revised | Architecture | `architecture/C6`, `architecture/C7` if raised |
  | `engineer-skill/C2` DO: the planned tests GREEN | Engineer Skill | `engineer-skill/C1` |

The collector `kaal/engineer-skill` is behind main. Its Skill and checker match main's, so this PLAN needs no sync. Bringing main's tip in is the promotion's concern.
