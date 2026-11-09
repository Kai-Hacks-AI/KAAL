// Which files the Boundary Engine's code detectors do not apply to, and why (engineering/boundary/scope/PLAN.md).
// Applicability is decided by the engine's own rules (parse.mjs): a file kind with a parser is read, any other is not applicable to the
// code detectors. These lists only supply the reason: the global list (Engineering's, scope/not-applicable.md) and a definition's
// local `not-applicable:` list. An entry is an exact file name or extension with a reason; never a glob, a path, a target or a role.
import { readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { frontMatter } from "../parsers/front-matter.mjs";
import { hasParser } from "./parse.mjs";

export const DEFAULT_REASON = "no structural parser for this file kind";
const KEYS = new Set(["name", "extension", "reason"]);
const text = (v) => typeof v === "string" && v.trim() !== "";
const extensionOf = (path) => (path.includes(".") ? path.slice(path.lastIndexOf(".")).toLowerCase() : "");

/** The problems with a list of entries, empty when it is well formed. */
export function listProblems(entries) {
  if (!Array.isArray(entries)) return ["the list is not a list"];
  const out = [];
  const seen = new Set();
  entries.forEach((entry, i) => {
    const at = `entry ${i}`;
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) return out.push(`${at} is not a mapping`);
    for (const key of Object.keys(entry)) if (!KEYS.has(key)) out.push(`${at}: unknown key ${key} (a list names file kinds, never a path, target or role)`);
    if (!text(entry.reason)) out.push(`${at}: a reason is required`);
    if ("name" in entry === "extension" in entry) return out.push(`${at}: exactly one of name or extension`);
    const key = "name" in entry ? "name" : "extension";
    const value = entry[key];
    if (!text(value)) return out.push(`${at}: ${key} must be text`);
    if (/[/\\*?[\]{}]/.test(value)) out.push(`${at}: ${key} is exact: no path, glob or pattern`);
    if (key === "extension" && !value.startsWith(".")) out.push(`${at}: an extension starts with a dot`);
    if (hasParser(key === "name" ? value : `x${value}`)) out.push(`${at}: ${value} has a parser, so a parse failure must show; it cannot be listed`);
    const id = `${key}:${value}`;
    if (seen.has(id)) out.push(`${at}: duplicate ${id}`);
    seen.add(id);
  });
  return out;
}

/** The global list, read once from scope/not-applicable.md. Throws when it is missing or not well formed. */
function loadGlobal() {
  const file = join(dirname(fileURLToPath(import.meta.url)), "scope", "not-applicable.md");
  const parsed = frontMatter(readFileSync(file, "utf8"));
  if (!parsed || parsed.errors.length > 0) throw new Error(`${file}: front matter is not YAML`);
  const entries = parsed.value?.["not-applicable"];
  const found = listProblems(entries);
  if (found.length) throw new Error(`${file}: ${found.join("; ")}`);
  return entries;
}
export const GLOBAL_LIST = loadGlobal();

/** A function from a file path to its reason: a local entry wins over a global one, and the default is the last. */
export function reasonFor(global, local) {
  const table = new Map();
  for (const entry of [...global, ...local]) table.set("name" in entry ? `name:${entry.name}` : `extension:${entry.extension.toLowerCase()}`, entry.reason);
  return (path) => table.get(`name:${basename(path)}`) ?? table.get(`extension:${extensionOf(path)}`) ?? DEFAULT_REASON;
}
