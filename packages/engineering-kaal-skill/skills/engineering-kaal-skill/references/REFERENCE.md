# Reference: engineering a KAAL Skill

## A Skill Node

```
---
name: <Node name>
type:
  name: Skill
  id: <ID of the sealed Skill Node>
---

# <Node name>

<What the capability means to KAAL, and its scope.>
```

Exactly this front matter: `name`, then `type` as an indented `name` and `id` pair. The ID is lowercase hex, 64 characters, the SHA-256 of the sealed `Skill` Node's exact bytes. A Node is a KAAL Skill exactly when its type refers, by name and ID, to the `Skill` Node.

A capability may carry more than one Node in `kaal/`; at least one must be typed by `Skill`. Every Node needs its own seal, `kaal/seals/<ID>`, an empty file named by the Node's own ID.

## What registration requires

Core's `registerSkill(kaalDir, capability, contribution)` accepts a contribution of exactly Nodes and their own seals, and requires every Node to be admitted into the installed KAAL together with the contribution: its own seal, a type that resolves by name and ID to an admitted Node, and at least one Node typed by the installed `Skill`. A Node with no type, or a seal with no carried Node, is refused. Registering twice changes nothing, and a registered path is never given other bytes.

## Agent Skills conformance (the standard's rules this repo checks)

- `SKILL.md` begins with YAML frontmatter. Allowed fields: `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`.
- `name`: 1-64 characters, lowercase letters, digits and hyphens, no leading, trailing or doubled hyphen, equal to the skill's directory name.
- `description`: required, at most 1024 characters, says what the skill does and when to use it.
- `compatibility`: optional, 1-500 characters.
- Optional directories: `scripts/`, `references/`, `assets/`. Reference files by relative path, one level deep from `SKILL.md`. Keep `SKILL.md` under 500 lines.

The published specification is at https://agentskills.io/specification; read it before writing a Skill, since it is the authority and this list is only what `check-skill` can decide.
