import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Creates the Agent entry point for `scope`: `<scope>/AGENTS.md`, holding
 * exactly the guidance the using system supplies. This skill knows nothing of
 * what the guidance says; it only places it. Refuses when `scope` is not an
 * existing directory, when the guidance is empty, and when `<scope>/AGENTS.md`
 * already exists, so an entry point is never overwritten. Returns its path.
 */
export function createAgents(scope: string, guidance: string): string {
  const stat = fs.lstatSync(scope, { throwIfNoEntry: false });
  if (!stat?.isDirectory()) throw new Error(`${scope}: scope must be an existing directory`);
  if (!guidance.trim()) throw new Error(`${scope}: guidance is empty`);
  const file = path.join(scope, "AGENTS.md");
  try {
    fs.writeFileSync(file, guidance, { flag: "wx" });
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "EEXIST")
      throw new Error(`${file}: already exists; refusing to overwrite it`);
    throw e;
  }
  return file;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [scope, guidanceFile, ...rest] = process.argv.slice(2);
  if (!scope || !guidanceFile || rest.length) {
    console.error("usage: create-agents.ts <scope> <guidance-file>");
    process.exitCode = 2;
  } else {
    try {
      createAgents(scope, fs.readFileSync(guidanceFile, "utf8"));
    } catch (e) {
      console.error(e instanceof Error ? e.message : String(e));
      process.exitCode = 1;
    }
  }
}
