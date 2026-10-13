import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { evaluate, loadEngine, makeStaging, readTree, type Engine } from "./engine.js";
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
 * `.kaal/`). The payload is written whole into a staging directory first. A
 * missing directory is created by renaming the staging directory into place,
 * so it appears complete or not at all. An existing empty directory is kept,
 * never removed or replaced (it may be the current directory): the staged
 * files are moved into it, and moved back out if any move fails. An existing
 * Engine is recognized by identity, not layout: if it already verifies (the
 * Kernel present by its exact bytes, the four foundational Nodes admitted by
 * their exact ids, every Node admitted), nothing is written, wherever its
 * files are. Any other existing directory is refused and nothing is written.
 * Returns the paths written.
 */
export function bootstrap(dir: string): string[] {
  const files = payload();
  if (!existsSync(dir)) {
    mkdirSync(dirname(dir), { recursive: true });
    const staging = makeStaging(dirname(dir));
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
  if (readdirSync(dir).length === 0) {
    const staging = makeStaging(dir);
    const moved: string[] = [];
    try {
      writeFiles(staging, files);
      for (const entry of readdirSync(staging)) {
        renameSync(join(staging, entry), join(dir, entry));
        moved.push(entry);
      }
    } catch (e) {
      for (const entry of moved) renameSync(join(dir, entry), join(staging, entry));
      throw e;
    } finally {
      rmSync(staging, { recursive: true, force: true });
    }
    return Object.keys(files);
  }
  const existing = verify(dir);
  if (existing.ok) return [];
  throw new KaalError(`${dir} exists and is not a valid Engine; nothing was written:\n  ${existing.problems.join("\n  ")}`);
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
    return { ok: false, problems, engine: evaluate({}) };
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
