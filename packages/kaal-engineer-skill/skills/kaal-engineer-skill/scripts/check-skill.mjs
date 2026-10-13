#!/usr/bin/env node
// check-skill <skill-dir>
// check-skill --package <package-dir> [--engine <dir>]
//
// The first form checks one Agent Skill directory against the rules of the
// Agent Skills standard (https://agentskills.io/specification) that bytes can
// decide, plus one delivery rule: every relative file reference in SKILL.md
// resolves inside the skill directory, so it still works wherever a host puts
// it. The second form checks a KAAL Skill package as npm would ship it: one
// name for package, capability and Agent Skill; the Agent Skill and the KAAL
// contribution both shipped; the shipped Agent Skill conformant; and the
// shipped contribution registered through kaal-core into a throwaway Engine,
// so Core alone decides whether it is a valid Skill.
//
// Exits 0 when everything holds, 1 with one line per problem, 2 on misuse.
// Warnings go to stderr and do not fail. It repairs nothing and writes
// nothing outside a temporary directory it removes. Needs Node.js 20.1 or
// later; --package also needs npm, and kaal-core resolvable from the package
// or from this script.
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/** The Agent Skills name grammar; it is also kaal-core's capability grammar. */
const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const FIELDS = ["name", "description", "license", "compatibility", "metadata", "allowed-tools"];
/** A value already reported as unreadable; the field rules skip it. */
const UNREADABLE = Symbol("unreadable");

/**
 * Check an Agent Skill directory. Returns `{ problems, warnings }`, each a
 * list of one-line messages; no problems means conformant.
 */
export function checkSkill(dir) {
  const problems = [];
  const warnings = [];
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return { problems: [`${dir} is not a directory`], warnings };
  if (!readdirSync(dir).includes("SKILL.md") || !statSync(join(dir, "SKILL.md")).isFile()) return { problems: ["SKILL.md is missing"], warnings };
  const text = readFileSync(join(dir, "SKILL.md"), "utf8").replace(/\r\n/g, "\n");
  const match = /^---\n([\s\S]*?\n)?---(\n|$)/.exec(text);
  if (!match) return { problems: ["SKILL.md does not begin with YAML frontmatter between --- lines"], warnings };
  const fields = parseFrontmatter(match[1] ?? "", problems);
  const body = text.slice(match[0].length);

  for (const key of Object.keys(fields)) if (!FIELDS.includes(key)) problems.push(`frontmatter field ${key} is not in the Agent Skills standard (allowed: ${FIELDS.join(", ")})`);
  const { name, description, compatibility, metadata, license } = fields;
  const allowedTools = fields["allowed-tools"];
  const dirName = basename(resolve(dir));

  const readable = (value) => value !== undefined && value !== UNREADABLE;
  if (name === undefined) problems.push("name is required");
  if (description === undefined) problems.push("description is required");

  if (readable(name)) {
    if (typeof name !== "string" || !NAME.test(name) || length(name) > 64) problems.push(`name ${show(name)} is not 1-64 lowercase letters, digits and single hyphens, without a leading or trailing hyphen`);
    else if (name !== dirName) problems.push(`name ${name} does not match its directory name ${dirName}`);
  }
  if (readable(description) && (typeof description !== "string" || length(description) === 0 || length(description) > 1024)) problems.push("description is not a string of 1-1024 characters");
  if (readable(compatibility) && (typeof compatibility !== "string" || length(compatibility) === 0 || length(compatibility) > 500)) problems.push("compatibility is not a string of 1-500 characters");
  if (readable(license) && (typeof license !== "string" || license.length === 0)) problems.push("license is not a non-empty string");
  if (readable(allowedTools) && (typeof allowedTools !== "string" || allowedTools.length === 0)) problems.push("allowed-tools is not a non-empty space-separated string");
  if (readable(metadata) && (typeof metadata !== "object" || metadata === null)) problems.push("metadata is not a map from string keys to string values");

  const lines = text.split("\n").length - (text.endsWith("\n") ? 1 : 0);
  if (lines >= 500) warnings.push(`SKILL.md has ${lines} lines; the standard recommends under 500, with detail moved to references/`);

  for (const ref of references(body)) {
    const target = resolve(dir, ref);
    const inside = relative(resolve(dir), target);
    if (isAbsolute(ref) || inside === "" || inside.startsWith("..") || isAbsolute(inside)) problems.push(`SKILL.md references ${ref}, which is not inside the skill directory`);
    else if (!existsSync(target)) problems.push(`SKILL.md references ${ref}, which does not exist in the skill directory`);
    else if (outside(dir, target)) problems.push(`SKILL.md references ${ref}, which resolves outside the skill directory through a link`);
  }
  return { problems, warnings };
}

