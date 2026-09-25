---
name: using-skills
description: Engineer skills that follow the Agent Skills standard and are born from their own init, and check that they do.
---

# Using Skills

A skill is a directory holding `SKILL.md`: YAML frontmatter, then the instructions an agent follows. This skill checks skills against the Agent Skills standard (https://agentskills.io/specification) and against one engineering rule: a skill is born from its own init.

The standard: the frontmatter's `name` is required, 1 to 64 lowercase letters, digits and single hyphens, not starting or ending with a hyphen, and equal to the skill's directory name. `description` is required, 1 to 1024 characters, saying what the skill does and when to use it. `license`, `compatibility` (1 to 500 characters), `metadata` (strings to strings) and `allowed-tools` are optional, and no other field is allowed. `scripts/`, `references/` and `assets/` hold what the instructions use.

Born from init: the skill's `scripts/init.ts` exports `init(target)`, which writes the skill's `SKILL.md` to `target`, and running `scripts/init.ts` writes it next to the scripts. `SKILL.md` is never edited by hand: change init and run it. A skill is born correctly when its committed `SKILL.md` is exactly the bytes its init generates, so the using system must keep `SKILL.md` byte-exact wherever it is checked out and never reformat it.

Check with `scripts/check.ts <skills-dir>`: every directory in it is a skill, and every way a skill breaks the standard or differs from what its init generates is reported. Checking runs each skill's init into a scratch file, never over the skill. From code, `checkSkills` in `scripts/skills.ts` returns the same errors, and `standardErrors` and `birthErrors` check one skill against each rule. Which skills to keep and when to check them is the using system's decision; this skill only checks.
