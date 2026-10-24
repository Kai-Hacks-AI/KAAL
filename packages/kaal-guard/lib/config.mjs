// The configuration: the checks a repository declares, one `<name>.md` each in .kaal/config/guard/, and
// where Guard finds them. Only a declaration's frontmatter is read, as a strict subset of YAML that Guard
// parses itself; the body is the repository's guidance for people and agents and never changes a verdict
// or an order. Anything outside the subset or the Guard/Check schema is refused with the file, the member
// and the rule, never ignored.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import { words } from "./command.mjs";
import { safePath } from "./trusted.mjs";

/** The configuration directory at a repository's top level, by convention. */
export const CONFIG = ".kaal/config/guard";

/** The one Type a declaration names in its `type` member: Guard's own Business Language name. */
export const TYPE = "Guard/Check";

/** The facts an adapter may supply: the name a check declares, its option and its variable. */
export const FACTS = {
  head: { option: "--head", variable: "GUARD_HEAD" },
  base: { option: "--base", variable: "GUARD_BASE" },
  "base-ref": { option: "--base-ref", variable: "GUARD_BASE_REF" },
  changed: { option: "--changed", variable: "GUARD_CHANGED" },
};

/** The exit statuses that have a verdict of their own, so no named outcome may take them. */
const OWN = new Set([0, 1, 2, 3]);

/** Something Guard cannot judge, with the next step. Thrown by readers, caught where a command reports. */
export class Refusal extends Error {
  /** @param {string} why @param {string} todo */
  constructor(why, todo) {
    super(why);
    this.todo = todo;
  }
}

/** A path as a reader of the repository sees it: relative to the root, with forward slashes. */
export const shown = (root, path) => {
  const r = relative(root, path);
  return (r === "" || r.startsWith("..") || isAbsolute(r) ? path : r).split("\\").join("/");
};

/** The edit distance between two words, for naming the member a misspelled one was meant to be. */
function distance(a, b) {
  let row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++) next[j] = Math.min(row[j] + 1, next[j - 1] + 1, row[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    row = next;
  }
  return row[b.length];
}

/** The defined member nearest to an undefined one, when one is near enough to be a misspelling. */
export function nearest(member, defined) {
  const [best] = defined.map((d) => [d, distance(member.toLowerCase(), d.toLowerCase())]).sort((x, y) => x[1] - y[1]);
  return best && best[1] <= Math.max(1, Math.floor(best[0].length / 3)) ? best[0] : undefined;
}

/** The refusal of an undefined member, naming the nearest defined one. */
export function undefinedMember(where, member, defined, what) {
  const near = nearest(member, defined);
  return new Refusal(`${where}: ${member}: not defined for ${what}${near ? `; did you mean ${near}?` : ""}`, `use only ${defined.join(", ")}`);
}

// guard/F1's subset of YAML: `key: value` lines, plain or double-quoted strings, integers, flow lists and
// flow maps of those. A plain word YAML would read as something else (true, null, 1.5, 0x1) is refused,
// so the subset never means what YAML would not.
const INDICATOR = /^[-?:,[\]{}#&*!|>'"%@`]/;
const NOT_A_STRING = /^(?:true|false|yes|no|on|off|y|n|null|~)$|^[-+]?(?:\.?\d|\.(?:inf|nan)$)/i;
const INTEGER = /^-?(?:0|[1-9]\d*)$/;

/** One scalar: { value } or { problem }. */
function scalar(text) {
  if (text.startsWith('"')) {
    if (!/^"(?:[^"\\]|\\.)*"$/.test(text)) return { problem: `${text} is not one double-quoted string` };
    try {
      return { value: JSON.parse(text) };
    } catch {
      return { problem: `${text} holds an escape outside Guard's subset` };
    }
  }
  if (INTEGER.test(text)) return { value: Number(text) };
  if (text === "") return { problem: "the value is empty" };
  if (text.startsWith("'")) return { problem: `${text} is single-quoted; Guard's subset has only plain and double-quoted strings` };
  if (INDICATOR.test(text)) return { problem: `${text} begins with ${text[0]}, which YAML reads as syntax; double-quote it` };
  if (/: |\s#|:$/.test(text)) return { problem: `${text} holds ": " or " #", which YAML reads as syntax; double-quote it` };
  if (NOT_A_STRING.test(text)) return { problem: `${text} is not a string or an integer to YAML; double-quote it for a string` };
  return { value: text };
}

/** The items of a flow collection's inside, split on commas outside double quotes: { items } or { problem }. */
function items(inner) {
  const out = [];
  let item = "";
  let quoted = false;
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (quoted && c === "\\") {
      item += c + (inner[++i] ?? "");
      continue;
    }
    if (c === '"') quoted = !quoted;
    if (!quoted && /[[\]{}]/.test(c)) return { problem: "a flow collection inside another is outside Guard's subset" };
    if (!quoted && c === ",") {
      out.push(item.trim());
      item = "";
    } else item += c;
  }
  if (quoted) return { problem: "a double quote is not closed" };
  if (item.trim() !== "" || out.length) out.push(item.trim());
  if (out.some((x) => x === "")) return { problem: "an item is empty" };
  return { items: out };
}