/**
 * Check a KAAL Skill package as npm would ship it. `options.engine` names an
 * existing Engine to register against (a throwaway copy of it); without it, a
 * fresh Engine is bootstrapped from kaal-core's payload.
 */
export async function checkPackage(dir, options = {}) {
  const problems = [];
  const warnings = [];
  const manifest = join(dir, "package.json");
  if (!existsSync(manifest)) return { problems: [`${dir} has no package.json`], warnings };
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(manifest, "utf8"));
  } catch (e) {
    return { problems: [`package.json is not JSON: ${e.message}`], warnings };
  }
  const name = pkg.name;
  if (typeof name !== "string" || !NAME.test(name) || name.length > 64) return { problems: [`package name ${show(name)} is not a capability name: 1-64 lowercase letters, digits and single hyphens, unscoped`], warnings };

  let shipped;
  try {
    const out = execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    shipped = JSON.parse(out)[0].files.map((f) => f.path.split("\\").join("/"));
  } catch (e) {
    return { problems: [`npm could not list what the package ships: ${(e.stderr || e.message).trim().split("\n")[0]}`], warnings };
  }

  const scratch = mkdtempSync(join(tmpdir(), "kaal-check-"));
  try {
    const staged = join(scratch, "package");
    for (const path of shipped) {
      mkdirSync(dirname(join(staged, path)), { recursive: true });
      cpSync(join(dir, path), join(staged, path));
    }

    const skills = existsSync(join(staged, "skills")) ? readdirSync(join(staged, "skills")).sort() : [];
    if (skills.length === 0) problems.push(`the package does not ship its Agent Skill, skills/${name}/SKILL.md`);
    else if (skills.length !== 1 || skills[0] !== name) problems.push(`the package ships exactly one Agent Skill, skills/${name}/ (shipped: ${skills.map((s) => `skills/${s}`).join(", ")})`);
    if (existsSync(join(staged, "skills", name))) {
      const skill = checkSkill(join(staged, "skills", name));
      problems.push(...skill.problems.map((p) => `skills/${name}: ${p}`));
      warnings.push(...skill.warnings.map((w) => `skills/${name}: ${w}`));
    }

    const payload = join(staged, "payload");
    const nodes = existsSync(payload) ? readdirSync(payload, { recursive: true, encoding: "utf8" }).filter((p) => statSync(join(payload, p)).isFile()) : [];
    if (nodes.length === 0) problems.push("the package does not ship its KAAL contribution: Nodes in payload/");
    else problems.push(...(await registers(payload, name, dir, options.engine)));
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
  return { problems, warnings };
}

