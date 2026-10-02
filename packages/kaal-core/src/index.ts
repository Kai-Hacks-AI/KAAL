import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const name = "kaal-core";

/** Directory, relative to a root, that holds a deployed Kernel. */
export const KERNEL_DIR = ".kaal";

/** The single file that makes a `.kaal` directory recognizably KAAL. */
export const KERNEL_FILE = "kernel.json";

export interface Kernel {
  /** Marker identifying the file as a KAAL Kernel. */
  kaal: "kernel";
  /** Version of the kernel format, not of the package. */
  format: 1;
}

/** The smallest valid Kernel. */
export function kernel(): Kernel {
  return { kaal: "kernel", format: 1 };
}

/** The Kernel payload as files, keyed by path relative to `.kaal`. */
export function payload(): Record<string, string> {
  return { [KERNEL_FILE]: JSON.stringify(kernel(), null, 2) + "\n" };
}

/** Deploy the Kernel into `<root>/.kaal`. Returns the `.kaal` path. */
export function deploy(root: string): string {
  const dir = join(root, KERNEL_DIR);
  mkdirSync(dir, { recursive: true });
  for (const [file, content] of Object.entries(payload())) {
    writeFileSync(join(dir, file), content);
  }
  return dir;
}

/** True when `<root>/.kaal` holds a valid Kernel. */
export function isKernel(root: string): boolean {
  try {
    const k = JSON.parse(readFileSync(join(root, KERNEL_DIR, KERNEL_FILE), "utf8"));
    return k?.kaal === "kernel" && k.format === 1;
  } catch {
    return false;
  }
}
