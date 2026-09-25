import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

export const ROOT = "brain/learning";

export type Edge = { relation: string; to: string };
export type Frontmatter = { name: string; edges?: Edge[] };

export function parseNode(file: string): Frontmatter {
  const text = fs.readFileSync(file, "utf8");
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!match) throw new Error(`${file}: missing YAML frontmatter`);
  const data = YAML.parse(match[1]) as Partial<Frontmatter>;
  if (!data.name || typeof data.name !== "string") throw new Error(`${file}: name is required`);
  if (data.edges && !Array.isArray(data.edges)) throw new Error(`${file}: edges must be an array`);
  return data as Frontmatter;
}

export function nodeFiles(root = ROOT): string[] {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith(".md"))
    .map(entry => path.join(entry.parentPath, entry.name))
    .sort();
}

export function learningKey(file: string): string {
  const parts = file.split(path.sep);
  const i = parts.indexOf("learning");
  if (i < 0 || parts.length < i + 7) throw new Error(`${file}: invalid learning path`);
  return parts.slice(i + 2, i + 6).join("/");
}

export function relativeIdentity(file: string): string {
  return path.relative(ROOT, file).split(path.sep).join("/");
}
