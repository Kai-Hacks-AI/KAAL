// The validation of an Agent Skill, the agent-facing form of a KAAL Skill,
// from a host-independent representation of its contents: the skill's
// directory name and its files, keyed by "/"-separated relative path. It
// touches no host: obtaining those contents, resolving paths and links, and
// host portability are not its concern. YAML and CommonMark are read by
// established parsers, not by this file.
//
// Every finding is one of two kinds:
//
//   standard     a violation of the Agent Skills standard
//                (https://agentskills.io/specification)
//   kaal         a violation of a KAAL Skill engineering rule beyond the
//                standard: every relative file reference in SKILL.md names a
//                file the skill carries, so it works wherever a host puts it
import { Parser } from "commonmark";
import { parseDocument } from "yaml";

/** The Agent Skills name grammar. */
const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const FIELDS = ["name", "description", "license", "compatibility", "metadata", "allowed-tools"];

/**
 * Validate an Agent Skill. `name` is the name of the skill's directory, and
 * `files` its contents, bytes or text keyed by "/"-separated relative path.
 * Returns `{ standard, kaal, warnings }`, each a list of one-line messages;
 * all empty but warnings means the skill conforms.
 */
export function checkSkill(name, files) {
  const found = { standard: [], kaal: [], warnings: [] };
  if (!Object.hasOwn(files, "SKILL.md")) return { ...found, standard: ["SKILL.md is missing"] };
  const raw = files["SKILL.md"];
  const text = (typeof raw === "string" ? raw : new TextDecoder().decode(raw)).replace(/\r\n/g, "\n");
  const match = /^---\n([\s\S]*?\n)?---(\n|$)/.exec(text);
  if (!match) return { ...found, standard: ["SKILL.md does not begin with YAML frontmatter between --- lines"] };
  const body = text.slice(match[0].length);
  const { standard } = found;

  const fields = frontmatter(match[1] ?? "", standard);
  if (fields) {
    for (const key of fields.keys()) if (!FIELDS.includes(key)) standard.push(`frontmatter field ${show(key)} is not in the standard (allowed: ${FIELDS.join(", ")})`);
    const declared = fields.get("name");
    const description = fields.get("description");
    const compatibility = fields.get("compatibility");
    const license = fields.get("license");
    const allowedTools = fields.get("allowed-tools");
    const metadata = fields.get("metadata");

    if (!fields.has("name")) standard.push("name is required");
    else if (typeof declared !== "string" || !NAME.test(declared) || length(declared) > 64) standard.push(`name ${show(declared)} is not 1-64 lowercase letters, digits and single hyphens, without a leading or trailing hyphen`);
    else if (declared !== name) standard.push(`name ${declared} does not match its parent directory name ${name}`);
    if (!fields.has("description")) standard.push("description is required");
    else if (typeof description !== "string" || description.trim() === "" || length(description) > 1024) standard.push("description is not a string of 1-1024 characters");
    if (fields.has("compatibility") && (typeof compatibility !== "string" || compatibility.trim() === "" || length(compatibility) > 500)) standard.push("compatibility is not a string of 1-500 characters");
    if (fields.has("license") && (typeof license !== "string" || license.length === 0)) standard.push("license is not a non-empty string");
    if (fields.has("allowed-tools") && (typeof allowedTools !== "string" || allowedTools.length === 0)) standard.push("allowed-tools is not a non-empty space-separated string");
    if (fields.has("metadata")) {
      if (!(metadata instanceof Map)) standard.push("metadata is not a map from string keys to string values");
      else
        for (const [key, value] of metadata) {
          if (typeof key !== "string") standard.push(`metadata key ${show(key)} is not a string in YAML; quote it`);
          if (typeof value !== "string") standard.push(`metadata ${show(key)}: the value is not a string in YAML; quote it`);
        }
    }
  }

  const lines = text.split("\n").length - (text.endsWith("\n") ? 1 : 0);
  if (lines >= 500) found.warnings.push(`SKILL.md has ${lines} lines; the standard recommends under 500, with detail moved to references/`);

  const paths = Object.keys(files);
  for (const ref of references(body)) {
    const target = within(ref);
    if (target === undefined) found.kaal.push(`SKILL.md references ${ref}, which is not inside the skill directory`);
    else if (!paths.some((p) => p === target || p.startsWith(`${target}/`))) found.kaal.push(`SKILL.md references ${ref}, which the skill does not carry`);
  }
  return found;
}

/** The frontmatter as a Map with YAML's own key and value types, or undefined after reporting why it is not a mapping. */
function frontmatter(source, standard) {
  const doc = parseDocument(source);
  if (doc.errors.length > 0) {
    for (const e of doc.errors) standard.push(`frontmatter is not valid YAML: ${e.message.split("\n")[0].replace(/:$/, "")}`);
    return undefined;
  }
  let value;
  try {
    value = doc.toJS({ mapAsMap: true });
  } catch (e) {
    // yaml bounds alias expansion against resource exhaustion; past that bound the frontmatter is not resolved.
    standard.push(`frontmatter could not be resolved as YAML: ${e.message}`);
    return undefined;
  }
  if (value instanceof Map) return value;
  if (value === null) return new Map();
  standard.push("frontmatter is not a YAML mapping of fields");
  return undefined;
}

/** Relative file references in the SKILL.md body: CommonMark link and image destinations other than URLs (with a scheme, or network-path //host), and paths under scripts/, references/ or assets/ in text and code. */
function references(body) {
  const found = new Set();
  const walker = new Parser().parse(body).walker();
  for (let step = walker.next(); step; step = walker.next()) {
    const { node, entering } = step;
    if (!entering) continue;
    if (node.type === "link" || node.type === "image") {
      const target = node.destination.split("#")[0];
      if (target && !/^[a-z][a-z0-9+.-]+:/i.test(target) && !target.startsWith("//")) found.add(decoded(target));
    } else if (node.literal) {
      for (const m of node.literal.matchAll(/(?<=^|[\s`("'])((?:scripts|references|assets)\/[\w.\-/]*\w)/gm)) found.add(m[1]);
    }
  }
  return [...found].sort();
}

/** A destination as the path it names; CommonMark percent-encodes destinations. */
function decoded(target) {
  try {
    return decodeURIComponent(target);
  } catch {
    return target;
  }
}

/** A relative reference as a path within the skill, or undefined if it is not one. */
function within(ref) {
  if (ref.startsWith("/") || ref.includes("\\") || /^[a-z]:/i.test(ref)) return undefined;
  const out = [];
  for (const segment of ref.split("/")) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") {
      if (out.length === 0) return undefined;
      out.pop();
    } else out.push(segment);
  }
  return out.length === 0 ? undefined : out.join("/");
}

function length(s) {
  return [...s].length;
}

function show(value) {
  return typeof value === "string" ? value : String(value);
}
