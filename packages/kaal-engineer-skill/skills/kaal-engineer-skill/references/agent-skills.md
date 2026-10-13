# Reference: the Agent Skills standard

The authority is the published specification, https://agentskills.io/specification. Read it before writing a skill. This file lists what `check-skill` decides, and the guidance it cannot decide.

## Decided by check-skill

- The skill is a directory holding `SKILL.md`, which begins with YAML frontmatter between `---` lines.
- Only these fields: `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`.
- `name`: required; 1-64 characters; lowercase letters, digits and hyphens; no leading, trailing or doubled hyphen; equal to the skill's directory name.
- `description`: required; 1-1024 characters.
- `compatibility`: optional; 1-500 characters.
- `metadata`: optional; a map from string keys to string values. Quote values YAML would read as numbers or booleans, such as `version: "1.0"`.
- `allowed-tools`: optional; a space-separated string. Experimental, and hosts vary.
- Every relative file reference in `SKILL.md` (a Markdown link, or a path under `scripts/`, `references/` or `assets/`) names a file inside the skill directory.
- `SKILL.md` under 500 lines is recommended, and only warned about.

check-skill reads a plain subset of YAML: `key: value` lines, and one indented level under `metadata:`. Values are plain, single-quoted or double-quoted. Quote any value containing `: ` or ` #`. Anything outside the subset is reported, not guessed at.

## Guidance only

- The `description` says what the skill does and when to use it, with keywords that help an agent pick it. Hosts load only `name` and `description` up front.
- The body is loaded whole when the skill is activated: keep it focused (under about 5000 tokens) and move detail into `references/`, one level deep.
- `scripts/` are self-contained or document their dependencies, and fail with helpful messages.
- Where a host keeps skills is the host's business. The standard does not define it, and a skill must not assume it.
