export const name = "kaal-core";

/** Path of the Kernel's one file, relative to the `.kaal` directory it belongs in. */
export const KERNEL_FILE = "kernel.json";

export interface Kernel {
  /** Marker identifying the file as a KAAL Kernel. */
  kaal: "kernel";
}

/** The smallest valid Kernel. */
export function kernel(): Kernel {
  return { kaal: "kernel" };
}

/** The Kernel payload as files, keyed by path relative to `.kaal`. */
export function payload(): Record<string, string> {
  return { [KERNEL_FILE]: JSON.stringify(kernel(), null, 2) + "\n" };
}
