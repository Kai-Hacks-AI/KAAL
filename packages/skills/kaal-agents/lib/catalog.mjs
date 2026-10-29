// The only module that names Core's package (agents/A3, agents/N6). Core is reached through the
// consumer's own installation, resolved from the directory being oriented, never from this package,
// and an Engine is never read here except through Core's own `catalog`.
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Core's package names, the Owner-approved scoped name first. The unscoped name is accepted only
 * until Core's own rename lands, because that is the name Core carries today.
 */
export const CORE = ["@kaihacksai/kaal-core", "kaal-core"];

/** Where KAAL's own source marks a repository as engineered, relative to it. */
export const SOURCE = "packages/kaal-core/package.json";

/** Whether `dir` carries KAAL's own source: Core's package.json under one of Core's names. */
export function engineered(dir) {
  const file = join(dir, SOURCE);
  if (!existsSync(file)) return false;
  try {
    return CORE.includes(JSON.parse(readFileSync(file, "utf8")).name);
  } catch {
    return false;
  }
}

/**
 * Core's catalog of the Engine at `engine`, through the Core installed for `dir`: `listed` with the
 * Capabilities, Agents, Skills and Extensions, or `unresolved` with the reason.
 */
export async function catalogOf(dir, engine) {
  const require = createRequire(join(dir, "package.json"));
  let name;
  let entry;
  for (const candidate of CORE) {
    try {
      entry = require.resolve(candidate);
      name = candidate;
      break;
    } catch {
      // not installed under this name
    }
  }
  if (!entry) return { status: "unresolved", reason: `Core is not installed for this directory (looked for ${CORE.join(" and ")})` };
  let core;
  try {
    core = await import(pathToFileURL(entry).href);
  } catch (e) {
    return { status: "unresolved", reason: `${name} cannot be loaded: ${e.message}` };
  }
  if (typeof core.catalog !== "function") return { status: "unresolved", reason: `${name} does not export Core's catalog` };
  try {
    const { capabilities, agents, skills, extensions } = await core.catalog(engine);
    return { status: "listed", capabilities, agents, skills, extensions };
  } catch (e) {
    return { status: "unresolved", reason: `${name}'s catalog failed: ${e.message}` };
  }
}
