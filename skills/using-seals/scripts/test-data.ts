// Loads named test data from ../test-data so test cases hold no data themselves.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DATA = fileURLToPath(new URL("../test-data/", import.meta.url));

/** The name and units of every chain in test-data/chains, oldest first. */
export const CHAIN = "chain";
export const UNITS = ["one", "two"];

/** A chain name that is not lowercase kebab-case. */
export const INVALID_CHAIN = "Not A Chain";

/** The units of test-data/chains/unit-renamed: unit "one" renamed to "zero" after sealing. */
export const RENAMED_UNITS = ["zero", "two"];

/**
 * Unit lists a chain must refuse before reading or writing anything, by name:
 * paths that could leave the root, non-canonical spellings of a unit, a unit
 * listed twice or differing only in case, and a unit nested in another.
 */
export const UNSAFE_UNITS: Record<string, string[]> = {
  traversal: ["../outside"],
  absolute: ["/outside"],
  backslash: ["one\\nested"],
  "dot-segment": ["./one"],
  "trailing-slash": ["one/"],
  duplicate: ["one", "two", "one"],
  "case-alias": ["one", "ONE"],
  nested: ["one", "one/nested"],
};

/** Path to a read-only chain in test-data/chains. */
export function chainData(name: string): string {
  return path.join(DATA, "chains", name);
}

/** A writable copy of a chain from test-data/chains. */
export function scratchChain(name: string): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "seals-"));
  fs.cpSync(chainData(name), root, { recursive: true });
  return root;
}

/**
 * The open chain with a third unit that holds nothing. Built at run time
 * because git cannot commit an empty directory.
 */
export function chainWithEmptyUnit(): { root: string; units: string[] } {
  const root = scratchChain("open");
  fs.mkdirSync(path.join(root, "three"));
  return { root, units: [...UNITS, "three"] };
}

/**
 * The given chain with a symlink inside unit "one". Built at run time because
 * a symlink cannot be committed portably.
 */
export function chainWithSymlink(name: string): string {
  const root = scratchChain(name);
  fs.symlinkSync(path.join(root, "two", "c.txt"), path.join(root, "one", "link.txt"));
  return root;
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
 * The open chain with unit "one" replaced by a symlink to a directory outside
 * the root. Built at run time because a symlink cannot be committed portably.
 */
export function chainWithSymlinkedUnit(): { root: string; outside: string } {
  const root = scratchChain("open");
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), "seals-outside-"));
  fs.cpSync(path.join(root, "one"), outside, { recursive: true });
  fs.rmSync(path.join(root, "one"), { recursive: true });
  fs.symlinkSync(outside, path.join(root, "one"), "dir");
  return { root, outside };
}
