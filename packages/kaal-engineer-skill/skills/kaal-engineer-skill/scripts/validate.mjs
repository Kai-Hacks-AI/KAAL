// The validation of an Agent Skill, the agent-facing form of a KAAL Skill,
// from a host-independent representation of its contents: the skill's
// directory name and its files, keyed by "/"-separated relative path. It
// imports nothing and touches no host: obtaining those contents, resolving
// paths and links, and host portability are not its concern.
//
// Every finding is one of three kinds:
//
//   standard     a violation of the Agent Skills standard
//                (https://agentskills.io/specification)
//   kaal         a violation of a KAAL Skill engineering rule beyond the
//                standard: every relative file reference in SKILL.md names a
//                file the skill carries, so it works wherever a host puts it
//   unsupported  frontmatter this validator cannot read; it may be valid
//                YAML, and conformance is left undecided rather than guessed

/** The Agent Skills name grammar. */
const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const FIELDS = ["name", "description", "license", "compatibility", "metadata", "allowed-tools"];
/** A value already reported; the field rules skip it. */
const UNREADABLE = Symbol("unreadable");

/**
 * Validate an Agent Skill. `name` is the name of the skill's directory, and
 * `files` its contents, bytes or text keyed by "/"-separated relative path.
 * Returns `{ standard, kaal, unsupported, warnings }`, each a list of
 * one-line messages; all empty but warnings means the skill conforms.
 */
