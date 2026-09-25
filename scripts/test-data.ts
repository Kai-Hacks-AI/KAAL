// Loads named test data from ../test-data so test cases hold no data themselves.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { io } from "../skills/using-seals/scripts/seals.js";

const DATA = fileURLToPath(new URL("../test-data/", import.meta.url));

/** Path to a read-only BRAIN in test-data/brains. */
export function brainData(name: string): string {
  return path.join(DATA, "brains", name);
}

/** A writable copy of a BRAIN from test-data/brains. */
export function scratchBrain(name: string): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "kaal-seals-"));
  fs.cpSync(brainData(name), root, { recursive: true });
  return root;
}

/** A `git diff --name-status --no-renames` output from test-data/diffs. */
export function diffData(name: string): string {
  return fs.readFileSync(path.join(DATA, "diffs", `${name}.txt`), "utf8");
}

/** Every file under a root by posix path, with its contents, for byte-for-byte comparison. */
export function tree(root: string): Record<string, string> {
  return Object.fromEntries(
    fs
      .readdirSync(root, { recursive: true, withFileTypes: true })
      .filter((e) => e.isFile())
      .map((e) => path.join(e.parentPath, e.name))
      .sort()
      .map((f) => [path.relative(root, f).split(path.sep).join("/"), fs.readFileSync(f, "utf8")]),
  );
}

/**
 * Runs `run` while writing the seal of `unit` (a learning, as a posix path
 * within the BRAIN) fails, as a full disk would. Simulated through the
 * using-seals io seam, because such failures cannot be produced the same way
 * on every platform.
 */
export function withSealWriteFailure<T>(unit: string, run: () => T): T {
  const real = io.writeFileSync;
  io.writeFileSync = ((file: fs.PathOrFileDescriptor, ...rest: unknown[]) => {
    if (String(file).split(path.sep).join("/").endsWith(`/${unit}/seal.json`))
      throw new Error("simulated write failure");
    return (real as (...args: unknown[]) => void)(file, ...rest);
  }) as typeof io.writeFileSync;
  try {
    return run();
  } finally {
    io.writeFileSync = real;
  }
}
