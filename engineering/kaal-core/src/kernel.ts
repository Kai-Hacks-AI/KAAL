// Engineering's view of the Kernel: only what the built Embedding package
// exposes publicly. Embedding never depends on anything in this folder.
import { payload } from "kaal-core";

/** Where the Kernel is deployed, relative to the KAAL directory. */
export const KERNEL_PATH = "core/KERNEL.md";

/** The Kernel bytes, as an embedder gets them from `payload()`. */
export function kernelMarkdown(): string {
  return payload()[KERNEL_PATH];
}
