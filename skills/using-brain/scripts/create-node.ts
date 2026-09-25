import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { pathToFileURL } from "node:url";
import type { Edge } from "./brain.js";

export type CreateNode = {
  root?: string;
  lineage: string;
  learning: string;
  slug: string;
  name: string;
  meaning: string;
  edges?: Edge[];
};

export function createNode(input: CreateNode): string {
  const root = input.root ?? "brain/learning";
  if (!/^[0-9]{2}\/[0-9]{2}\/[0-9]{2}\/[0-9]{2}$/.test(input.learning)) throw new Error("learning must be YY/MM/DD/CC");
  const dir = path.join(root, input.lineage, input.learning, "nodes");
  const file = path.join(dir, `${input.slug}.md`);
  if (fs.existsSync(file)) throw new Error(`${file}: already exists`);
  fs.mkdirSync(dir, { recursive: true });
  const frontmatter = input.edges?.length ? { name: input.name, edges: input.edges } : { name: input.name };
  fs.writeFileSync(file, `---\n${YAML.stringify(frontmatter).trimEnd()}\n---\n\n${input.meaning.trim()}\n`, { flag: "wx" });
  return file;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.error("create-node.ts is used by using-brain; Genesis uses init.ts to supply the first nodes.");
}
