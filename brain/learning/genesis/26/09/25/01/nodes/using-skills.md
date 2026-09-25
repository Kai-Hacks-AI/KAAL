---
name: using-skills
---

# Using Skills

KAAL uses the **using-skills** skill so every skill KAAL keeps can be used by any agent that reads the standard, and has one source for its instructions. KAAL holds its skills to two rules:

A skill follows the Agent Skills standard: https://agentskills.io/specification.

A skill is born from its own init: `scripts/init.ts` generates the skill's `SKILL.md`. `SKILL.md` is never edited by hand, and KAAL's tests prove every committed `SKILL.md` is exactly what its init generates.

The skill explains how both rules are checked. This node records why KAAL uses it.
