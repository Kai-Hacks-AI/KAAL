// PROVISIONAL bootstrap tooling. This manages Nodes rather than defining or
// proving the Core substrate, so it lives here, not in the Embedding package.
// It is a candidate to move to the future managing-KAAL-graph Skill, and is
// not kaal-core API. Form, identity and admission are Core's (`admit`,
// `candidates`); only the queries over admitted Nodes live here.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { admit, candidates, type FoundNode, type Ref } from "kaal-core";

export { admit, candidates };
export type { FoundNode, Ref };

type Files = Record<string, string | Uint8Array>;

/** The Nodes in a directory tree. */
export function readNodes(dir: string): FoundNode[] {
  const files: Files = {};
  for (const path of readdirSync(dir, { recursive: true, encoding: "utf8" }).sort()) {
    if (statSync(join(dir, path)).isFile()) files[path] = readFileSync(join(dir, path));
  }
  return admit(files);
}

/** The Node with this exact ID, whose declared name must be the reference's name. */
export function resolve(nodes: FoundNode[], ref: Ref): FoundNode {
  const node = nodes.find((n) => n.id === ref.id);
  if (!node) throw new Error(`no Node has ID ${ref.id}`);
  if (node.name !== ref.name) throw new Error(`ID ${ref.id} is named ${node.name}, not ${ref.name}`);
  return node;
}

/** The Nodes whose type is exactly this reference: Node type is the whole query. */
export function typedBy(nodes: FoundNode[], ref: Ref): FoundNode[] {
  return nodes.filter((n) => n.type?.id === ref.id && n.type.name === ref.name);
}
