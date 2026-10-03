// Outer-loop Test Setup. It may not read src/**: the compiler enforces that
// (rootDir is this folder). It consumes the built package through its public
// surface, `import("kaal-core")`, deploys the payload at `root/[name]`, checks
// the Kernel against its genesis seal, and hands over the deployed Nodes (read
// by the provisional helpers, loaded at runtime from helpers/) with their
// Markdown chapters, the seams from which suites are born. It manages no
// graph itself.
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { type Chapter, chapters } from "./chapters.js";

export const DEFAULT_NAME = ".kaal";
const KERNEL_PATH = "core/KERNEL.md";
const GENESIS_SEAL = new URL("../../kernel.sha256", import.meta.url);

const sha256 = (bytes: Uint8Array | string): string => createHash("sha256").update(bytes).digest("hex");

/** The provisional helpers (helpers/nodes.ts), loaded at runtime so this folder never imports engineering source. */
export interface Ref {
  name: string;
  id: string;
}
export interface FoundNode {
  id: string;
  path: string;
  name: string;
  type?: Ref;
  markdown: string;
}
export interface Helpers {
  readNodes: (dir: string) => FoundNode[];
  resolve: (nodes: FoundNode[], ref: Ref) => FoundNode;
}

export interface DeployedNode extends FoundNode {
  /** The Node's Markdown chapters, in document order. */
  chapters: Chapter[];
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
  /** The Nodes in the deployment, recognised by Form. */
  nodes: DeployedNode[];
  /** The IDs recorded as sealed: the markers under `seals/`. */
  sealed: string[];
  helpers: Helpers;
  /** Read the Nodes in the tree again, e.g. after files moved. */
  discover: () => DeployedNode[];
  cleanup: () => void;
}

/** Throws unless the bytes of `file` hash to `seal` (SHA-256, hex). */
export function assertSealed(file: string, seal: string): void {
  if (sha256(readFileSync(file)) !== seal) throw new Error(`${file} does not match its seal`);
}

/** Materialize the package's payload at `root/[name]/...` and check the Kernel's genesis seal. */
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
    const helpers = (await import(new URL("../helpers/nodes.js", import.meta.url).href)) as Helpers;
    const discover = () => helpers.readNodes(dir).map((n) => ({ ...n, chapters: chapters(n.markdown) }));
    return {
      root,
      name,
      dir,
      kernelPath,
      chapters: chapters(readFileSync(kernelPath, "utf8")),
      nodes: discover(),
      sealed: readdirSync(join(dir, "seals")),
      helpers,
      discover,
      cleanup: () => rmSync(root, { recursive: true, force: true }),
    };
  } catch (error) {
    rmSync(root, { recursive: true, force: true });
    throw error;
  }
}
