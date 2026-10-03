// The first two Nodes, handcrafted. Paths are deployment locations only: a
// Node's bytes say nothing about where it is stored.

/** Where Node 1, `Node`, is deployed, relative to the KAAL directory. */
export const NODE_PATH = "core/Node.md";

/** Where Node 2, `Edge`, is deployed, relative to the KAAL directory. */
export const EDGE_PATH = "core/Edge.md";

export function nodeMarkdown(): string {
  return `# Node

A Node is a unit of meaning, written as one Markdown file. It points to other Nodes only by ID, never by location, and it knows nothing of where it is stored.

Once sealed, a Node never changes. Its ID is the SHA-256 of its exact bytes, so the same bytes are the same Node wherever they live.
`;
}

export function edgeMarkdown(): string {
  return `# Edge

An Edge is a pointer from one Node to others. The Node that declares it is the source. It points only to Nodes that are already sealed, and it names them by their immutable ID, never by where they are stored. Nothing is changed in the Nodes it points at.
`;
}
