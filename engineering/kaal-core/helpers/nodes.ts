// PROVISIONAL bootstrap tooling. This manages Nodes in a directory tree rather
// than defining or proving the Core substrate, so it lives here, not in src/ or
// the Embedding package. It is a candidate to move to the future
// managing-KAAL-graph Skill, and is not kaal-core API. It reads exactly the
// bootstrap Form's frontmatter and nothing more.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/** A reference to a Node: the id is the identity, the name is checked by resolving it. */
export interface Ref {
  name: string;
  id: string;
}

export interface FoundNode {
  /** SHA-256 of the exact bytes. */
  id: string;
  /** Where this tree happens to store it; not part of the Node. */
  path: string;
  name: string;
  /** Absent only for the genesis Node. */
  type?: Ref;
  markdown: string;
}

/** The bootstrap Form: YAML frontmatter with `name`, and optionally `type` as a `{name, id}` pair. */
export function parseForm(markdown: string): { name: string; type?: Ref } | undefined {
  const frontmatter = /^---\n([\s\S]*?)\n---\n/.exec(markdown)?.[1];
  const name = frontmatter && /^name: (.+)$/m.exec(frontmatter)?.[1];
  if (!frontmatter || !name) return undefined;
  const type = /^type:\n {2}name: (.+)\n {2}id: ([0-9a-f]{64})$/m.exec(frontmatter);
  return type ? { name, type: { name: type[1], id: type[2] } } : { name };
}

/** The Nodes in `dir`: files that declare themselves Nodes by Form. Other files, and `seals/`, are ignored. */
export function readNodes(dir: string): FoundNode[] {
  const found: FoundNode[] = [];
  for (const path of readdirSync(dir, { recursive: true, encoding: "utf8" }).sort()) {
    if (path === "seals" || path.startsWith("seals/") || !statSync(join(dir, path)).isFile()) continue;
    const bytes = readFileSync(join(dir, path));
    const form = parseForm(bytes.toString("utf8"));
    if (form) found.push({ id: createHash("sha256").update(bytes).digest("hex"), path, markdown: bytes.toString("utf8"), ...form });
  }
  return found;
}

/** The Node with this exact ID, whose declared name must be the reference's name. */
export function resolve(nodes: FoundNode[], ref: Ref): FoundNode {
  const node = nodes.find((n) => n.id === ref.id);
  if (!node) throw new Error(`no Node has ID ${ref.id}`);
  if (node.name !== ref.name) throw new Error(`ID ${ref.id} is named ${node.name}, not ${ref.name}`);
  return node;
}
