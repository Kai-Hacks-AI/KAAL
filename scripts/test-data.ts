// Loads named test data from ../test-data so test cases hold no data themselves.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