export function checkSkill(name, files) {
  const found = { standard: [], kaal: [], unsupported: [], warnings: [] };
  if (!Object.hasOwn(files, "SKILL.md")) return { ...found, standard: ["SKILL.md is missing"] };
  const raw = files["SKILL.md"];
  const text = (typeof raw === "string" ? raw : new TextDecoder().decode(raw)).replace(/\r\n/g, "\n");
  const match = /^---\n([\s\S]*?\n)?---(\n|$)/.exec(text);
  if (!match) return { ...found, standard: ["SKILL.md does not begin with YAML frontmatter between --- lines"] };
  const fields = parseFrontmatter(match[1] ?? "", found);
  const body = text.slice(match[0].length);
  const { standard } = found;

  for (const key of Object.keys(fields)) if (!FIELDS.includes(key)) standard.push(`frontmatter field ${key} is not in the standard (allowed: ${FIELDS.join(", ")})`);
  const { description, compatibility, metadata, license } = fields;
  const declared = fields.name;
  const allowedTools = fields["allowed-tools"];
  const readable = (value) => value !== undefined && value !== UNREADABLE;

  if (declared === undefined) standard.push("name is required");
  if (description === undefined) standard.push("description is required");
  if (readable(declared)) {
    if (typeof declared !== "string" || !NAME.test(declared) || length(declared) > 64) standard.push(`name ${show(declared)} is not 1-64 lowercase letters, digits and single hyphens, without a leading or trailing hyphen`);
    else if (declared !== name) standard.push(`name ${declared} does not match its parent directory name ${name}`);
  }
  if (readable(description) && (typeof description !== "string" || length(description) === 0 || length(description) > 1024)) standard.push("description is not a string of 1-1024 characters");
  if (readable(compatibility) && (typeof compatibility !== "string" || length(compatibility) === 0 || length(compatibility) > 500)) standard.push("compatibility is not a string of 1-500 characters");
  if (readable(license) && (typeof license !== "string" || license.length === 0)) standard.push("license is not a non-empty string");
  if (readable(allowedTools) && (typeof allowedTools !== "string" || allowedTools.length === 0)) standard.push("allowed-tools is not a non-empty space-separated string");
  if (readable(metadata) && (typeof metadata !== "object" || metadata === null)) standard.push("metadata is not a map from string keys to string values");

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

/**
 * Read frontmatter in a plain subset of YAML: `key: value` lines, and one
 * indented level of `key: value` lines under a key with no value (a map).
 * Values are plain, 'single-quoted' or "double-quoted" scalars. What YAML
 * itself refuses, or reads as something other than a string, is a standard
 * finding; what may be valid YAML outside this subset is unsupported.
 */
function parseFrontmatter(source, found) {
  const fields = {};
  let map;
  let indent;
  for (const line of source.split("\n")) {
    if (line.trim() === "" || /^\s*#/.test(line)) continue;
    const nested = /^(\s+)(\S[^:]*?):(?:\s+(.*))?$/.exec(line);
    if (nested && map) {
      if (indent === undefined) indent = nested[1];
      if (nested[1] !== indent) {
        found.unsupported.push(`frontmatter line is outside the plain YAML this checker reads: ${line.trim()}`);
        continue;
      }
      const key = nested[2];
      if (key in map) found.standard.push(`frontmatter key ${key} appears twice, which YAML does not allow`);
      map[key] = scalar(nested[3] ?? "", key, found);
      continue;
    }
    const top = /^([^\s:#][^:]*?):(?:\s+(.*))?$/.exec(line);
    if (!top) {
      found.unsupported.push(`frontmatter line is outside the plain YAML this checker reads: ${line.trim()}`);
      map = undefined;
      continue;
    }
    const key = top[1];
    if (key in fields) found.standard.push(`frontmatter field ${key} appears twice, which YAML does not allow`);
    if ((top[2] ?? "").trim() === "") {
      fields[key] = map = {};
      indent = undefined;
    } else {
      fields[key] = scalar(top[2], key, found);
      map = undefined;
    }
  }
  for (const [key, value] of Object.entries(fields)) if (value !== null && typeof value === "object" && Object.keys(value).length === 0) fields[key] = null;
  return fields;
}

function scalar(raw, key, found) {
  const value = raw.trim();
  if (value.startsWith("'")) {
    if (/^'([^']|'')*'$/.test(value)) return value.slice(1, -1).replace(/''/g, "'");
    found.standard.push(`${key}: the single-quoted value is not closed, which is not valid YAML`);
    return UNREADABLE;
  }
  if (value.startsWith('"')) {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === "string") return parsed;
    } catch {
      // not in the subset read here
    }
    found.unsupported.push(`${key}: this double-quoted value is outside the plain YAML this checker reads`);
    return UNREADABLE;
  }
  if (/^[\[\]{}&*!|>%@`]/.test(value) || /^[-?:](\s|$)/.test(value)) {
    found.unsupported.push(`${key}: ${value.slice(0, 40)} is outside the plain YAML this checker reads`);
    return UNREADABLE;
  }
  if (/:\s|\s#/.test(value)) {
    found.standard.push(`${key}: a plain value containing ": " or " #" is not valid YAML as written; quote it`);
    return UNREADABLE;
  }
  if (/^(~|null|Null|NULL|true|True|TRUE|false|False|FALSE|yes|Yes|YES|no|No|NO|on|On|ON|off|Off|OFF)$/.test(value) || /^[-+]?(\d[\d_]*(\.\d*)?([eE][-+]?\d+)?|\.\d+([eE][-+]?\d+)?|0x[0-9a-fA-F]+|0o[0-7]+|\.inf|\.Inf|\.INF|\.nan|\.NaN|\.NAN)$/.test(value)) {
    found.standard.push(`${key}: ${value} is not a string in YAML; quote it`);
    return UNREADABLE;
  }
  return value;
}

/** Relative file references in the SKILL.md body: Markdown link targets, and paths under scripts/, references/ or assets/. */
function references(body) {
  const found = new Set();
  for (const m of body.matchAll(/\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) {
    const target = m[1].split("#")[0];
    if (target && !/^[a-z][a-z0-9+.-]+:/i.test(target)) found.add(decodeURIComponent(target));
  }
  for (const m of body.matchAll(/(?<=^|[\s`("'])((?:scripts|references|assets)\/[\w.\-/]*\w)/gm)) found.add(m[1]);
  return [...found].sort();
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
  return typeof value === "string" ? value : JSON.stringify(value);
}
