// PROVISIONAL bootstrap tooling. This manages Nodes rather than defining or
// proving the Core substrate, so it lives here, not in the Embedding package.
// It is a candidate to move to the future managing-KAAL-graph Skill, and is
// not kaal-core API. It reads exactly the bootstrap Form's frontmatter.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { sha256 } from "./seal.js";

/** A reference to a Node: the id is the identity, the name is checked by resolving it. */
export interface Ref {
  name: string;
  id: string;
}

export interface FoundNode {
  /** SHA-256 of the exact bytes. */
  id: string;
  /** Where the files happen to store it; not part of the Node. */
  path: string;
  name: string;
  /** Absent only for the genesis Node. */
  type?: Ref;
  markdown: string;
}

type Files = Record<string, string | Uint8Array>;

/** The bootstrap Form, exactly: frontmatter of `name`, then optionally `type` as a `{name, id}` pair. Nothing else is a Form. */
const FORM = /^---\nname: (.+)\n(?:type:\n {2}name: (.+)\n {2}id: ([0-9a-f]{64})\n)?---\n/;

/** The files that declare themselves Nodes by Form. Sealed or not, admitted or not: only candidates. */
export function candidates(files: Files): FoundNode[] {
  const found: FoundNode[] = [];
  for (const [path, bytes] of Object.entries(files)) {
    if (path.startsWith("seals/")) continue;
    const markdown = Buffer.from(bytes).toString("utf8");
    const form = FORM.exec(markdown);
    if (!form) continue;
    const [, name, typeName, typeId] = form;
    found.push({ id: sha256(bytes), path, name, ...(typeName ? { type: { name: typeName, id: typeId } } : {}), markdown });
  }
  return found;
}

/**
 * The Nodes in `files` (path to bytes; the `seals/<ID>` markers are the seals).
 * Form declares candidates. Admission requires the candidate's own exact ID to
 * be sealed. A candidate with no `type` then starts the type chain; every other
 * Node's `type` must also resolve, by ID with the name checked, to a Node
 * already admitted.
 */
export function admit(files: Files): FoundNode[] {
  const sealed = new Set(Object.keys(files).filter((p) => p.startsWith("seals/")).map((p) => p.slice("seals/".length)));
  const rest = candidates(files).filter((n) => sealed.has(n.id));
  const admitted = rest.filter((n) => !n.type);
  for (let grew = true; grew; ) {
    grew = false;
    for (const n of rest) {
      const type = n.type;
      if (type && !admitted.includes(n) && admitted.some((a) => a.id === type.id && a.name === type.name)) (admitted.push(n), (grew = true));
    }
  }
  return rest.filter((n) => admitted.includes(n));
}

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
