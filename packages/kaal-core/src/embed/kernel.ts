/** Path of the Kernel, relative to the `.kaal` directory it belongs in. */
export const KERNEL_PATH = "core/KERNEL.md";

/**
 * The Kernel: the first Node. TypeScript here is its only authority; the
 * Markdown is produced, never maintained by hand.
 */
export function kernelMarkdown(): string {
  return `# Kernel

This file is a Node. It defines what a Node is, so it must be one, and it is the first. It is \`${KERNEL_PATH}\`.

## Node

A Node is a Markdown file. Its Markdown carries its meaning. A Node that points to other Nodes declares those Edge occurrences in YAML frontmatter under \`edges\`. A Node with none needs no frontmatter, as this one has none.

A Node is referred to by its path relative to the \`.kaal\` directory.

## Edge

An Edge occurrence has two parts:

- \`edge\`: a reference to the Node that defines what this Edge means.
- \`to\`: a list of references to the Nodes the Edge points to.

An occurrence does not define its own meaning. The Node it names does, and that Node is an ordinary Node.

## Immutability

Once born, a Node never changes. A new Node declares its own outgoing Edges, pointing at Nodes that already exist. Nothing is edited to record that it was pointed at. To change a meaning, birth a new Node.
`;
}

/** The Kernel payload as files, keyed by path relative to `.kaal`. */
export function payload(): Record<string, string> {
  return { [KERNEL_PATH]: kernelMarkdown() };
}
