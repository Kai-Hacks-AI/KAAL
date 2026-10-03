/** Path of the Kernel, relative to the KAAL directory it belongs in. */
export const KERNEL_PATH = "core/KERNEL.md";

/**
 * The Kernel: the first Node. TypeScript here is its only authority; the
 * Markdown is produced, never maintained by hand.
 */
export function kernelMarkdown(): string {
  return `# Kernel

This file is a Node. It defines what a Node is, so it must be one, and it is the first. It is \`${KERNEL_PATH}\`.

## Node

A Node is a unit of meaning. It may point to other Nodes through Edges. Every Node has the same form, this one included.

## Immutability

Once born, a Node never changes. A new Node declares its own outgoing Edges, pointing at Nodes that already exist. Nothing is edited to record that it was pointed at. To change a meaning, birth a new Node.

## Form

A Node is a Markdown file. Its Markdown carries its meaning.

Edge occurrences are declared in YAML frontmatter under \`edges\`. A Node with none needs no frontmatter, as this one has none. Each occurrence is a mapping with two keys: \`edge\`, a reference to the Node that defines what the Edge means, and \`to\`, a list of references to the Nodes the Edge points to.

A Node is referred to by its path relative to the KAAL directory, the directory that holds \`core/\`.

## Edge

An Edge occurrence in a Node has two parts: the Node that defines what the Edge means, and the Nodes it points to.

An occurrence does not define its own meaning. The Node it names does, and that Node is an ordinary Node.
`;
}

/** The Kernel payload as files, keyed by path relative to the KAAL directory. */
export function payload(): Record<string, string> {
  return { [KERNEL_PATH]: kernelMarkdown() };
}
