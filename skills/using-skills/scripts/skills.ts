import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import YAML from "yaml";

/** The frontmatter fields the Agent Skills standard defines; no other field is allowed. */
const FIELDS = new Set(["name", "description", "license", "compatibility", "metadata", "allowed-tools"]);

// Letters and digits of any script, as the specification's name rule and its
// reference validator, skills-ref, allow; lowercase is checked separately.
const NAME = /^[\p{L}\p{N}]+(-[\p{L}\p{N}]+)*$/u;

/** A skill's SKILL.md frontmatter, parsed; throws when there is none or it is not a YAML mapping. */
function frontmatter(file: string): Record<string, unknown> {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/.exec(fs.readFileSync(file, "utf8"));
  if (!match) throw new Error("SKILL.md does not start with YAML frontmatter");
  const data: unknown = YAML.parse(match[1]);
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new Error("SKILL.md frontmatter is not a mapping");
  return data as Record<string, unknown>;
}

/**
 * Every way the skill at `dir` breaks the Agent Skills standard
 * (https://agentskills.io/specification): its SKILL.md, the frontmatter's
 * required `name` and `description`, the optional fields, and no others.
 */
export function standardErrors(dir: string): string[] {
  const skill = path.basename(dir);
  const file = path.join(dir, "SKILL.md");
  if (!fs.existsSync(file)) return [`${skill}: no SKILL.md`];
  let fields: Record<string, unknown>;
  try {
    fields = frontmatter(file);
  } catch (e) {
    return [`${skill}: ${e instanceof Error ? e.message : String(e)}`];
  }
  const errors: string[] = [];
  const { name, description, compatibility, metadata } = fields;
  if (typeof name !== "string" || !name) errors.push("name is required");
  else {
    // Compared as skills-ref does: NFKC, so a name and its directory match however
    // the file system composes them, and counted in characters, not UTF-16 units.
    const normalized = name.normalize("NFKC");
    if ([...normalized].length > 64) errors.push("name is longer than 64 characters");
    if (!NAME.test(normalized) || normalized !== normalized.toLowerCase())
      errors.push("name must be lowercase letters, digits and single hyphens, not starting or ending with a hyphen");
    if (normalized !== skill.normalize("NFKC"))
      errors.push(`name ${JSON.stringify(name)} does not match the skill's directory`);
  }
  if (typeof description !== "string" || !description.trim()) errors.push("description is required");
  else if (description.length > 1024) errors.push("description is longer than 1024 characters");
  if (
    compatibility !== undefined &&
    (typeof compatibility !== "string" || !compatibility || compatibility.length > 500)
  )
    errors.push("compatibility must be 1 to 500 characters");
  if (
    metadata !== undefined &&
    (!metadata ||
      typeof metadata !== "object" ||
      Array.isArray(metadata) ||
      Object.values(metadata).some((v) => typeof v !== "string"))
  )
    errors.push("metadata must map strings to strings");
  for (const field of Object.keys(fields).filter((f) => !FIELDS.has(f)))
    errors.push(`${JSON.stringify(field)} is not a field of the standard`);
  return errors.map((error) => `${skill}: ${error}`);
}

/**
 * Whether the skill at `dir` is born from its own init: its `scripts/init.ts`
 * exports `init(target)`, and the committed SKILL.md is exactly the bytes
 * init generates. Runs init into a scratch file, never over the skill.
 */
export async function birthErrors(dir: string): Promise<string[]> {
  const skill = path.basename(dir);
  const script = path.join(dir, "scripts", "init.ts");
  if (!fs.existsSync(script)) return [`${skill}: no scripts/init.ts; a skill is born from its own init`];
  const { init } = (await import(pathToFileURL(script).href)) as { init?: unknown };
  if (typeof init !== "function") return [`${skill}: scripts/init.ts does not export init(target)`];
  const target = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "skill-")), "SKILL.md");
  try {
    init(target);
    const committed = path.join(dir, "SKILL.md");
    if (!fs.existsSync(committed)) return [`${skill}: no SKILL.md; run scripts/init.ts`];
    return fs.readFileSync(committed).equals(fs.readFileSync(target))
      ? []
      : [`${skill}: SKILL.md is not what scripts/init.ts generates; change init and run it, never SKILL.md`];
  } finally {
    fs.rmSync(path.dirname(target), { recursive: true, force: true });
  }
}

/** Every error of every skill in `skillsDir`, where each directory is a skill, in name order. */
export async function checkSkills(skillsDir: string): Promise<string[]> {
  const errors: string[] = [];
  const skills = fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
  for (const skill of skills) {
    const dir = path.join(skillsDir, skill);
    errors.push(...standardErrors(dir), ...(await birthErrors(dir)));
  }
  return errors;
}