/** One value: a scalar, `[a, b]` or `{k: v}`. Returns { value } or { problem }. */
function value(text) {
  if (text.startsWith("[") || text.startsWith("{")) {
    const map = text.startsWith("{");
    if (!text.endsWith(map ? "}" : "]")) return { problem: `${text} is not one flow ${map ? "map" : "list"} on its line` };
    const split = items(text.slice(1, -1));
    if (split.problem) return split;
    if (!map) {
      const list = [];
      for (const i of split.items) {
        const s = scalar(i);
        if (s.problem) return s;
        list.push(s.value);
      }
      return { value: list };
    }
    const entries = new Map();
    for (const i of split.items) {
      const m = /^("(?:[^"\\]|\\.)*"|[^:"]+):(?: (.*))?$/.exec(i);
      if (!m || m[2] === undefined) return { problem: `${i} is not a key: value entry` };
      const k = scalar(m[1].trim());
      const v = scalar(m[2].trim());
      if (k.problem || v.problem) return k.problem ? k : v;
      if (entries.has(String(k.value))) return { problem: `${k.value} is a key twice` };
      entries.set(String(k.value), v.value);
    }
    return { value: Object.fromEntries(entries) };
  }
  return scalar(text);
}

/**
 * A declaration's frontmatter as members and values, read with guard/F1's subset. The body after the
 * closing `---` is never read. Throws a Refusal naming `file` and the member at fault.
 */
export function frontmatter(text, file) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const todo = `begin ${file} with a line ---, one key: value line per member, and a closing line ---`;
  if (lines[0] !== "---") throw new Refusal(`${file}: has no frontmatter`, todo);
  const end = lines.indexOf("---", 1);
  if (end < 0) throw new Refusal(`${file}: its frontmatter is not closed`, todo);
  const members = {};
  let last = "frontmatter";
  for (const line of lines.slice(1, end)) {
    if (line.trim() === "") continue;
    if (/^\s/.test(line)) {
      throw new Refusal(`${file}: ${last}: an indented line is block-style YAML, outside Guard's subset`, `write ${last}'s whole value on its own line, such as ${last}: [a, b]`);
    }
    const m = /^([A-Za-z][A-Za-z0-9_-]*):(?: (.*))?$/.exec(line);
    if (!m) {
      const member = /^([^:\s]+)/.exec(line)?.[1] ?? line;
      throw new Refusal(`${file}: ${member}: "${line}" is not a key: value line of Guard's subset`, "write one key: value line per member; comments, anchors and documents are outside the subset");
    }
    const [, key, raw = ""] = m;
    last = key;
    if (key in members) throw new Refusal(`${file}: ${key}: declared twice`, `keep one ${key} line`);
    if (raw.trim() === "") throw new Refusal(`${file}: ${key}: has no value on its line; block-style YAML is outside Guard's subset`, `write ${key}'s whole value on its own line, such as ${key}: [a, b]`);
    const v = value(raw.trim());
    if (v.problem) throw new Refusal(`${file}: ${key}: ${v.problem}`, "write the value as a plain or double-quoted string, an integer, [a, b] or {4: held}");
    members[key] = v.value;
  }
  return members;
}

const kind = (v) => (Array.isArray(v) ? "a list" : v === null ? "null" : typeof v === "object" ? "a map" : typeof v === "number" ? "an integer" : "a string");

