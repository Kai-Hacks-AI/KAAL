---
name: using-brain
description: Create and validate immutable BRAIN nodes whose mechanics are YAML frontmatter and whose meaning is Markdown.
---

# Using BRAIN

BRAIN contains nodes. A node is an immutable Markdown file: YAML frontmatter holds mechanics; the Markdown body holds meaning.

A node has a stable `name`. Its path is its identity. Lineages and slugs are path components, so they must be portable: lowercase kebab-case (`a-z`, `0-9`, single hyphens) and never a Windows reserved device name such as `con` or `nul`. Portable path components keep a node's path, which is its identity, the same on every supported platform. Nodes with the same name may be born later as understanding changes; earlier nodes are not changed.

An edge is directional knowledge written on the node that knows it:

`A -relation-> B`

The relation and target must already exist before A is born, in the same lineage as A. Knowledge does not cross lineages: that would need semantics of its own, which have to be learned explicitly rather than assumed. A relation is itself a node, so its semantics are preserved in the BRAIN version A uses. The pointed-at node does not gain reciprocal knowledge.

Create every node through `scripts/create-node.ts`; pass each edge as `--edge <relation>=<target>`, using node identities (paths relative to the BRAIN root). Birth is refused if an edge's relation or target does not already exist in an earlier learning of the same lineage. Validate BRAIN with `scripts/validate.ts`.

A using system bootstraps its BRAIN by birthing its first nodes through the same mechanism as any other node. Its reasons for using this skill belong in those nodes, not here: this skill is independent of any using system.
