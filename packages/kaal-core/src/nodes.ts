// The first two Nodes, handcrafted. Paths are deployment locations only: a
// Node's bytes say nothing about where it is stored.

/** Where Node 1, `Node`, is deployed, relative to the KAAL directory. */
export const NODE_PATH = "core/Node.md";

/** Where Node 2, `Edge`, is deployed, relative to the KAAL directory. */
export const EDGE_PATH = "core/Edge.md";

export function nodeMarkdown(): string {
  return `---
name: Node
---

# Node

A Node is a unit of meaning, written as one Markdown file whose YAML frontmatter declares it a Node. It refers to other Nodes only by name and immutable ID, never by location, and it knows nothing of where it is stored.

Node 1 is the genesis exception: it cannot refer to itself, so it declares no type. Every later Node declares \`type\`, a reference to the Node that defines what a Node is.

Once sealed, a Node never changes. Its ID is the SHA-256 of its exact bytes, so the same bytes are the same Node wherever they live.
`;
}

/** Node 2 is typed by Node 1, so it carries Node 1's ID, frozen. */
export function edgeMarkdown(nodeId: string): string {
  return `---
name: Edge
type:
  name: Node
  id: ${nodeId}
---

# Edge

An Edge is a pointer from one Node to others. The Node that declares it is the source. It points only to Nodes that are already sealed, and it refers to each by a pair: its name and its immutable ID. The ID is the identity, and the name can be checked by resolving that exact Node. An Edge never refers to where a Node is stored, and nothing is changed in the Nodes it points at.
`;
}
