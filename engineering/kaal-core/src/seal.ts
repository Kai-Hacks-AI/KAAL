import { createHash } from "node:crypto";

/** SHA-256, hex, of exact bytes. No normalization. A Node's ID is the SHA of its bytes. */
export function sealNode(bytes: string | Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}
