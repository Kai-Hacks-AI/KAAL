# Reference: the Agent Skills standard

The authority is the published specification, https://agentskills.io/specification. Read it before writing a skill. This file lists what `check-skill` decides, and what it leaves to you.

## Standard rules check-skill decides

- The skill is a directory holding `SKILL.md`, which begins with YAML frontmatter between `---` lines. The frontmatter is valid YAML and a mapping of fields; any YAML the standard permits is accepted, as a YAML parser reads it.
- Only these fields: `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`.
- `name`: required; 1-64 characters; lowercase letters, digits and hyphens; no leading, trailing or doubled hyphen; equal to the name of its parent directory.
- `description`: required; 1-1024 characters.
- `compatibility`: optional; 1-500 characters.
- `metadata`: optional; a map from string keys to string values. Quote keys and values YAML would read as numbers, booleans or null, such as `version: "1.0"`.
- `allowed-tools`: optional; a space-separated string. It is experimental, and hosts vary.
- `SKILL.md` under 500 lines is recommended, so check-skill only warns.

## KAAL rule check-skill adds

- Every relative file reference in `SKILL.md`, whether a link or image destination as CommonMark reads it, or a path under `scripts/`, `references/` or `assets/` in text or code, names a file inside the skill directory.

## Guidance only

- The `description` says what the skill does and when to use it, with keywords that help an agent pick it. Hosts load only `name` and `description` up front.
- The body is loaded whole when the skill is activated. Keep it focused, and move detail into `references/`, one level deep.
- `scripts/` are self-contained or document their dependencies.
- Where a host keeps skills is the host's business. The standard does not define it, and a skill must not assume it.
