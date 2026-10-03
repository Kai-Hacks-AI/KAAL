// Outer-loop Test Setup. It may not read src/**: the compiler enforces that
// (rootDir is this folder). It consumes the built package through its public
// surface, `import("kaal-core")`, deploys the payload at `root/[name]`, checks
// the Kernel against its genesis seal, and admits Nodes by hash: a file is a
// Node only if its SHA-256 has a marker under `seals/`. Future outer-loop
// tests receive the deployed Nodes and their Markdown chapters, the seams
// from which suites are born.
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { type Chapter, chapters } from "./chapters.js";

export const DEFAULT_NAME = ".kaal";
const KERNEL_PATH = "core/KERNEL.md";
const GENESIS_SEAL = new URL("../../kernel.sha256", import.meta.url);

const sha256 = (bytes: Uint8Array | string): string => createHash("sha256").update(bytes).digest("hex");

export interface DeployedNode {
  /** SHA-256 of the exact bytes: the Node's identity. */
  id: string;
  /** Where this deployment happens to store it; not part of the Node. */
  path: string;
  markdown: string;
  /** The Node's Markdown chapters, in document order. */
  chapters: Chapter[];
  /** The Node's name: its level-1 heading. */
  name: string;
}

export interface Deployed {
  /** Temporary KAAL root, the parent of `[name]`. */
  root: string;
  /** The KAAL directory name; `.kaal` is only the default. */
  name: string;
  /** `root/[name]`. */
  dir: string;
  /** `root/[name]/core/KERNEL.md`: genesis, not a Node. */
  kernelPath: string;
  /** The Kernel's chapters, in document order. */
  chapters: Chapter[];
  /** The deployed Nodes, admitted by their seal markers. */
  nodes: DeployedNode[];
  cleanup: () => void;
}

/** Throws unless the bytes of `file` hash to `seal` (SHA-256, hex). */
export function assertSealed(file: string, seal: string): void {
  if (sha256(readFileSync(file)) !== seal) throw new Error(`${file} does not match its seal`);
}

/**
 * The Nodes deployed in `dir`: every file other than the Kernel and the seal
 * markers must hash to a sealed ID, and every sealed ID must match a file.
 * Where a file lives does not matter.
 */
export function discoverNodes(dir: string): DeployedNode[] {
  const sealed = new Set(readdirSync(join(dir, "seals")));
  const nodes: DeployedNode[] = [];
  for (const path of readdirSync(dir, { recursive: true, encoding: "utf8" }).sort()) {
    if (path === KERNEL_PATH || path === "seals" || path.startsWith("seals/")) continue;
    const file = join(dir, path);
    if (!statSync(file).isFile()) continue;
    const bytes = readFileSync(file);
    const id = sha256(bytes);
    if (!sealed.has(id)) throw new Error(`${path} is neither the Kernel nor a sealed Node`);
    const markdown = bytes.toString("utf8");
    const parts = chapters(markdown);
    nodes.push({ id, path, markdown, chapters: parts, name: parts[0].level === 1 ? parts[0].title : "" });
  }
  for (const id of sealed) {
    if (!nodes.some((n) => n.id === id)) throw new Error(`sealed ID ${id} matches no deployed file`);
  }
  return nodes;
}

/** Materialize the package's payload at `root/[name]/...`, check genesis, admit the Nodes. */
export async function deploy(options: { name?: string } = {}): Promise<Deployed> {
  const name = options.name ?? DEFAULT_NAME;
  const spec = "kaal-core";
  const embedding = (await import(spec)) as { payload: () => Record<string, string> };

  const root = mkdtempSync(join(tmpdir(), "kaal-outer-"));
  const dir = join(root, name);
  for (const [path, content] of Object.entries(embedding.payload())) {
    const file = join(dir, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
  }
  const kernelPath = join(dir, KERNEL_PATH);
  try {
    assertSealed(kernelPath, readFileSync(GENESIS_SEAL, "utf8").trim());
    const nodes = discoverNodes(dir);
    return {
      root,
      name,
      dir,
      kernelPath,
      chapters: chapters(readFileSync(kernelPath, "utf8")),
      nodes,
      cleanup: () => rmSync(root, { recursive: true, force: true }),
    };
  } catch (error) {
    rmSync(root, { recursive: true, force: true });
    throw error;
  }
}
