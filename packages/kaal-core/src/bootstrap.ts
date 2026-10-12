import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { loadEngine, readTree, type Engine } from "./engine.js";
import { KaalError, sha256 } from "./node.js";
import { foundation, payload, type Files } from "./payload.js";

function writeFiles(dir: string, files: Files): void {
  for (const [path, bytes] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), bytes);
  }
}

/**
 * Materialize an Engine from the foundational payload into `dir` (a host's
 * `.kaal/`). A new Engine is written whole into a staging directory beside it
 * and renamed into place, so it appears complete or not at all. An existing
 * directory is completed: payload files it lacks are added, and if any
 * payload path holds other bytes, nothing is written. Running it again
 * changes nothing. Returns the payload paths that were written.
 */
export function bootstrap(dir: string): string[] {
  const files = payload();
  if (!existsSync(dir)) {
    mkdirSync(dirname(dir), { recursive: true });
    const staging = mkdtempSync(join(dirname(dir), `${basename(dir)}.staging-`));
    try {
      writeFiles(staging, files);
      renameSync(staging, dir);
    } catch (e) {
      rmSync(staging, { recursive: true, force: true });
      throw e;
    }
    return Object.keys(files);
  }
  if (!statSync(dir).isDirectory()) throw new KaalError(`${dir} exists and is not a directory`);
  const missing: Files = {};
  for (const [path, bytes] of Object.entries(files)) {
    const file = join(dir, path);
    if (!existsSync(file)) missing[path] = bytes;
    else if (!statSync(file).isFile() || !readFileSync(file).equals(bytes)) throw new KaalError(`${file} exists with other bytes: nothing was written`);
  }
  writeFiles(dir, missing);
  return Object.keys(missing);
}

export interface Verification {
  ok: boolean;
  problems: string[];
  engine: Engine;
}

/**
 * Verify an Engine: the Kernel is present by its exact bytes, the four
 * foundational Nodes are admitted by their exact ids, and every file that
 * claims to be a Node is admitted. Locations are not consulted.
 */
export function verify(dir: string): Verification {
  const problems: string[] = [];
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    problems.push(`${dir} is not an Engine directory`);
    return { ok: false, problems, engine: loadEngine(dir) };
  }
  const files = readTree(dir);
  const f = foundation();
  if (!Object.values(files).some((bytes) => sha256(bytes) === f.kernel)) problems.push(`the Kernel (${f.kernel}) is not present`);
  const engine = loadEngine(dir);
  for (const ref of [f.node, f.definition, f.skill, f.extension]) {
    try {
      engine.resolve(ref);
    } catch {
      problems.push(`foundational Node ${ref.name} (${ref.id}) is not admitted`);
    }
  }
  for (const r of engine.rejected) problems.push(`${r.path}: ${r.reason}`);
  return { ok: problems.length === 0, problems, engine };
}

/** Write the foundational Core payload into `outDir`, which must not exist or be empty. Returns the paths written. */
export function exportPayload(outDir: string): string[] {
  if (existsSync(outDir) && (!statSync(outDir).isDirectory() || readdirSync(outDir).length > 0)) throw new KaalError(`${outDir} exists and is not an empty directory`);
  const files = payload();
  writeFiles(outDir, files);
  return Object.keys(files);
}
