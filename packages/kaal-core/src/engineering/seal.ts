import { createHash } from "node:crypto";
import { kernelMarkdown } from "../embed/kernel.js";

/** SHA-256 of the Kernel bytes Core produces. `kernel.sha256` holds this value. */
export function kernelSeal(): string {
  return createHash("sha256").update(kernelMarkdown()).digest("hex");
}
