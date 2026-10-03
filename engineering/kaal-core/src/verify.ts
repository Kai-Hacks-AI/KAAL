import { KERNEL_PATH } from "./kernel.js";

/**
 * Inner (birth) verification, not the semantic authority: the ways `markdown`
 * fails to be the Kernel it was written to be; empty means none. The sealed
 * Kernel itself is the authority, consumed by the outer loop in `acceptance/`.
 */
export function verifyKernel(markdown: string): string[] {
  const problems: string[] = [];
  const need = (ok: boolean, problem: string) => ok || problems.push(problem);
  const section = (title: string) =>
    markdown.split(/^## /m).find((s) => s.startsWith(title + "\n")) ?? "";

  need(!markdown.startsWith("---"), "must have no frontmatter: the Kernel declares no Edge occurrences");
  need(markdown.includes(`\`${KERNEL_PATH}\``), "must name itself by its own path");
  need(markdown.includes("This file is a Node."), "must declare that it is itself a Node");
  need(!markdown.includes("is not a Node"), "must not deny that it is itself a Node");
  need(!markdown.includes(".kaal"), "must not freeze the default directory name into the semantics");
  need(section("Node").includes("unit of meaning"), "Node must say what a Node is");
  const immutability = section("Immutability");
  need(immutability.includes("never changes"), "Immutability must say a Node never changes");
  const form = section("Form");
  need(form.includes("`edges`") && form.includes("frontmatter"), "Form must say where Edge occurrences are declared");
  need(form.includes("`edge`") && form.includes("`to`"), "Form must say how an occurrence names its defining Node and its targets");
  need(form.includes("relative to the KAAL directory"), "Form must say how Nodes are referred to");
  const edge = section("Edge");
  need(edge.includes("defines what the Edge means") && edge.includes("points to"), "Edge must distinguish the defining Node from the targets");
  need(edge.includes("does not define its own meaning"), "Edge occurrence must not define its own meaning");
  return problems;
}
