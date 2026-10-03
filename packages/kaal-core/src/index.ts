import { createHash } from "node:crypto";

export const name = "kaal-core";

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

/** SHA-256 of the Kernel bytes Core produces. `kernel.sha256` holds this value. */
export function kernelSeal(): string {
  return createHash("sha256").update(kernelMarkdown()).digest("hex");
}

/**
 * The bootstrap contract. Returns the ways `markdown` fails to be the Kernel;
 * empty means it is. The one verification that tests, hook and CI all use.
 */
export function verifyKernel(markdown: string): string[] {
  const problems: string[] = [];
  const need = (ok: boolean, problem: string) => ok || problems.push(problem);
  const section = (title: string) =>
    markdown.split(/^## /m).find((s) => s.startsWith(title + "\n")) ?? "";

  need(markdown.endsWith("\n"), "must end with a newline");
  need(!markdown.startsWith("---"), "must have no frontmatter: the Kernel declares no Edge occurrences");
  need(markdown.includes(`\`${KERNEL_PATH}\``), "must name itself by its own path");
  need(markdown.includes("This file is a Node."), "must declare that it is itself a Node");
  need(!markdown.includes("is not a Node"), "must not deny that it is itself a Node");
  const node = section("Node");
  need(node !== "", "must define Node");
  need(node.includes("`edges`") && node.includes("frontmatter"), "Node must say where Edge occurrences are declared");
  need(node.includes("relative to the `.kaal` directory"), "Node must say how Nodes are referred to");
  const edge = section("Edge");
  need(edge !== "", "must define Edge");
  need(edge.includes("`edge`") && edge.includes("`to`"), "Edge must distinguish the defining Node from the targets");
  need(edge.includes("does not define its own meaning"), "Edge occurrence must not define its own meaning");
  const immutability = section("Immutability");
  need(immutability !== "", "must define Immutability");
  need(immutability.includes("never changes"), "Immutability must say a Node never changes");
  return problems;
}
