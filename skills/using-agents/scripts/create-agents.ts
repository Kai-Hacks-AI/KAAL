import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Creates the Agent entry point for `scope`: `<scope>/AGENTS.md`, holding
 * exactly the guidance the using system supplies. This skill knows nothing of
 * what the guidance says; it only places it. Refuses when `scope` is not an
 * existing directory, when the guidance is empty, and when `<scope>/AGENTS.md`
 * already exists, so an entry point is never overwritten. A failure after
 * creating `<scope>/AGENTS.md` removes it again, so a failed call leaves the
 * scope as it was; only the file this call created is ever removed, never one
 * put in its place meanwhile. Returns its path.
 */
export function createAgents(scope: string, guidance: string): string {
  const stat = fs.lstatSync(scope, { throwIfNoEntry: false });
  if (!stat?.isDirectory()) throw new Error(`${scope}: scope must be an existing directory`);
  if (!guidance.trim()) throw new Error(`${scope}: guidance is empty`);
  const file = path.join(scope, "AGENTS.md");
  let fd: number;
  try {
    // Exclusive: only a file this call creates is ever opened for writing.
    fd = fs.openSync(file, "wx");
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "EEXIST")
      throw new Error(`${file}: already exists; refusing to overwrite it`);
    throw e;
  }
  // The identity of the file this call created, to recognise it on failure.
  let created: fs.BigIntStats | undefined;
  try {
    created = fs.fstatSync(fd, { bigint: true });
    fs.writeFileSync(fd, guidance);
    fs.closeSync(fd);
  } catch (e) {
    // Close it (Windows cannot remove an open file), then remove it only if
    // the path still names this call's own file.
    try {
      fs.closeSync(fd);
    } catch {
      // Already closed, or closing is what failed.
    }
    const now = fs.lstatSync(file, { bigint: true, throwIfNoEntry: false });
    if (created && now && now.dev === created.dev && now.ino === created.ino) fs.rmSync(file);
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
