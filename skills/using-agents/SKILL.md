---
name: using-agents
description: Use scoped AGENTS.md files as concise agent entry points that route repository work to authoritative context and capabilities.
---

# Using Agents

Use `AGENTS.md` to give an agent the minimum scoped guidance needed to enter a repository or directory correctly.

Keep `AGENTS.md` concise. It should route the agent to authoritative context or a capability rather than duplicate the meaning, rationale, or mechanics owned elsewhere.

Narrower `AGENTS.md` files provide guidance for their scope. When a skill owns a capability, point to the skill instead of reproducing its instructions.

Create a scope's entry point with `scripts/create-agents.ts <scope> <guidance-file>`. It writes `<scope>/AGENTS.md` holding exactly the guidance the using system supplies, and refuses when the scope is not an existing directory, the guidance is empty, or `<scope>/AGENTS.md` already exists. The guidance belongs to the using system; this skill only places it.
