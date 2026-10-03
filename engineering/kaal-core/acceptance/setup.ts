// Outer-loop Test Setup. It may not read src/**: the compiler enforces that
// (rootDir is this folder). It consumes the built package through its public
// surface, `import("kaal-core")`, and independently checks the deployed
// Kernel bytes against the committed seal. Future outer-loop tests receive
// only the deployed artifact.
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

export const DEFAULT_NAME = ".kaal";
const KERNEL_PATH = "core/KERNEL.md";
const SEAL_FILE = new URL("../../kernel.sha256", import.meta.url);

export interface DeployedKernel {
  /** Temporary KAAL root, the parent of `[name]`. */
  root: string;
  /** The KAAL directory name; `.kaal` is only the default. */
  name: string;
  /** `root/[name]`. */
  dir: string;
  /** `root/[name]/core/KERNEL.md`. */
  kernelPath: string;
  cleanup: () => void;
}

/** Throws unless the bytes of `file` hash to `seal` (SHA-256, hex). */
export function assertSealed(file: string, seal: string): void {
  const actual = createHash("sha256").update(readFileSync(file)).digest("hex");
  if (actual !== seal) throw new Error(`${file} does not match the Kernel seal`);
}

/** Materialize the package's payload at `root/[name]/...` and check the seal. */
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
  try {
    assertSealed(kernelPath, readFileSync(SEAL_FILE, "utf8").trim());
  } catch (error) {
    rmSync(root, { recursive: true, force: true });
    throw error;
  }
  return { root, name, dir, kernelPath, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}
