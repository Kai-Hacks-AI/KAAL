---
name: using-brain
description: Create and validate immutable BRAIN nodes whose mechanics are YAML frontmatter and whose meaning is Markdown.
---

# Using BRAIN

BRAIN contains nodes. A node is an immutable Markdown file: YAML frontmatter holds mechanics; the Markdown body holds meaning.

A node has a stable `name`. Its path is its identity. Nodes with the same name may be born later as understanding changes; earlier nodes are not changed.

An edge is directional knowledge written on the node that knows it:

`A -relation-> B`

The relation and target must already exist before A is born, in the same lineage as A. Knowledge does not cross lineages: that would need semantics of its own, which have to be learned explicitly rather than assumed. A relation is itself a node, so its semantics are preserved in the BRAIN version A uses. The pointed-at node does not gain reciprocal knowledge.

Create every node through `scripts/create-node.ts`; pass each edge as `--edge <relation>=<target>`, using node identities (paths relative to the BRAIN root). Birth is refused if an edge's relation or target does not already exist in an earlier learning of the same lineage. Validate BRAIN with `scripts/validate.ts`.

A learning is open until it is sealed. `scripts/seal.ts` seals every open learning, oldest first within each lineage, and refuses a BRAIN that does not validate. Each seal is a `seal.json` inside its learning: it records the hash of every node the learning holds and chains to the previous seal of the same lineage. Once sealed, a learning is closed: no node is born into it, and validation reports any node added, changed or removed after sealing, and any seal that no longer matches or chains. When to seal is the using system's decision; the skill only provides the mechanism.

Genesis is the bootstrap: `scripts/init.ts` creates the first BRAIN by using the same node-creation mechanics. KAAL-specific reasons for using this skill belong in BRAIN nodes, not here; this skill is KAAL-independent.