/** The schema of Guard/Check: each member's check, which throws a Refusal for a value it does not accept. */
const SCHEMA = {
  type: (v, at) => {
    if (v !== TYPE) throw new Refusal(`${at}: type: is ${JSON.stringify(v)}, not ${TYPE}`, `write type: ${TYPE}, the only Type Guard reads`);
  },
  command: (v, at) => {
    if (typeof v !== "string") throw new Refusal(`${at}: command: is ${kind(v)}, not a string`, 'write the command as one string, such as command: "node checks/unit.mjs"');
    if (!words(v)?.length) throw new Refusal(`${at}: command: names no program, or a quote in it is not closed`, "write a program and its arguments as words");
  },
  runs: (v, at) => {
    if (!Array.isArray(v) || !v.length || !v.every((r) => r === "local" || r === "ci") || new Set(v).size !== v.length) {
      throw new Refusal(`${at}: runs: must be a list of local, ci or both`, "write runs: [local], runs: [ci] or runs: [local, ci]");
    }
  },
  facts: (v, at) => {
    if (!Array.isArray(v) || !v.every((f) => f in FACTS) || new Set(v).size !== v.length) {
      throw new Refusal(`${at}: facts: must be a list of ${Object.keys(FACTS).join(", ")}`, `write facts: [${Object.keys(FACTS).join(", ")}], keeping only those the check needs`);
    }
  },
  trusted: (v, at) => {
    if (!safePath(v)) throw new Refusal(`${at}: trusted: must be a string naming a file or directory inside the repository`, "name the checker's path from the repository root, without ..");
  },
  outcomes: (v, at) => {
    const ok = v && typeof v === "object" && !Array.isArray(v) && Object.entries(v).every(([s, o]) => /^\d+$/.test(s) && Number(s) <= 255 && !OWN.has(Number(s)) && o === "held");
    if (!ok) throw new Refusal(`${at}: outcomes: may only name a further exit status, 4 to 255, as held`, "write outcomes: {4: held}");
  },
};
const REQUIRED = ["type", "command", "runs"];

/** One declaration checked against Guard/Check: the check, as the runner reads it. Throws a Refusal. */
export function check(members, at) {
  for (const member of Object.keys(members)) if (!(member in SCHEMA)) throw undefinedMember(at, member, Object.keys(SCHEMA), TYPE);
  for (const member of REQUIRED) if (!(member in members)) throw new Refusal(`${at}: ${member}: missing; ${TYPE} requires ${REQUIRED.join(", ")}`, `add a ${member} line to the frontmatter`);
  for (const [member, v] of Object.entries(members)) SCHEMA[member](v, at);
  const { type, ...rest } = members;
  return rest;
}

const directory = (path) => existsSync(path) && statSync(path).isDirectory();

/**
 * The configuration directory: `--config <dir>` from the working directory when given, otherwise
 * CONFIG at the repository's top level.
 */
export const configDir = (root, cwd, option) => (option === undefined ? join(root, CONFIG) : resolve(cwd, option));

/**
 * The declared checks, by name in name order: every `.md` file directly in `dir`. Returns { list } with
 * list.checks, or { absent: true } when there is no such directory. Throws a Refusal for any declaration
 * outside the contract.
 */
export function readDeclarations(root, dir) {
  if (!directory(dir)) return { absent: true };
  const names = readdirSync(dir, { withFileTypes: true }).filter((e) => e.isFile() && e.name.endsWith(".md")).map((e) => e.name.slice(0, -3)).sort();
  const checks = {};
  for (const name of names) {
    const at = shown(root, join(dir, `${name}.md`));
    if (!/^[^:\s]+$/.test(name)) throw new Refusal(`${at}: the check's name "${name}" holds a space or a colon`, "rename the file: a check's name has no spaces or colons");
    checks[name] = check(frontmatter(readFileSync(join(dir, `${name}.md`), "utf8"), at), at);
  }
  return { list: { checks } };
}

/** The refusal of a configuration 0.0.1 wrote (guard/F15), when there is one at the top level. */
export function legacy(root) {
  if (!existsSync(join(root, "guard.json"))) return undefined;
  return new Refusal(
    "guard.json is the configuration of kaal-guard 0.0.1, which this version does not read",
    `set Guard up afresh: run kaal-guard remove of 0.0.1 (or delete the hook and workflow it wrote), declare each check of guard.json as ${CONFIG}/<name>.md, delete guard.json, then run kaal-guard init`,
  );
}
