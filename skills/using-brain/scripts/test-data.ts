// Loads named test data from ../test-data so test cases hold no data themselves.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import type { CreateNode } from "./create-node.js";

const DATA = fileURLToPath(new URL("../test-data/", import.meta.url));

/** Path to a single node file in test-data/nodes. */
export function nodeData(name: string): string {
  return path.join(DATA, "nodes", `${name}.md`);
}

/** Path to a read-only BRAIN in test-data/brains. */
export function brainData(name: string): string {
  return path.join(DATA, "brains", name);
}

/** A writable copy of a BRAIN from test-data/brains, or an empty BRAIN when no name is given. */
export function scratchBrain(name?: string): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "brain-"));
  if (name) fs.cpSync(brainData(name), root, { recursive: true });
  return root;
}

/** A createNode input from test-data/births.yaml, placed in `root`. */
export function birth(name: string, root: string): CreateNode {
  const births = YAML.parse(fs.readFileSync(path.join(DATA, "births.yaml"), "utf8")) as Record<string, CreateNode>;
  if (!births[name]) throw new Error(`no birth named ${name}`);
  return { ...births[name], root };
}

/** Contents of an expected output file in test-data/expected. */
export function expected(name: string): string {
  return fs.readFileSync(path.join(DATA, "expected", `${name}.md`), "utf8");
}

/**
 * An empty BRAIN whose `genesis` lineage is a symlink to a directory outside it.
 * "resolving" points at an existing directory; "dangling" at one that does not
 * exist yet. Built at run time because a symlink leaving the repo cannot be
 * committed as test data.
 */
export function symlinkedBrain(kind: "resolving" | "dangling"): { root: string; outside: string } {
  const root = scratchBrain();
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), "brain-outside-"));
  const target = kind === "resolving" ? outside : path.join(outside, "not-yet");
  fs.symlinkSync(target, path.join(root, "genesis"), "dir");
  return { root, outside };
}

/** Every file under a BRAIN by identity, with its contents, for comparing whole BRAINs byte for byte. */
export function brainTree(root: string): Record<string, string> {
  return Object.fromEntries(
    fs
      .readdirSync(root, { recursive: true, withFileTypes: true })
      .filter((e) => e.isFile())
      .map((e) => path.join(e.parentPath, e.name))
      .sort()
      .map((f) => [path.relative(root, f).split(path.sep).join("/"), fs.readFileSync(f, "utf8")]),
  );
}
