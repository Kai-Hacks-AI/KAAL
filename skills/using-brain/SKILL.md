---
name: using-brain
description: Create and validate immutable BRAIN nodes whose mechanics are YAML frontmatter and whose meaning is Markdown.
---

# Using BRAIN

BRAIN contains nodes. A node is an immutable Markdown file: YAML frontmatter holds mechanics; the Markdown body holds meaning.

A node has a stable `name`. Its path is its identity. Nodes with the same name may be born later as understanding changes; earlier nodes are not changed.

An edge is directional knowledge written on the node that knows it:

`A -relation-> B`

The relation and target must already exist before A is born. A relation is itself a node, so its semantics are preserved in the BRAIN version A uses. The pointed-at node does not gain reciprocal knowledge.

Create every node through `scripts/create-node.ts`. Validate BRAIN with `scripts/validate.ts`.

Genesis is the bootstrap: `scripts/init.ts` creates the first BRAIN by using the same node-creation mechanics. KAAL-specific reasons for using this skill belong in BRAIN nodes, not here; this skill is KAAL-independent.
