---
name: kaal-engineer-skill
description: Produce and update KAAL Skills, and check that their Agent Skill conforms to the Agent Skills standard. Use when creating, changing or checking a KAAL Skill, its Skill Node, or its SKILL.md.
license: MIT
compatibility: The checker needs Node.js 20.1 or later and the kaal-hosting package.
---

# Engineering KAAL Skills

Use this to produce or update a KAAL Skill. What a KAAL Skill is, and what this capability means, is stated by the Nodes `KAAL Skill` and `Engineer Skill` in a KAAL Engine: read them there, starting from the Engine's `AGENTS.md`. This file only tells you how to do the work correctly.

## What a KAAL Skill consists of

- **Its Skill Node**: a Node typed by Core's `KAAL Skill`, stating what the capability means to KAAL and its scope. Core owns its identity, its type resolution and its admission into an Engine.
- **Its Agent Skill**: a directory holding `SKILL.md` and optional `references/`, `scripts/`, `assets/`. It tells an agent how to do the work, and points to the Node rather than defining the capability again.

How the two are packaged and delivered is not part of this Skill.

## Steps

1. **Find Core's `KAAL Skill` Node** with `kaal resolve "KAAL Skill"`. Its id is the type every Skill Node names.
2. **Write the Skill Node** in the Form from [references/kaal-skill.md](references/kaal-skill.md). Keep it concise: meaning and scope, no paths, commands or implementation. Its id is the SHA-256 of its exact bytes, so keep line endings untouched.
3. **Write the Agent Skill**, following [references/agent-skills.md](references/agent-skills.md). Its directory name is its `name`. The `description` is what makes it discoverable: say what it does and when to use it, in the words a task would use.
4. **Check the Agent Skill**: `node scripts/check-skill.mjs <skill-dir>`.
5. **Let Core decide the Node**: `kaal identify <node-file>` shows its id and type, and `kaal register skill <capability> <dir>` admits it into an Engine or says why not.

## Reading the checker

Each finding says its kind:

- `standard`: a violation of the Agent Skills standard. Fix the skill.
- `kaal`: a violation of a KAAL Skill engineering rule beyond the standard. Every relative file reference in `SKILL.md` must resolve inside the skill, so it works wherever a host places it. Fix the skill.
- `unsupported`: frontmatter the checker cannot read. It may be valid YAML, and conformance is left undecided. Prefer plain or quoted scalars, or validate with the standard's reference validator.

It exits 0 when nothing is found, 1 on a standard or kaal violation, and 3 when the only findings are unsupported. Warnings, such as a `SKILL.md` of 500 lines or more, do not fail.

## Rules

- Assume no host. Reference only files inside the skill, by relative path.
- Never write into an Engine by hand, and never change Core to admit a Skill.
- If a check fails, fix the cause. Do not weaken the check or the Node to pass.
