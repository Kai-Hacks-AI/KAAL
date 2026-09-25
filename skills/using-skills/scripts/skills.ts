import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import YAML from "yaml";

/** The frontmatter fields the Agent Skills standard defines; no other field is allowed. */
const FIELDS = new Set(["name", "description", "license", "compatibility", "metadata", "allowed-tools"]);

/** Length in characters (code points), as the standard counts, not UTF-16 units. */
const chars = (s: string) => [...s].length;

/** tsx, which runs a skill's TypeScript init the way `tsx scripts/init.ts` does. */
const TSX = import.meta.resolve("tsx");

// Letters and digits of any script, as the specification's name rule and its
// reference validator, skills-ref, allow; lowercase is checked separately.
const NAME = /^[\p{L}\p{N}]+(-[\p{L}\p{N}]+)*$/u;

/**
 * A skill's SKILL.md frontmatter, as a YAML document, which keeps each key's
 * YAML type; throws when there is none, it is not valid YAML, or it is not a
 * mapping.
 */
function frontmatter(file: string): YAML.Document {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/.exec(fs.readFileSync(file, "utf8"));
  if (!match) throw new Error("SKILL.md does not start with YAML frontmatter");
  const doc = YAML.parseDocument(match[1]);
  if (doc.errors.length) throw new Error(`SKILL.md frontmatter is not valid YAML (${doc.errors[0].message})`);
  if (!YAML.isMap(doc.contents)) throw new Error("SKILL.md frontmatter is not a mapping");
  return doc;
}

/** Whether a YAML node is a string scalar, as written, not as a JavaScript key would coerce it. */
const isString = (node: unknown) => YAML.isScalar(node) && typeof node.value === "string";

/**
 * Every way the skill at `dir` breaks the Agent Skills standard
 * (https://agentskills.io/specification): its SKILL.md, the frontmatter's
 * required `name` and `description`, the optional fields, and no others.
 */
export function standardErrors(dir: string): string[] {
  const skill = path.basename(dir);
  const file = path.join(dir, "SKILL.md");
  if (!fs.existsSync(file)) return [`${skill}: no SKILL.md`];
  let doc: YAML.Document;
  try {
    doc = frontmatter(file);
  } catch (e) {
    return [`${skill}: ${e instanceof Error ? e.message : String(e)}`];
  }
  const fields = doc.toJS() as Record<string, unknown>;
  const errors: string[] = [];
  const { name, description, license, compatibility, metadata } = fields;
  if (typeof name !== "string" || !name) errors.push("name is required");
  else {
    // Compared as skills-ref does: NFKC, so a name and its directory match however
    // the file system composes them, and counted in characters, not UTF-16 units.
    const normalized = name.normalize("NFKC");
    if (chars(normalized) > 64) errors.push("name is longer than 64 characters");
    if (!NAME.test(normalized) || normalized !== normalized.toLowerCase())
      errors.push("name must be lowercase letters, digits and single hyphens, not starting or ending with a hyphen");
    if (normalized !== skill.normalize("NFKC"))
      errors.push(`name ${JSON.stringify(name)} does not match the skill's directory`);
  }
  if (typeof description !== "string" || !description.trim()) errors.push("description is required");
  else if (chars(description) > 1024) errors.push("description is longer than 1024 characters");
  if (
    compatibility !== undefined &&
    (typeof compatibility !== "string" || !compatibility || chars(compatibility) > 500)
  )
    errors.push("compatibility must be 1 to 500 characters");
  if (license !== undefined && typeof license !== "string") errors.push("license must be a string");
  const meta = doc.get("metadata", true);
  if (
    metadata !== undefined &&
    !(YAML.isMap(meta) && meta.items.every((pair) => isString(pair.key) && isString(pair.value)))
  )
    errors.push("metadata must map strings to strings");
  if (fields["allowed-tools"] !== undefined && typeof fields["allowed-tools"] !== "string")
    errors.push("allowed-tools must be a string");
  for (const field of Object.keys(fields).filter((f) => !FIELDS.has(f)))
    errors.push(`${JSON.stringify(field)} is not a field of the standard`);
  return errors.map((error) => `${skill}: ${error}`);
}

/**
 * Whether the skill at `dir` is born from its own init: running its
 * `scripts/init.ts` writes SKILL.md next to the scripts, exactly as committed.
 * Init runs in a scratch copy of the skill without its SKILL.md, never over
 * the skill, so init must be self-contained, and must finish within
 * `timeout` milliseconds.
 */
export function birthErrors(dir: string, timeout = 60_000): string[] {
  const skill = path.basename(dir);
  const committed = path.join(dir, "SKILL.md");
  if (!fs.existsSync(path.join(dir, "scripts", "init.ts")))
    return [`${skill}: no scripts/init.ts; a skill is born from its own init`];
  if (!fs.existsSync(committed)) return [`${skill}: no SKILL.md; run scripts/init.ts`];
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "skill-"));
  try {
    const copy = path.join(scratch, skill);
    fs.cpSync(dir, copy, { recursive: true, filter: (source) => source !== committed });
    const run = spawnSync(process.execPath, ["--import", TSX, path.join(copy, "scripts", "init.ts")], {
      cwd: copy,
      encoding: "utf8",
      timeout,
    });
    if ((run.error as NodeJS.ErrnoException | undefined)?.code === "ETIMEDOUT")
      return [`${skill}: running scripts/init.ts did not finish within ${timeout} ms`];
    if (run.status !== 0)
      return [`${skill}: running scripts/init.ts failed: ${(run.stderr || String(run.error ?? run.signal)).trim()}`];
    const born = path.join(copy, "SKILL.md");
    if (!fs.existsSync(born)) return [`${skill}: running scripts/init.ts does not write SKILL.md`];
    return fs.readFileSync(committed).equals(fs.readFileSync(born))
      ? []
      : [`${skill}: SKILL.md is not what scripts/init.ts generates; change init and run it, never SKILL.md`];
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
}

/** Every error of every skill in `skillsDir`, where each directory is a skill, in name order. */
export function checkSkills(skillsDir: string): string[] {
  return fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
    .flatMap((skill) => [...standardErrors(path.join(skillsDir, skill)), ...birthErrors(path.join(skillsDir, skill))]);
}
