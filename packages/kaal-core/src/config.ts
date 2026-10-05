// Core's PRIVATE configuration: the schema and defaults of `core/config`, and
// the checker that judges an installed KAAL against the config it carries. The
// file belongs to the KAAL instance: this package only supplies its default
// text, and the checker reads the target instance, never this package. Nothing
// here is public API, and nothing here changes an instance: it observes and
// reports. Reached by engineering's `check-kaal-config` in the built package.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** Where the instance carries its Core configuration, relative to the KAAL directory. */
export const CONFIG_PATH = "core/config";

/**
 * The schema: every setting Core knows, with its default and what a valid value
 * is. A delivery name is `<prefix><capability>`, so a prefix ends in a hyphen
 * and the whole name stays within the capability grammar.
 */
const SCHEMA: Record<string, { default: string; valid: RegExp; says: string }> = {
  "capability-prefix": {
    default: "kaal-",
    valid: /^[a-z0-9]+(-[a-z0-9]+)*-$/,
    says: "lowercase letters, digits and hyphens, ending in a hyphen",
  },
};

export interface Parsed {
  /** The values the file sets, uncommented. */
  values: Record<string, string>;
  problems: string[];
}

/** Parse a config file strictly: blank lines, `#` comments and `key = value` only; nothing is ignored. */
export function parseConfig(text: string): Parsed {
  const values: Record<string, string> = {};
  const problems: string[] = [];
  text.split(/\r?\n/).forEach((line, i) => {
    if (line.trim() === "" || line.startsWith("#")) return;
    const at = `${CONFIG_PATH}:${i + 1}`;
    const set = /^([a-z][a-z-]*) = (.*)$/.exec(line);
    if (!set) return void problems.push(`${at}: not a comment or a "key = value" line`);
    const [, key, value] = set;
    const schema = SCHEMA[key];
    if (!schema) problems.push(`${at}: ${key} is not a Core setting`);
    else if (key in values) problems.push(`${at}: ${key} is set more than once`);
    else if (!schema.valid.test(value)) problems.push(`${at}: ${key} must be ${schema.says}, not "${value}"`);
    else values[key] = value;
  });
  return { values, problems };
}

/**
 * The problems with an installed KAAL against the Core config it carries; empty
 * means it conforms. A missing file means every default applies. Only the
 * instance's own `core/config` is read. The one conformance rule today:
 * every capability delivery directory, `skills/<name>/`, starts with the
 * effective `capability-prefix` and has a capability after it. This is
 * structural; it does not derive what a name should be. A delivery name is not
 * part of any Node's identity, so conformance here says nothing of Node bytes.
 */
export function checkConfig(kaal: string): string[] {
  const file = join(kaal, CONFIG_PATH);
  const { values, problems } = parseConfig(existsSync(file) ? readFileSync(file, "utf8") : "");
  if (problems.length > 0) return problems;
  const prefix = values["capability-prefix"] ?? SCHEMA["capability-prefix"].default;
  const where = "capability-prefix" in values ? CONFIG_PATH : "Core default";
  const skills = join(kaal, "skills");
  const dirs = existsSync(skills) ? readdirSync(skills, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort() : [];
  return dirs
    .filter((name) => !(name.startsWith(prefix) && name.length > prefix.length))
    .map((name) => `skills/${name} is not a conformant delivery name: it must start with the capability-prefix "${prefix}" (${where}) and name a capability after it`);
}
