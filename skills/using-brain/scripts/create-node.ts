import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import YAML from "yaml";
import { type Edge, edgeErrors, relativeIdentity, ROOT } from "./brain.js";

export type CreateNode = {
  root?: string;
  lineage: string;
  learning: string;
  slug: string;
  name: string;
  meaning: string;
  edges?: Edge[];
};

function component(v: string, label: string): void {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(v) || v === "." || v === "..") {
    throw new Error(`${label} must be one path component`);
  }
}

export function createNode(input: CreateNode): string {
  const root = input.root ?? ROOT;
  component(input.lineage, "lineage");
  component(input.slug, "slug");
  if (!/^\d{2}\/\d{2}\/\d{2}\/\d{2}$/.test(input.learning)) throw new Error("learning must be YY/MM/DD/CC");
  if (!input.name.trim()) throw new Error("name is required");
  const dir = path.join(root, input.lineage, input.learning, "nodes");
  const file = path.join(dir, `${input.slug}.md`);
  const edges = input.edges ?? [];
  const errors = edgeErrors(root, relativeIdentity(root, file), { lineage: input.lineage, key: input.learning }, edges);
  if (errors.length) throw new Error(errors.join("\n"));
  fs.mkdirSync(dir, { recursive: true });
  const fm = edges.length ? { name: input.name, edges } : { name: input.name };
  // "wx" refuses to overwrite: nodes are immutable.
  fs.writeFileSync(file, `---\n${YAML.stringify(fm).trimEnd()}\n---\n\n${input.meaning.trim()}\n`, { flag: "wx" });
  return file;
}

function parseEdge(value: string): Edge {
  const [relation, to, ...rest] = value.split("=");
  if (!relation || !to || rest.length) throw new Error(`--edge must be <relation>=<target>, got ${value}`);
  return { relation, to };
}

const USAGE = "usage: create-node.ts <lineage> <YY/MM/DD/CC> <slug> <name> <meaning> [--edge <relation>=<target>]...";

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { edge: { type: "string", multiple: true } },
  });
  const [lineage, learning, slug, name, meaning] = positionals;
  if (positionals.length !== 5 || !lineage || !learning || !slug || !name || !meaning) {
    console.error(USAGE);
    process.exitCode = 2;
  } else {
    try {
      createNode({ lineage, learning, slug, name, meaning, edges: (values.edge ?? []).map(parseEdge) });
    } catch (e) {
      console.error(e instanceof Error ? e.message : String(e));
      process.exitCode = 1;
    }
  }
}
