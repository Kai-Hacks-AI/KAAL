---
name: Graph
type:
  name: KAAL Skill
  id: 4e01b2d4da8bbaea7c73eb1a02a4f5e898f7a4154a0186c16cedfd1ef9a53933
---

# Graph

Graph is the capability for relating Nodes to one another and navigating those relationships. Its scope is that alone.

A relationship is an Edge, embedded in the Node it goes out from. Edges are grouped by their type: each group names one Node that defines what the relationship means, and one or more target Nodes. Each target is one Edge. Every reference is a name and an id, so an Edge points to exact, immutable content. Changing an Edge, or the Node that defines it, gives a new identity; earlier relationships keep their earlier meaning.

A target needs no reference back. Incoming relationships, and any index or traversal, are derived from the Nodes and never replace them.

Graph checks that Edges are well formed and that what they reference is present, and it reports what is not. What a relationship means belongs to the Node that defines it; Graph gives no relationship a meaning of its own.
