import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

/** Where a BRAIN is created by default: a `brain/` module whose learning is `brain/learning`, the default ROOT. */
export const BRAIN_DIR = "brain";

/** The BRAIN module's own entry point: it routes agents working in BRAIN to this skill. */
export const BRAIN_AGENTS_MD = "# BRAIN\n\nUse the `using-brain` skill when working with BRAIN.\n";

/**
 * Creates the initial BRAIN module at `dir`: `AGENTS.md`, routing BRAIN work
 * to this skill, and an empty `learning/`, where nodes are born. Refuses when
 * `dir` already exists, so an existing BRAIN is never overwritten; a failure
 * partway removes what this call created. Returns the learning root.
 */
export function createBrain(dir = BRAIN_DIR): string {
  try {
    // Not recursive: an existing directory, even an empty one, is refused.
    fs.mkdirSync(dir);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "EEXIST")
      throw new Error(`${dir}: already exists; refusing to create a BRAIN over it`);
    throw e;
  }
  const learning = path.join(dir, "learning");
  try {
    fs.writeFileSync(path.join(dir, "AGENTS.md"), BRAIN_AGENTS_MD, { flag: "wx" });
    fs.mkdirSync(learning);
  } catch (e) {
    fs.rmSync(dir, { recursive: true, force: true });
    throw e;
  }
  return learning;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [dir = BRAIN_DIR, ...rest] = process.argv.slice(2);
  if (rest.length) {
    console.error("usage: create-brain.ts [dir]");
    process.exitCode = 2;
  } else {
    try {
      createBrain(dir);
    } catch (e) {
      console.error(e instanceof Error ? e.message : String(e));
      process.exitCode = 1;
    }
  }
}
