// Outer-loop Test Setup. It may not read src/**: the compiler enforces that
// (rootDir is this folder). It consumes the built package through its public
// surface, `import("kaal-core")`, and independently checks the deployed
// Node bytes against the seal deployed beside them. Future outer-loop tests receive
// only the deployed artifact and its Markdown chapters, the seams from which
// outer-loop suites are organized.
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { type Chapter, chapters } from "./chapters.js";

export const DEFAULT_NAME = ".kaal";
const KERNEL_PATH = "core/KERNEL.md";
const SEAL_PATH = `seals/${KERNEL_PATH}.sha256`;

export interface DeployedKernel {
  /** Temporary KAAL root, the parent of `[name]`. */
  root: string;
  /** The KAAL directory name; `.kaal` is only the default. */
  name: string;
  /** `root/[name]`. */
  dir: string;
  /** `root/[name]/core/KERNEL.md`. */
  kernelPath: string;
  /** `root/[name]/seals/core/KERNEL.md.sha256`: evidence for Node 1, not a Node. */
  sealPath: string;
  /** The sealed Kernel's chapters, in document order, from its own headings. */
  chapters: Chapter[];
  /** The first chapter with this heading text; throws if there is none. */
  chapter: (title: string) => Chapter;
  cleanup: () => void;
}

/** Throws unless the bytes of `file` hash to `seal` (SHA-256, hex). */
export function assertSealed(file: string, seal: string): void {
  const actual = createHash("sha256").update(readFileSync(file)).digest("hex");
  if (actual !== seal) throw new Error(`${file} does not match its seal`);
}

/** Materialize the package's payload at `root/[name]/...` and check Node 1 against its deployed seal. */
export async function deployKernel(options: { name?: string } = {}): Promise<DeployedKernel> {
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
  const sealPath = join(dir, SEAL_PATH);
  try {
    assertSealed(kernelPath, readFileSync(sealPath, "utf8").trim());
  } catch (error) {
    rmSync(root, { recursive: true, force: true });
    throw error;
  }
  const kernelChapters = chapters(readFileSync(kernelPath, "utf8"));
  const chapter = (title: string): Chapter => {
    const found = kernelChapters.find((c) => c.title === title);
    if (!found) throw new Error(`The sealed Kernel has no chapter "${title}"`);
    return found;
  };
  return {
    root,
    name,
    dir,
    kernelPath,
    sealPath,
    chapters: kernelChapters,
    chapter,
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
}
