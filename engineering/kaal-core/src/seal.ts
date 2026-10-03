import { createHash } from "node:crypto";

/** A Node's ID: SHA-256, hex, of its exact bytes. No normalization. */
export function sealNode(bytes: string | Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

/** The IDs a payload records as sealed: one marker file `seals/<ID>` each. */
export function sealedIds(files: Record<string, string>): string[] {
  return Object.keys(files)
    .filter((path) => path.startsWith("seals/"))
    .map((path) => path.slice("seals/".length));
}
