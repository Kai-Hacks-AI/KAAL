/** Path of the Kernel, relative to the KAAL directory it belongs in. */
export const KERNEL_PATH = "core/KERNEL.md";

/**
 * The Kernel: genesis, not a Node. TypeScript here is its only authority; the
 * Markdown is produced, never maintained by hand.
 */
export function kernelMarkdown(): string {
  return `# Kernel

This file is the genesis of KAAL. It is not a Node. It is the minimum needed to bring the first Nodes into being, in this order, and it fixes no schema a Node may not later outgrow.

## Node

Node 1 is \`Node\`, handcrafted. A Node is a unit of meaning in one Markdown file. It knows nothing of where it is stored.

## Immutability

Seal Node 1. To seal a Node is to take the SHA-256 of its exact bytes: that hash is the Node's ID. A sealed Node never changes; to change a meaning, birth a new Node.

## Form

Form is how the next Node is handcrafted: one Markdown file, a level-1 heading that names it, no mention of its own location or ID, and references to other Nodes by ID only. Later Nodes may supersede this Form; the Kernel does not.

## Edge

Node 2 is \`Edge\`, handcrafted through Form, then sealed. With both sealed, the bootstrap is complete.
`;
}