/** Register the shipped contribution through kaal-core into a throwaway Engine; returns problems. */
async function registers(payload, capability, packageDir, engine) {
  const core = await loadCore(packageDir);
  if (!core) return ["kaal-core is not installed beside the package or this script: registration is kaal-core's to decide"];
  const scratch = mkdtempSync(join(tmpdir(), "kaal-register-"));
  try {
    const target = join(scratch, "engine");
    if (engine) {
      if (!existsSync(engine) || !statSync(engine).isDirectory()) return [`--engine ${engine} is not a directory`];
      cpSync(engine, target, { recursive: true });
    } else core.bootstrap(target);
    core.registerSkill(target, capability, core.readContribution(payload));
    return [];
  } catch (e) {
    return [`kaal-core refuses the contribution in payload/: ${e.message}`];
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

async function loadCore(packageDir) {
  for (const from of [join(resolve(packageDir), "package.json"), fileURLToPath(import.meta.url)]) {
    try {
      return await import(pathToFileURL(createRequire(from).resolve("kaal-core")).href);
    } catch {
      // not resolvable from here; try the next place
    }
  }
  return undefined;
}

/**
 * Parse frontmatter in a plain subset of YAML: `key: value` lines, and one
 * indented level of `key: value` lines under a key with no value (a map).
 * Values are plain, 'single-quoted' or "double-quoted" scalars. Anything
 * else is reported as a problem rather than guessed at. A plain value YAML
 * would read as a number, boolean or null is not a string, and is reported.
 */
function parseFrontmatter(source, problems) {
  const fields = {};
  let map;
  let indent;
  for (const line of source.split("\n")) {
    if (line.trim() === "" || /^\s*#/.test(line)) continue;
    const nested = /^(\s+)(\S[^:]*?):(?:\s+(.*))?$/.exec(line);
    if (nested && map) {
      if (indent === undefined) indent = nested[1];
      if (nested[1] !== indent) {
        problems.push(`frontmatter line is not understood: ${line.trim()}`);
        continue;
      }
      const key = unquote(nested[2], problems);
      if (key in map) problems.push(`frontmatter key ${key} appears twice`);
      map[key] = scalar(nested[3] ?? "", key, problems);
      continue;
    }
    const top = /^([^\s:#][^:]*?):(?:\s+(.*))?$/.exec(line);
    if (!top) {
      problems.push(`frontmatter line is not understood: ${line.trim()}`);
      map = undefined;
      continue;
    }
    const key = top[1];
    if (key in fields) problems.push(`frontmatter field ${key} appears twice`);
    if ((top[2] ?? "").trim() === "") {
      fields[key] = map = {};
      indent = undefined;
    } else {
      fields[key] = scalar(top[2], key, problems);
      map = undefined;
    }
  }
  for (const [key, value] of Object.entries(fields)) if (value !== null && typeof value === "object" && Object.keys(value).length === 0) fields[key] = null;
  return fields;
}

function scalar(raw, key, problems) {
  const value = raw.trim();
  if (value.startsWith('"') || value.startsWith("'")) return unquote(value, problems, key);
  if (/^[\[\]{}&*!|>%@`]/.test(value) || /^[-?:](\s|$)/.test(value)) {
    problems.push(`${key}: ${value.slice(0, 40)} is outside the plain YAML this check reads; quote it`);
    return UNREADABLE;
  }
  if (/:\s|\s#/.test(value)) {
    problems.push(`${key}: a plain value containing ": " or " #" is not valid YAML; quote it`);
    return UNREADABLE;
  }
  if (/^(~|null|Null|NULL|true|True|TRUE|false|False|FALSE|yes|Yes|YES|no|No|NO|on|On|ON|off|Off|OFF)$/.test(value) || /^[-+]?(\d[\d_]*(\.\d*)?([eE][-+]?\d+)?|\.\d+([eE][-+]?\d+)?|0x[0-9a-fA-F]+|0o[0-7]+|\.inf|\.Inf|\.INF|\.nan|\.NaN|\.NAN)$/.test(value)) {
    problems.push(`${key}: ${value} is not a string in YAML; quote it`);
    return UNREADABLE;
  }
  return value;
}

function unquote(value, problems, key = value) {
  if (value.startsWith("'")) {
    if (!/^'([^']|'')*'$/.test(value)) {
      problems.push(`${key}: the single-quoted value is not closed`);
      return UNREADABLE;
    }
    return value.slice(1, -1).replace(/''/g, "'");
  }
  if (value.startsWith('"')) {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === "string") return parsed;
    } catch {
      // fall through
    }
    problems.push(`${key}: the double-quoted value is outside the plain YAML this check reads`);
    return UNREADABLE;
  }
  return value;
}

/** Relative file references in the SKILL.md body: Markdown link targets, and paths under scripts/, references/ or assets/. */
function references(body) {
  const found = new Set();
  for (const m of body.matchAll(/\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) {
    const target = m[1].split("#")[0];
    if (target && !/^[a-z][a-z0-9+.-]*:/i.test(target)) found.add(decodeURIComponent(target));
  }
  for (const m of body.matchAll(/(?<=^|[\s`("'])((?:scripts|references|assets)\/[\w.\-/]*\w)/gm)) found.add(m[1]);
  return [...found].sort();
}

/** Whether a path inside the skill resolves, through a link, to somewhere outside it. */
function outside(dir, target) {
  const real = realpathSync(target);
  const root = realpathSync(dir);
  return real !== root && !real.startsWith(root + sep);
}

function length(s) {
  return [...s].length;
}

function show(value) {
  return typeof value === "string" ? value : JSON.stringify(value);
}

const USAGE = "usage: check-skill <skill-dir>\n       check-skill --package <package-dir> [--engine <dir>]";

async function main(argv) {
  let result;
  if (argv[0] === "--package") {
    const [, dir, ...rest] = argv;
    const engine = rest.length === 2 && rest[0] === "--engine" ? rest[1] : undefined;
    if (!dir || dir.startsWith("--") || (rest.length !== 0 && engine === undefined)) {
      console.error(USAGE);
      return 2;
    }
    result = await checkPackage(dir, { engine });
  } else {
    if (argv.length !== 1 || argv[0].startsWith("--")) {
      console.error(USAGE);
      return 2;
    }
    result = checkSkill(argv[0]);
  }
  for (const w of result.warnings) console.error(`warning: ${w}`);
  for (const p of result.problems) console.error(p);
  if (result.problems.length === 0) console.log("ok");
  return result.problems.length === 0 ? 0 : 1;
}

function invoked() {
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (invoked()) process.exitCode = await main(process.argv.slice(2));
