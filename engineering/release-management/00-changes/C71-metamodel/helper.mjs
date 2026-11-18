// Shared reading of the metamodel for the Cases of release/C71. Reads files only; nothing is written.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO = fileURLToPath(import.meta.url).split("/engineering/")[0];
export const RM = join(REPO, "engineering/release-management");
// the directory that holds metamodel.md and views/; the Cases of the PLAN are RED because it does not exist yet,
// and evidence.md runs them against drafts/ with KAAL_METAMODEL_DIR
export const DIR = process.env.KAAL_METAMODEL_DIR ? resolve(process.env.KAAL_METAMODEL_DIR) : join(REPO, "engineering", "metamodel");
export const GH = join(REPO, ".github");
export const VIEW_HEADINGS = ["Objects", "Relationships", "Information the template expects", "What the reviewer should be able to verify", "The INFORMED chapter", "Outside this template"];
export const STYLE = { "-->": "normative", "-.->": "observed", "==>": "proposed" };

export const norm = (s) => s.replace(/\s+/g, "");
export const read = (p) => readFileSync(p, "utf8");
export const model = () => {
  const p = join(DIR, "metamodel.md");
  if (!existsSync(p)) throw new Error(`the global metamodel is absent: ${p.replace(REPO + "/", "")}`);
  return read(p);
};
export const mermaid = (text) => [...text.matchAll(/```mermaid\n([\s\S]*?)```/g)].map((m) => m[1]);
export const edges = (block) => [...block.matchAll(/^\s*(\w+)(?:\["[^"]*"\])?\s+(-->|-\.->|==>)\|([^|]+)\|\s*(\w+)(?:\["[^"]*"\])?\s*$/gm)].map((m) => ({ from: m[1], style: m[2], label: m[3].trim(), to: m[4] }));
export const key = (e) => `${e.from} ${e.label} ${e.to} ${e.style}`;
export const section = (text, name) => {
  const m = text.match(new RegExp(`^## ${name}\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"));
  return m ? m[1] : null;
};
export const rows = (sec) => (sec ?? "").split("\n").filter((l) => l.startsWith("|")).slice(2).map((l) => l.split("|").slice(1, -1).map((c) => c.trim()));
export const objects = (text) => rows(section(text, "Objects")).map(([name, identity, status, by]) => ({ name, identity, status, by }));
export const relationships = (text) => rows(section(text, "Relationships")).map(([label, fromto, keyName, status, source]) => {
  const [from, tos] = fromto.split("→").map((s) => s.trim());
  return { label, from, tos: tos.split(",").map((s) => s.trim()), key: keyName, status, source };
});
export const templates = () => {
  const out = [{ name: "default", path: ".github/pull_request_template.md" }];
  for (const f of readdirSync(join(GH, "PULL_REQUEST_TEMPLATE")).filter((f) => f.endsWith(".md")).sort()) out.push({ name: f.replace(/\.md$/, ""), path: `.github/PULL_REQUEST_TEMPLATE/${f}` });
  return out;
};
export const viewPath = (n) => join(DIR, "views", `${n}.md`);
export const backticked = (text) => [...text.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
export const frontmatter = (text) => {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  const out = {};
  if (m) for (const l of m[1].split("\n")) { const x = l.match(/^([a-z_]+):\s*(.*)$/); if (x) out[x[1]] = x[2].startsWith("[") ? x[2].slice(1, -1).split(",").map((s) => s.trim()).filter(Boolean) : x[2]; }
  return out;
};
export const walk = (dir, out = []) => { for (const e of readdirSync(dir, { withFileTypes: true })) { const p = join(dir, e.name); if (e.isDirectory()) { if (e.name !== "node_modules") walk(p, out); } else out.push(p); } return out; };
